import { useState, useEffect, useCallback, useRef } from 'react';
import { CONFIG } from '../config/constants';


// ─── Types ───────────────────────────────────────────────────────────

export interface DeviationRecord {
  id: string;
  session_id: string;
  decision_id: string | null;
  compliant_action_id: string | null;
  deviation_type: string;
  deviation_family: string;
  costability: string;
  severity: string;
  candidate_cost: number | null;
  finalized_cost: number | null;
  unauthorized_gain: number | null;
  price_delta: number | null;
  detected_at: number;
  finalized_at: number | null;
  explainability_payload: any | null;
}

export interface DeviationSummary {
  session_id: string;
  playbook_id: string;
  total_deviation_cost: number;
  total_unauthorized_gain: number;
  trade_count: number;
  deviation_count: number;
  pending_finalization: number;
  deviations_by_type: Record<string, number>;
  deviations_by_family: Record<string, number>;
}

export interface DeviationResult {
  decision: any;
  match: {
    is_matched: boolean;
    timing_class: string;
    matched_action_id: string | null;
    time_delta_ms: number | null;
  };
  deviations: DeviationRecord[];
  finalized: DeviationRecord[];
  position: {
    new_lots: any[];
    closed_slices: number;
    open_position_qty: number;
  };
  session_totals: {
    total_deviation_cost: number;
    total_unauthorized_gain: number;
    trade_count: number;
    deviation_count: number;
    pending_finalization: number;
  };
}

// ─── Hook ────────────────────────────────────────────────────────────

const DEVIATION_ENGINE_API = CONFIG.DEVIATION_ENGINE_BASE_URL;
const DEVIATION_ENGINE_WS = CONFIG.DEVIATION_ENGINE_WS_URL;

export function useDeviationEngine(sessionId: string | null | undefined) {
  const [summary, setSummary] = useState<DeviationSummary | null>(null);
  const [records, setRecords] = useState<DeviationRecord[]>([]);
  const [latestResult, setLatestResult] = useState<DeviationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!sessionId || !DEVIATION_ENGINE_API) return;
    try {
      const res = await fetch(`${DEVIATION_ENGINE_API}/deviations/session/${sessionId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setError(null);
      }
    } catch (err) {
      // Silently fail — engine might not be running yet
    }
  }, [sessionId]);

  const fetchRecords = useCallback(async () => {
    if (!sessionId || !DEVIATION_ENGINE_API) return;
    try {
      const res = await fetch(`${DEVIATION_ENGINE_API}/deviations/session/${sessionId}/records`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch {
      // Silently fail
    }
  }, [sessionId]);

  const processDeviationMessage = useCallback((data: DeviationResult) => {
    setLatestResult(data);
    if (data.deviations && data.deviations.length > 0) {
      setRecords(prev => {
        const next = [...prev];
        data.deviations.forEach(dev => {
          const idx = next.findIndex(r => r.id === dev.id);
          if (idx > -1) {
            next[idx] = dev;
          } else {
            next.push(dev);
          }
        });
        return next;
      });
    }
    if (data.session_totals) {
      setSummary(prev => prev ? {
        ...prev,
        total_deviation_cost: data.session_totals.total_deviation_cost,
        total_unauthorized_gain: data.session_totals.total_unauthorized_gain,
        trade_count: data.session_totals.trade_count,
        deviation_count: data.session_totals.deviation_count,
        pending_finalization: data.session_totals.pending_finalization,
      } : null);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setSummary(null);
      setRecords([]);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    if (!DEVIATION_ENGINE_API || !DEVIATION_ENGINE_WS) {
      setError('Deviation engine is not configured. Set VITE_DEVIATION_ENGINE_BASE_URL in the frontend environment.');
      return;
    }

    // Initial fetch
    fetchSummary();
    fetchRecords();

    // WebSocket connection for real-time updates
    const connectWs = () => {
      const ws = new WebSocket(`${DEVIATION_ENGINE_WS}?session_id=${sessionId}`);
      
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'deviation_result' && payload.data) {
            processDeviationMessage(payload.data);
          }
        } catch (e) {
          console.error("Failed to parse deviation WS message", e);
        }
      };
      
      ws.onclose = () => {
        // Reconnect after 3s
        setTimeout(() => connectWs(), 3000);
      };
      
      wsRef.current = ws;
    };
    
    connectWs();

    // Fallback polling for summary updates
    pollRef.current = window.setInterval(() => {
      fetchSummary();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [sessionId, fetchSummary, fetchRecords, processDeviationMessage]);

  return {
    summary,
    records,
    latestResult,
    error,
    refreshSummary: fetchSummary,
    refreshRecords: fetchRecords,
  };
}

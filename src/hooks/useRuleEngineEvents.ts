import { useState, useEffect, useRef, useCallback } from 'react';
import { RuleEngineRawMessage, RuleEngineEvent } from '../domain/ruleEngine/types';
import { generateMockEvent } from '../domain/ruleEngine/mockGenerator';
import { CONFIG } from '../config/constants';

/**
 * Hook to connect to the Rule Engine WebSocket and manage event stream.
 * Optimized for production with exponential backoff retries and dependency gating.
 */
export function useRuleEngineEvents(isActive: boolean = false) {
  const [events, setEvents] = useState<RuleEngineEvent[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);

  const toggleMockMode = useCallback(() => {
    setIsMockMode(prev => !prev);
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  const connect = useCallback(() => {
    if (wsRef.current || !isActive || isMockMode) return;

    try {
      const ws = new WebSocket(CONFIG.WS_ENGINE_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[useRuleEngineEvents] Connected to stream.');
        setIsConnected(true);
        retryCountRef.current = 0; // Reset on success
      };

      ws.onmessage = (msg) => {
        try {
          const rawData: RuleEngineRawMessage = JSON.parse(msg.data);
          const date = new Date(rawData.timestamp);
          
          setEvents(prev => [...prev, {
            ...rawData,
            id: crypto.randomUUID(),
            timestamp: Math.floor(date.getTime() / 1000),
            msTimestamp: date.getTime(),
            originalTimestamp: rawData.timestamp,
            rawRule: rawData.rule,
          }]);
        } catch (err) {
          console.error('[useRuleEngineEvents] Parse error:', err);
        }
      };

      ws.onclose = (ev) => {
        setIsConnected(false);
        wsRef.current = null;
        
        // Exponential backoff retry if session is still active and not a clean close
        if (isActive && !ev.wasClean) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          console.warn(`[useRuleEngineEvents] Disconnected. Retrying in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            retryCountRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (err) => {
        console.error('[useRuleEngineEvents] WebSocket error:', err);
        ws.close();
      };

    } catch (err) {
      console.error('[useRuleEngineEvents] Connection failed:', err);
    }
  }, [isActive, isMockMode]);

  useEffect(() => {
    // 1. Teardown & Isolation
    if (wsRef.current) wsRef.current.close();
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    setIsConnected(false);
    
    // Clear old events when a new session starts
    if (isActive) {
      setEvents([]);
    }

    // 2. Mocking logic
    if (isMockMode) {
      const devInterval = setInterval(() => {
        setEvents(prev => [...prev, generateMockEvent(prev.length > 0 ? prev[prev.length - 1].price : 71500, true)]);
      }, 2500);

      const adhInterval = setInterval(() => {
        setEvents(prev => [...prev, generateMockEvent(prev.length > 0 ? prev[prev.length - 1].price : 71500, false)]);
      }, 60000);

      return () => {
        clearInterval(devInterval);
        clearInterval(adhInterval);
      };
    }

    // 3. Connection logic
    if (isActive) {
      connect();
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isActive, isMockMode, connect]);

  return { events, isMockMode, toggleMockMode, isConnected, clearEvents };
}

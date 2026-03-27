import { useEffect, useState } from 'react';
import { Session, SessionEvent, SessionEventType } from '../domain/session/types';
import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { usePriceChart } from '../hooks/usePriceChart';
import { useDerivedSignals } from '../hooks/useDerivedSignals';
import { BackendMarketDataProvider } from '../marketdata/providers/backend';
import { MarkerLayer } from './chart/MarkerLayer';
import { Candle } from '../marketdata/types';
import { playbookApi } from '../domain/playbook/api';

interface ReplayChartProps {
  session: Session;
  events: SessionEvent[];
  onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
}

/**
 * ReplayChart
 * 
 * Specifically designed to recreate the historical market state for a session.
 * Fetches the exact price action range and overlays rule events from the replay stream.
 */
export function ReplayChart({ session, events, onMarkerClick }: ReplayChartProps) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState('BTC/USD');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Resolve symbol from the playbook context
        try {
            const pb = await playbookApi.getPlaybook(session.playbook_id);
            if (pb.original_nl_input?.toLowerCase().includes('eth')) setSymbol('ETH/USD');
            else if (pb.original_nl_input?.toLowerCase().includes('btc')) setSymbol('BTC/USD');
        } catch (e) {
            console.warn("[ReplayChart] Failed to fetch playbook for symbol lookup, defaulting to BTC/USD");
        }

        // 2. Fetch market data for exactly the duration of the session
        // Note: Backend endpoint enhancement requested to support these parameters.
        const history = await BackendMarketDataProvider.getHistory(symbol, 60, {
          start_time: session.start_time,
          end_time: session.end_time || new Date().toISOString()
        });
        setCandles(history);
      } catch (err) {
        console.error("[ReplayChart] Failed to load replay market data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session.id, symbol, session.playbook_id, session.start_time, session.end_time]);

  // Translate SessionEvents back to RuleEngineEvents so we can reuse the PriceChart visualization logic
  const ruleEvents: RuleEngineEvent[] = events
    .filter(e => e.type === SessionEventType.ADHERENCE || e.type === SessionEventType.DEVIATION)
    .map(e => {
        const ts = new Date(e.timestamp).getTime();
        return {
          id: e.id,
          timestamp: Math.floor(ts / 1000),
          msTimestamp: ts,
          originalTimestamp: e.timestamp,
          price: e.tick || 0,
          playbook_id: session.playbook_id,
          session_id: session.id,
          user_id: session.user_id,
          rule: (e.event_data?.rule_id as string) || 'unknown',
          rule_triggered: e.type === SessionEventType.ADHERENCE,
          triggered_entries: [],
          rule_evaluations: {},
          rawRule: {},
          action: true,
          deviation: e.type === SessionEventType.DEVIATION,
        };
    });

  const { ema9 } = useDerivedSignals(candles, null);

  const {
    chartContainerRef,
    markers
  } = usePriceChart(ruleEvents, candles, null, ema9, null, false);

  if (loading) return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      backgroundColor: '#ffffff' 
    }}>
        <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em' }}>
            REHYDRATING MARKET ESTATE...
        </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, flex: 1 }}>
      <div 
        ref={chartContainerRef} 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
      />
      <MarkerLayer markers={markers} onMarkerClick={onMarkerClick} />
    </div>
  );
}

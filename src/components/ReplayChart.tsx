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

  const resolveReplaySymbol = (playbook: Awaited<ReturnType<typeof playbookApi.getPlaybook>> | null, replayEvents: SessionEvent[]) => {
    const playbookSymbol = typeof playbook?.symbol === 'string'
      ? playbook.symbol
      : typeof playbook?.context?.symbol === 'string'
        ? playbook.context.symbol
        : null;

    if (playbookSymbol) return playbookSymbol;

    const symbolFromEvents = replayEvents
      .map((event) => event.event_data?.symbol)
      .find((value): value is string => typeof value === 'string' && value.length > 0);

    if (symbolFromEvents) return symbolFromEvents;

    // Temporary fallback until the explicit playbook symbol lands everywhere.
    if (playbook?.original_nl_input?.toLowerCase().includes('eth')) return 'ETH/USD';
    if (playbook?.original_nl_input?.toLowerCase().includes('btc')) return 'BTC/USD';
    return 'BTC/USD';
  };

  const extractNumericValue = (event: SessionEvent): number | null => {
    const candidates = [
      event.event_data?.price,
      event.event_data?.filled_avg_price,
      event.event_data?.last_price,
      event.event_data?.close,
      event.event_data?.value,
      event.tick,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
      if (typeof candidate === 'string') {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) return parsed;
      }
    }

    return null;
  };

  const getNearestCandle = (timestampMs: number, replayCandles: Candle[]) => {
    if (replayCandles.length === 0) return null;

    const targetSeconds = Math.floor(timestampMs / 1000);
    let nearest = replayCandles[0];
    let smallestDistance = Math.abs(Number(nearest.time) - targetSeconds);

    for (const candle of replayCandles) {
      const distance = Math.abs(Number(candle.time) - targetSeconds);
      if (distance < smallestDistance) {
        nearest = candle;
        smallestDistance = distance;
      }
    }

    return nearest;
  };

  const deriveRuleEngineEvents = (replayEvents: SessionEvent[], replayCandles: Candle[]): RuleEngineEvent[] =>
    replayEvents
      .filter((event) => event.type === SessionEventType.ADHERENCE || event.type === SessionEventType.DEVIATION)
      .map((event) => {
        const msTimestamp = new Date(event.timestamp).getTime();
        const nearestCandle = getNearestCandle(msTimestamp, replayCandles);
        const extractedPrice = extractNumericValue(event);
        const price = extractedPrice ?? nearestCandle?.close ?? 0;
        const ruleName =
          (typeof event.event_data?.rule === 'string' && event.event_data.rule) ||
          (typeof event.event_data?.rule_name === 'string' && event.event_data.rule_name) ||
          (typeof event.event_data?.summary === 'string' && event.event_data.summary) ||
          (typeof event.event_data?.rule_id === 'string' && event.event_data.rule_id) ||
          event.type;
        const ruleId =
          (typeof event.event_data?.rule_id === 'string' && event.event_data.rule_id) ||
          (typeof event.event_data?.rule === 'string' && event.event_data.rule) ||
          event.id;
        const deviation = event.type === SessionEventType.DEVIATION;

        return {
          id: event.id,
          timestamp: Math.floor(msTimestamp / 1000),
          msTimestamp,
          originalTimestamp: event.timestamp,
          price,
          playbook_id: session.playbook_id,
          session_id: session.id,
          user_id: session.user_id,
          rule: ruleName,
          rule_triggered: !deviation,
          triggered_entries: ruleId ? [ruleId] : [],
          rule_evaluations: {},
          rawRule: event.event_data,
          action: true,
          deviation,
          deviation_true: deviation ? [ruleId] : [],
          deviation_false: deviation ? [] : [ruleId],
        };
      });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let resolvedPlaybook = null;
        try {
          resolvedPlaybook = await playbookApi.getPlaybook(session.playbook_id);
        } catch (e) {
          console.warn('[ReplayChart] Failed to fetch playbook for replay hydration, using event fallback.');
        }

        const resolvedSymbol = resolveReplaySymbol(resolvedPlaybook, events);

        const history = await BackendMarketDataProvider.getHistory(resolvedSymbol, 60, {
          start_time: session.start_time,
          end_time: session.end_time || new Date().toISOString(),
        });
        setCandles(history);
      } catch (err) {
        console.error('[ReplayChart] Failed to load replay market data', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [events, session.end_time, session.playbook_id, session.start_time]);

  const ruleEvents = deriveRuleEngineEvents(events, candles);

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

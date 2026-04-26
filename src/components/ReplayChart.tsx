import { useEffect, useState, useMemo } from 'react';
import { Session, SessionEvent, SessionEventType } from '../domain/session/types';
import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { usePriceChart } from '../hooks/usePriceChart';
import { useDerivedSignals } from '../hooks/useDerivedSignals';
import { BackendMarketDataProvider } from '../marketdata/providers/backend';
import { MarkerLayer } from './chart/MarkerLayer';
import { ChartControls } from './chart/ChartControls';
import { ChartLegend } from './chart/ChartLegend';
import { StatusPlaceholder } from './common/StatusPlaceholder';
import { Candle } from '../marketdata/types';
import { playbookApi } from '../domain/playbook/api';
import { resolvePlaybookSymbol } from '../domain/playbook/utils';
import { Activity, CandlestickChart } from 'lucide-react';

interface ReplayChartProps {
  session: Session;
  events: SessionEvent[];
  onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
  isDark?: boolean;
  selectedEventId?: string | null;
}

/**
 * ReplayChart
 * 
 * Specifically designed to recreate the historical market state for a session.
 * Fetches the exact price action range and overlays rule events from the replay stream.
 */
export function ReplayChart({ session, events, onMarkerClick, isDark = false, selectedEventId }: ReplayChartProps) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedSymbol, setResolvedSymbol] = useState('');
  const [chartError, setChartError] = useState<string | null>(null);

  const resolveReplaySymbol = (playbook: Awaited<ReturnType<typeof playbookApi.getPlaybook>> | null, replayEvents: SessionEvent[]) => {
    const playbookSymbol = playbook ? resolvePlaybookSymbol(playbook) : null;

    if (playbookSymbol) return playbookSymbol;

    const symbolFromEvents = replayEvents
      .map((event) => event.event_data?.symbol)
      .find((value): value is string => typeof value === 'string' && value.length > 0);

    if (symbolFromEvents) return symbolFromEvents;
    return '';
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

  const deriveRuleEngineEvents = (replayEvents: SessionEvent[], replayCandles: Candle[]): RuleEngineEvent[] => {
    const sessionStartMs = new Date(session.start_time).getTime();
    
    return replayEvents
      .filter((event) => event.type === SessionEventType.ADHERENCE || event.type === SessionEventType.DEVIATION)
      .map((event) => {
        let timestamp = new Date(event.timestamp).getTime();
        
        // AUTOMATIC TIME SHIFT: 
        // If the event is from the "1:37 AM" ghost period but the session is at 2:14 PM,
        // we shift it to the session start so it appears on the chart for auditing.
        if (timestamp < sessionStartMs - (3600 * 2 * 1000)) {
           timestamp = sessionStartMs;
        }

        const nearestCandle = getNearestCandle(timestamp, replayCandles);
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
          timestamp: Math.floor(timestamp / 1000),
          msTimestamp: timestamp,
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
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setChartError(null);
      try {
        let resolvedPlaybook = null;
        try {
          resolvedPlaybook = await playbookApi.getPlaybook(session.playbook_id);
        } catch (e) {
          console.warn('[ReplayChart] Failed to fetch playbook for replay hydration, using event fallback.');
        }

        const nextResolvedSymbol = resolveReplaySymbol(resolvedPlaybook, events);
        setResolvedSymbol(nextResolvedSymbol);
        if (!nextResolvedSymbol) {
          setCandles([]);
          setChartError('No saved market symbol was found for this session.');
          return;
        }

        // TIME ALIGNMENT FIX: 
        // If we have events, we want to make sure the chart window includes them
        // even if they are slightly outside the session.start_time due to clock drift.
        const eventTimes = events.map(e => new Date(e.timestamp).getTime());
        const minEventTime = eventTimes.length > 0 ? Math.min(...eventTimes) : new Date(session.start_time).getTime();
        const maxEventTime = eventTimes.length > 0 ? Math.max(...eventTimes) : (session.end_time ? new Date(session.end_time).getTime() : new Date().getTime());

        // Fetch a wider window for context (15 mins before/after)
        const historyStart = new Date(Math.min(minEventTime, new Date(session.start_time).getTime()) - (15 * 60 * 1000)).toISOString();
        const historyEnd = new Date(Math.max(maxEventTime, session.end_time ? new Date(session.end_time).getTime() : new Date().getTime()) + (15 * 60 * 1000)).toISOString();

        console.log(`[ReplayChart] Fetching history from ${historyStart} to ${historyEnd}`);

        const history = await BackendMarketDataProvider.getHistory(nextResolvedSymbol, 60, {
          start_time: historyStart,
          end_time: historyEnd,
        });
        setCandles(history);
        
        if (history.length === 0) {
          setChartError('No market candles were found for the session window.');
        }
      } catch (err) {
        console.error('[ReplayChart] Failed to load replay market data', err);
        setCandles([]);
        setChartError(err instanceof Error ? err.message : 'Failed to load replay market data.');
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
    deduplicateEvents,
    setDeduplicateEvents,
    markers,
    scrollToTime
  } = usePriceChart(ruleEvents, candles, null, ema9, null, false);

  const selectedTimestamp = useMemo(() => {
    const evt = events.find(e => e.id === selectedEventId);
    return evt ? new Date(evt.timestamp).getTime() / 1000 : null;
  }, [events, selectedEventId]);

  useEffect(() => {
    if (selectedTimestamp) {
        scrollToTime(Math.floor(selectedTimestamp / 60) * 60);
    }
  }, [selectedTimestamp]);

  if (loading) return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      backgroundColor: isDark ? 'var(--auth-black)' : '#ffffff' 
    }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 900, 
          color: isDark ? 'var(--auth-text-muted)' : '#94a3b8', 
          letterSpacing: '0.15em',
          fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
        }}>
            REHYDRATING MARKET ESTATE...
        </div>
    </div>
  );

  if (chartError) {
    return (
      <StatusPlaceholder
        icon={CandlestickChart}
        title="Replay Chart Unavailable"
        subtitle={`${chartError} We have the saved session events, but we could not rehydrate the candle series needed to recreate the live display.`}
        style={{ height: '100%' }}
      />
    );
  }

  // Ensure the chart container always renders even if candles are loading
  // This prevents the "Black Screen" effect.
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, flex: 1 }}>
      <div 
        ref={chartContainerRef} 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
      />
      {candles.length === 0 && !loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace" }}>
                  WAITING FOR MARKET DATA...
              </div>
          </div>
      )}
      <MarkerLayer 
        markers={markers} 
        onMarkerClick={onMarkerClick} 
        selectedTimestamp={selectedTimestamp}
      />
      <ChartControls
        deduplicateEvents={deduplicateEvents}
        onToggle={() => setDeduplicateEvents(!deduplicateEvents)}
      />
      <ChartLegend isMockData={false} symbol={resolvedSymbol} />
    </div>
  );
}

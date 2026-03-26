import { useState, useEffect, useRef, useCallback } from 'react';
import { RuleEngineRawMessage, RuleEngineEvent } from '../domain/ruleEngine/types';
import { generateMockEvent } from '../domain/ruleEngine/mockGenerator';

const WS_URL = 'wss://rule-engine-rcg9.onrender.com/ws/engine-output';

/**
 * Hook to connect to the Rule Engine WebSocket and manage event stream.
 * Can switch to Mock Mode to simulate events for frontend dev.
 */
export function useRuleEngineEvents(isActive: boolean = false) {
  const [events, setEvents] = useState<RuleEngineEvent[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  const toggleMockMode = useCallback(() => {
    setIsMockMode(prev => !prev);
  }, []);

  useEffect(() => {
    // 1. Cleanup previous connection if we are becoming inactive or switching modes
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 2. Only run effects if Mocking is on OR a Live Session is active
    if (!isActive && !isMockMode) {
      console.log('[useRuleEngineEvents] Monitoring idle. No connection needed.');
      return;
    }

    if (isMockMode) {
      console.log('[useRuleEngineEvents] Starting Mock Mode...');
      
      const deviationInterval = setInterval(() => {
        setEvents(prev => {
            const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : 71500;
            const newEvent = generateMockEvent(lastPrice, true);
            return [...prev, newEvent];
        });
      }, 2500);

      const adherenceInterval = setInterval(() => {
        setEvents(prev => {
            const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : 71500;
            const newEvent = generateMockEvent(lastPrice, false);
            return [...prev, newEvent];
        });
      }, 60000);

      return () => {
        clearInterval(deviationInterval);
        clearInterval(adherenceInterval);
      };

    } else if (isActive) {
      console.log('[useRuleEngineEvents] Session Active. Connecting to Rule Engine WS...');
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (messageEvent) => {
        try {
          const rawData: RuleEngineRawMessage = JSON.parse(messageEvent.data);
          const date = new Date(rawData.timestamp);
          const unixSeconds = Math.floor(date.getTime() / 1000);
          
          const newEvent: RuleEngineEvent = {
            ...rawData,
            id: crypto.randomUUID(),
            timestamp: unixSeconds,
            msTimestamp: date.getTime(),
            originalTimestamp: rawData.timestamp,
            rawRule: rawData.rule,
          };

          setEvents((prev) => [...prev, newEvent]);
        } catch (err) {
          console.error('[useRuleEngineEvents] Parse error:', err);
        }
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
        wsRef.current = null;
      };
    }
  }, [isMockMode, isActive]);

  return { events, isMockMode, toggleMockMode };
}

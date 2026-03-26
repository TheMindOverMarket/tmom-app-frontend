import { useState, useEffect, useRef, useCallback } from 'react';
import { RuleEngineRawMessage, RuleEngineEvent } from '../domain/ruleEngine/types';
import { generateMockEvent } from '../domain/ruleEngine/mockGenerator';

const WS_URL = 'wss://rule-engine-rcg9.onrender.com/ws/engine-output';

/**
 * Hook to connect to the Rule Engine WebSocket and manage event stream.
 * Can switch to Mock Mode to simulate events for frontend dev.
 */
export function useRuleEngineEvents() {
  const [events, setEvents] = useState<RuleEngineEvent[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  const toggleMockMode = useCallback(() => {
    setIsMockMode(prev => !prev);
    // Clear events on mode switch if desired, OR keep history. 
    // Let's keep history for now, simpler UX.
  }, []);

  useEffect(() => {
    // Cleanup previous connection
    if (wsRef.current) {
      console.log('[useRuleEngineEvents] Cleaning up previous WS...');
      wsRef.current.close();
      wsRef.current = null;
    }

    if (isMockMode) {
      console.log('[useRuleEngineEvents] Starting Mock Mode (High Frequency Deviations, Sparse Adherence)...');
      
      // Fast Interval: Deviations every 2.5 seconds
      const deviationInterval = setInterval(() => {
        setEvents(prev => {
            const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : 71500;
            const newEvent = generateMockEvent(lastPrice, true); // Force Deviation
            return [...prev, newEvent];
        });
      }, 2500);

      // Slow Interval: Adherence every 60 seconds (Every minute)
      const adherenceInterval = setInterval(() => {
        setEvents(prev => {
            const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : 71500;
            const newEvent = generateMockEvent(lastPrice, false); // Force Adherence
            return [...prev, newEvent];
        });
      }, 60000);

      return () => {
        clearInterval(deviationInterval);
        clearInterval(adherenceInterval);
      };

    } else {
      console.log('[useRuleEngineEvents] Connecting to Rule Engine WS...');
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[useRuleEngineEvents] Connection established');
      };

      ws.onmessage = (messageEvent) => {
        try {
          const rawData: RuleEngineRawMessage = JSON.parse(messageEvent.data);
          
          // Transform for chart compatibility 
          const date = new Date(rawData.timestamp);
          const unixSeconds = Math.floor(date.getTime() / 1000);
          const msTimestamp = date.getTime();
          
          const newEvent: RuleEngineEvent = {
            ...rawData,
            id: crypto.randomUUID(),
            timestamp: unixSeconds,
            msTimestamp: msTimestamp,
            originalTimestamp: rawData.timestamp,
            rawRule: rawData.rule,
          };

          setEvents((prev) => [...prev, newEvent]);
        } catch (err) {
          console.error('[useRuleEngineEvents] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[useRuleEngineEvents] WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('[useRuleEngineEvents] Connection closed', {
          code: event.code,
          reason: event.reason,
        });
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
        wsRef.current = null;
      };
    }
  }, [isMockMode]);

  return { events, isMockMode, toggleMockMode };
}

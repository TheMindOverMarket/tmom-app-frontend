import { useState, useEffect, useRef } from 'react';
import { RuleEngineRawMessage, RuleEngineEvent } from '../domain/ruleEngine/types';

const WS_URL = 'wss://rule-engine-rcg9.onrender.com/ws/engine-output';

/**
 * Hook to connect to the Rule Engine WebSocket and manage event stream.
 * Ingests asynchronous events and transforms them for chart consumption.
 */
export function useRuleEngineEvents() {
  const [events, setEvents] = useState<RuleEngineEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
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
        // Convert ISO-8601 to Unix seconds
        const unixSeconds = Math.floor(new Date(rawData.timestamp).getTime() / 1000);
        
        const newEvent: RuleEngineEvent = {
          ...rawData,
          id: crypto.randomUUID(),
          timestamp: unixSeconds,
          originalTimestamp: rawData.timestamp,
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
      console.log('[useRuleEngineEvents] Cleaning up WebSocket connection...');
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, []);

  return { events };
}

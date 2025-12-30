import { useMemo } from 'react';
import { BehaviorEvent, severityWeight } from '../domain/behavior/events';
import { generateMockBehaviorEvents } from '../mocks/behaviorEvents';

export interface UseBehaviorEventsResult {
  events: BehaviorEvent[];
  adherenceScore: number;
}

/**
 * Hook to retrieve behavioral events and calculate current adherence score.
 * Currently uses deterministic mock data.
 */
export function useBehaviorEvents(symbol: string): UseBehaviorEventsResult {
  const events = useMemo(() => {
    return generateMockBehaviorEvents(symbol);
  }, [symbol]);

  const adherenceScore = useMemo(() => {
    // Start with perfect score
    let score = 100;

    // Deduct points based on severity of each event
    for (const event of events) {
      const weight = severityWeight[event.severity];
      score -= weight;
    }

    // Floor at 0 (no negative scores)
    return Math.max(0, score);
  }, [events]);

  return {
    events,
    adherenceScore,
  };
}

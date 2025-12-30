import { useMemo } from 'react';
import { useBehaviorSummary } from './useBehaviorSummary';
import { 
  buildBehaviorTimeline, 
  BehaviorTimelineItem 
} from '../domain/behavior/behaviorTimeline';

export interface UseBehaviorTimelineResult {
  timeline: BehaviorTimelineItem[];
  adherenceScore: number;
}

/**
 * Hook to retrieve a UI-ready behavioral timeline and the current adherence score.
 * Composes useBehaviorSummary logic with the behaviorTimeline transformation.
 */
export function useBehaviorTimeline(symbol: string): UseBehaviorTimelineResult {
  const summary = useBehaviorSummary(symbol);

  const timeline = useMemo(() => {
    return buildBehaviorTimeline(summary);
  }, [summary]);

  return {
    timeline,
    adherenceScore: summary.adherenceScore,
  };
}

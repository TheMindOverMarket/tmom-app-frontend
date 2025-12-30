import { useMemo } from 'react';
import { useBehaviorEvents } from './useBehaviorEvents';
import { buildBehaviorSummary, BehaviorSummary } from '../domain/behavior/behaviorSummary';

/**
 * Hook that consumes behavior events and returns a composed summary object.
 * Useful for dashboards and chart overlays.
 */
export function useBehaviorSummary(symbol: string): BehaviorSummary {
  const { events, adherenceScore } = useBehaviorEvents(symbol);

  const summary = useMemo(() => {
    return buildBehaviorSummary(events, adherenceScore);
  }, [events, adherenceScore]);

  return summary;
}

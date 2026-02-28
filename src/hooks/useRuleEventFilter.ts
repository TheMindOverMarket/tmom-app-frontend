import { useMemo } from 'react';
import { RuleEngineEvent } from '../domain/ruleEngine/types';

export function useRuleEventFilter(
  events: RuleEngineEvent[],
  focusedTimestamp: number | null,
  filterType?: 'adherence' | 'deviation' | null
) {
  return useMemo(() => {
    if (focusedTimestamp === null) {
      return [...events].reverse();
    }
    
    const start = Math.floor(focusedTimestamp / 60) * 60;
    const end = start + 60;
    
    return events.filter(e => {
        const t = e.timestamp;
        const inRange = t >= start && t < end;
        
        if (!inRange) return false;
        if (filterType === 'adherence' && e.deviation) return false;
        if (filterType === 'deviation' && !e.deviation) return false;
        
        return true;
    }).sort((a, b) => b.msTimestamp - a.msTimestamp);
  }, [events, focusedTimestamp, filterType]);
}

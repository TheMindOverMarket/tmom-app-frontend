import { 
  BehaviorEvent, 
  BehaviorEventType, 
  RuleCategory, 
  Severity, 
  severityWeight 
} from './events';

/**
 * Lightweight marker shape for rendering on charts.
 */
export interface BehaviorChartMarker {
  id: string;
  timestamp: number;
  label: string;
  severity: Severity;
  type: BehaviorEventType;
}

/**
 * Aggregated summary of behavioral performance.
 * Computed purely from a list of events and a score.
 */
export interface BehaviorSummary {
  totalEvents: number;
  
  byType: Record<BehaviorEventType, number>;
  
  bySeverity: Record<Severity, number>;
  
  byCategory: Record<RuleCategory, number>;
  
  latestEvent: BehaviorEvent | null;
  
  mostSevereViolation: BehaviorEvent | null;
  
  // Sorted by timestamp ascending
  timeline: BehaviorEvent[];
  
  markers: BehaviorChartMarker[];
  
  adherenceScore: number;
}

/**
 * Pure transformation from raw events to a summary structure.
 */
export function buildBehaviorSummary(
  events: BehaviorEvent[], 
  adherenceScore: number
): BehaviorSummary {
  // 1. Sort events by timestamp ascending for timeline
  const timeline = [...events].sort((a, b) => a.timestamp - b.timestamp);

  // 2. Initialize counters
  const byType: Record<BehaviorEventType, number> = {
    ENTRY: 0,
    EXIT: 0,
    WARNING: 0,
    VIOLATION: 0,
  };
  
  const bySeverity: Record<Severity, number> = {
    info: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  // Note: We initialize with 0, but will populate dynamically to cover all categories safely
  const byCategory: Record<RuleCategory, number> = {
    risk: 0,
    discipline: 0,
    timing: 0,
    size: 0,
    strategy: 0,
    psychology: 0,
  };

  let mostSevereViolation: BehaviorEvent | null = null;
  let maxWeight = -1;

  const markers: BehaviorChartMarker[] = [];

  // 3. Single pass aggregation
  for (const event of timeline) {
    // Counts
    byType[event.type] = (byType[event.type] || 0) + 1;
    bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    byCategory[event.ruleCategory] = (byCategory[event.ruleCategory] || 0) + 1;

    // Highest severity tracking
    const weight = severityWeight[event.severity];
    if (weight > maxWeight) {
      maxWeight = weight;
      mostSevereViolation = event;
    }

    // Chart markers
    markers.push({
      id: event.id,
      timestamp: event.timestamp,
      label: event.ruleName,
      severity: event.severity,
      type: event.type,
    });
  }

  // 4. Latest event
  const latestEvent = timeline.length > 0 ? timeline[timeline.length - 1] : null;

  return {
    totalEvents: timeline.length,
    byType,
    bySeverity,
    byCategory,
    latestEvent,
    mostSevereViolation: maxWeight > 0 ? mostSevereViolation : null,
    timeline,
    markers,
    adherenceScore,
  };
}

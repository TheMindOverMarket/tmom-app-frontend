import { BehaviorSummary } from './behaviorSummary';
import { BehaviorEventType, RuleCategory, Severity } from './events';

export type TimelineColor = 'gray' | 'yellow' | 'orange' | 'red';
export type TimelineIcon = 'info' | 'warning' | 'error' | 'check';

export interface BehaviorTimelineItem {
  id: string;
  timestamp: number;
  label: string;
  description: string;
  severity: Severity;
  type: BehaviorEventType;
  category: RuleCategory;

  // UI helpers
  color: TimelineColor;
  icon: TimelineIcon;
}

/**
 * Maps severity levels to basic UI color tokens.
 */
function mapSeverityToColor(severity: Severity): TimelineColor {
  switch (severity) {
    case 'info':
      return 'gray';
    case 'low':
      return 'yellow';
    case 'medium':
      return 'orange';
    case 'high':
    case 'critical':
      return 'red';
  }
}

/**
 * Maps severity levels to basic UI icon tokens.
 */
function mapSeverityToIcon(severity: Severity): TimelineIcon {
  switch (severity) {
    case 'info':
    case 'low':
      return 'info';
    case 'medium':
      return 'warning';
    case 'high':
    case 'critical':
      return 'error';
  }
}

/**
 * Pure transformation from BehaviorSummary to render-ready timeline items.
 * Preserves chronological sorting from the summary.
 */
export function buildBehaviorTimeline(summary: BehaviorSummary): BehaviorTimelineItem[] {
  return summary.timeline.map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    label: event.ruleName,
    description: event.message,
    severity: event.severity,
    type: event.type,
    category: event.ruleCategory,
    color: mapSeverityToColor(event.severity),
    icon: mapSeverityToIcon(event.severity),
  }));
}

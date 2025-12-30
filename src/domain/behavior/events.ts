/**
 * Canonical types for Behavioral Events in the TMOM POC.
 * These types define the data shape for chart markers, logs, and adherence scoring.
 *
 * This file contains pure domain types and constants. No React code.
 */

export type BehaviorEventType = 
  | 'ENTRY' 
  | 'EXIT' 
  | 'WARNING' 
  | 'VIOLATION';

export type Severity = 
  | 'info' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type RuleCategory =
  | 'risk'
  | 'discipline'
  | 'timing'
  | 'size'
  | 'strategy'
  | 'psychology';

export interface BehaviorEvent {
  id: string;

  // Unix seconds
  timestamp: number;

  symbol: string;

  /**
   * Structural category of the event.
   * ENTRY/EXIT denote trade lifecycle positions.
   * WARNING/VIOLATION denote behavioral feedback.
   */
  type: BehaviorEventType;

  /**
   * Impact level used for scoring adherence.
   * Critical violations carry the heaviest penalty.
   */
  severity: Severity;

  ruleId: string;
  ruleName: string;
  ruleCategory: RuleCategory;
  message: string;

  context?: {
    price?: number;
    pnl?: number;
    side?: 'long' | 'short';
    reason?: string;
    [key: string]: string | number | undefined;
  };

  meta: {
    source: 'mock' | 'engine' | 'manual';
    [key: string]: string | number | boolean;
  };
}

// Weights for adherence score calculation
export const severityWeight: Record<Severity, number> = {
  info: 0,
  low: 2,
  medium: 5,
  high: 10,
  critical: 25,
};

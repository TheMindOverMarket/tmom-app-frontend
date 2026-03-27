/**
 * Types for the Rule Engine WebSocket events.
 */

export interface RuleEngineRawMessage {
  timestamp: string; // ISO-8601 string
  price: number;
  rule: string | Record<string, unknown>;
  playbook_id?: string;
  session_id?: string;
  user_id?: string;
  rule_triggered?: boolean;
  triggered_entries?: string[];
  rule_evaluations?: Record<string, boolean>;
  action: boolean;
  deviation: boolean;
  deviation_true?: string[];
  deviation_false?: string[];
}

export interface RuleEngineEvent extends Omit<RuleEngineRawMessage, 'timestamp'> {
  id: string; // Generated id for React keys
  timestamp: number; // Unix timestamp in seconds for chart compatibility
  msTimestamp: number; // Unix timestamp in milliseconds for precision/uniqueness
  originalTimestamp: string; // Keep the original ISO string
  rawRule: unknown; // Raw rule object for debugging
}

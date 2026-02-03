/**
 * Types for the Rule Engine WebSocket events.
 */

export interface RuleEngineRawMessage {
  timestamp: string; // ISO-8601 string
  price: number;
  rule: string | Record<string, any>;
  action: boolean;
  deviation: boolean;
}

export interface RuleEngineEvent extends Omit<RuleEngineRawMessage, 'timestamp'> {
  id: string; // Generated id for React keys
  timestamp: number; // Unix timestamp in seconds for chart compatibility
  msTimestamp: number; // Unix timestamp in milliseconds for precision/uniqueness
  originalTimestamp: string; // Keep the original ISO string
  rawRule: any; // Raw rule object for debugging
}

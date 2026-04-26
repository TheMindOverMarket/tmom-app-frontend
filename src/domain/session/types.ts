export enum SessionStatus {
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SessionEventType {
  ADHERENCE = 'ADHERENCE',
  DEVIATION = 'DEVIATION',
  NOTIFICATION = 'NOTIFICATION',
  TRADING = 'TRADING',
  SYSTEM = 'SYSTEM',
}

export interface ReportCard {
  consistency_grade: string;
  summary: string;
  behavioral_pattern: string;
  top_violation: string;
  actionable_feedback: string;
}

export interface SessionMetadata {
  report_card?: ReportCard;
  [key: string]: unknown;
}

export interface RuleEvaluationData {
  rule_evaluations?: Record<string, boolean>;
  deviation?: boolean;
  summary?: string;
  price?: number;
  [key: string]: unknown;
}

export interface Session {
  id: string;
  user_id: string;
  playbook_id: string;
  start_time: string; // ISO-8601
  end_time: string | null;
  status: SessionStatus;
  is_audit_ready: boolean;
  session_metadata?: SessionMetadata;
  created_at: string;
}

export interface SessionEvent {
  id: string;
  session_id: string;
  type: SessionEventType;
  timestamp: string; // ISO-8601
  tick?: number;
  event_data: RuleEvaluationData;
  event_metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SessionCreate {
  user_id: string;
  playbook_id: string;
  session_metadata?: SessionMetadata;
}

export interface SessionUpdate {
  status?: SessionStatus;
  session_metadata?: SessionMetadata;
}

export interface SessionEventCreate {
  type: SessionEventType;
  timestamp?: string;
  tick?: number;
  event_data: RuleEvaluationData;
  event_metadata?: Record<string, unknown>;
}

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

export interface Session {
  id: string;
  user_id: string;
  playbook_id: string;
  start_time: string; // ISO-8601
  end_time: string | null;
  status: SessionStatus;
  session_metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SessionEvent {
  id: string;
  session_id: string;
  type: SessionEventType;
  timestamp: string; // ISO-8601
  tick?: number;
  event_data: Record<string, unknown>;
  event_metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SessionCreate {
  user_id: string;
  playbook_id: string;
  session_metadata?: Record<string, unknown>;
}

export interface SessionUpdate {
  status?: SessionStatus;
  session_metadata?: Record<string, unknown>;
}

export interface SessionEventCreate {
  type: SessionEventType;
  tick?: number;
  event_data: Record<string, unknown>;
  event_metadata?: Record<string, unknown>;
}

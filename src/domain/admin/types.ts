export interface AdminUserAnalytics {
  user_id: string;
  email: string;
  latest_session_id?: string;
  latest_deviation_score: number;
  session_status?: string;
  last_updated?: string;
}

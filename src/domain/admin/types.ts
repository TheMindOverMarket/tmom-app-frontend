export interface AdminUserAnalytics {
  user_id: string;
  email: string;
  latest_session_id?: string;
  latest_deviation_score: number;
  session_status?: string;
  last_updated?: string;
}

export interface AdminAnalyticsOverview {
  total_traders: number;
  active_sessions: number;
  completed_sessions: number;
  adherence_rate: number;
  total_deviation_cost: number;
  total_unauthorized_gain: number;
  total_deviation_events: number;
  at_risk_traders: number;
}

export interface AdminTrendPoint {
  bucket: string;
  sessions: number;
  adherence_rate: number;
  deviation_cost: number;
  deviation_events: number;
}

export interface AdminTraderRow {
  user_id: string;
  email: string;
  latest_session_id?: string;
  latest_session_status?: string;
  sessions_count: number;
  adherence_rate: number;
  total_deviation_cost: number;
  total_unauthorized_gain: number;
  total_deviation_events: number;
  severe_deviation_events: number;
  top_deviation_family?: string;
  top_deviation_type?: string;
  last_active_at?: string;
  risk_rank_score: number;
  risk_rank_label: 'low' | 'medium' | 'high' | 'critical';
  drift_delta_7d: number;
}

export interface AdminDeviationBreakdown {
  by_family: Record<string, number>;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  cost_by_family: Record<string, number>;
  cost_by_type: Record<string, number>;
}

export interface AdminPlaybookRow {
  playbook_id: string;
  playbook_name: string;
  trader_count: number;
  sessions_count: number;
  adherence_rate: number;
  total_deviation_cost: number;
  total_deviation_events: number;
  most_broken_rule?: string;
}

export interface AdminInterventionRow {
  user_id: string;
  email: string;
  latest_session_id?: string;
  priority_score: number;
  priority_label: 'monitor' | 'coach' | 'restrict' | 'urgent';
  drivers: string[];
  total_deviation_cost: number;
  recent_deviation_velocity: number;
  repeated_rule_breaks: number;
  severe_events: number;
}

export interface AdminAnalyticsDashboard {
  overview: AdminAnalyticsOverview;
  trends: AdminTrendPoint[];
  traders: AdminTraderRow[];
  deviations: AdminDeviationBreakdown;
  playbooks: AdminPlaybookRow[];
  interventions: AdminInterventionRow[];
}

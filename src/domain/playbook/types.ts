export type GenerationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface RuleCondition {
  id: string;
  rule_id: string;
  metric: string;
  comparator: string;
  value: string | number;
  is_active: boolean;
}

export interface ConditionEdge {
  id: string;
  rule_id: string;
  parent_condition_id: string;
  child_condition_id: string;
  logical_operator: 'AND' | 'OR';
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: 'entry' | 'exit' | 'risk' | 'logic';
  is_active: boolean;
  playbook_id: string;
  created_at: string;
  conditions?: RuleCondition[];
  edges?: ConditionEdge[];
}

export interface Playbook {
  id: string;
  user_id: string;
  name: string;
  original_nl_input: string;
  generation_status: GenerationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaybookCreate {
  name: string;
  user_id: string;
  original_nl_input: string;
  is_active?: boolean;
}

export interface PlaybookUpdate {
  name?: string;
  is_active?: boolean;
}

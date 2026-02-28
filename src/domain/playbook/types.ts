export interface Playbook {
  id: string;
  user_id: string;
  name: string;
  original_nl_input: string;
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

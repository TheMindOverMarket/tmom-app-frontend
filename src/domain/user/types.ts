export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
}

export interface UserUpdate {
  email?: string;
}

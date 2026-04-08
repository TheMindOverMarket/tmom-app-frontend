export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
}

export interface UserUpdate {
  email?: string;
}

export interface UserLogin {
  email: string;
}

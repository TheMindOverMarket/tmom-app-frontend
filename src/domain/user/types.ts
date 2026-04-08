export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UserUpdate {
  email?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

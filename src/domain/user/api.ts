import { CONFIG } from '../../config/constants';
import { User, UserCreate, UserLogin } from './types';

const API_BASE = CONFIG.BACKEND_BASE_URL;

export const userApi = {
  listUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE}/users/`);
    if (!response.ok) throw new Error('Failed to list users');
    return response.json();
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/${id}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('User not found');
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  loginUser: async (credentials: UserLogin): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail || 'Invalid email or login failed');
    }
    return response.json();
  },

  createUser: async (user: UserCreate): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  ensureDefaultUser: async (): Promise<User> => {
    const users = await userApi.listUsers();
    if (users.length > 0) return users[0];
    return userApi.createUser({ email: 'demo@themindovermarket.com' });
  }
};

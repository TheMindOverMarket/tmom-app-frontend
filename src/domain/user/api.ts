import { User, UserCreate } from './types';

const API_BASE = 'https://tmom-app-backend.onrender.com';

export const userApi = {
  listUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE}/users/`);
    if (!response.ok) throw new Error('Failed to list users');
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

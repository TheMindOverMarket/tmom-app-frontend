import { CONFIG } from '../../config/constants';
import { AdminAnalyticsDashboard, AdminUserAnalytics } from './types';

const API_BASE = CONFIG.BACKEND_BASE_URL;

export const adminApi = {
  fetchAnalytics: async (): Promise<AdminUserAnalytics[]> => {
    const response = await fetch(`${API_BASE}/admin/analytics`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch admin analytics: ${errorText}`);
    }
    return response.json();
  },

  fetchDashboard: async (): Promise<AdminAnalyticsDashboard> => {
    const response = await fetch(`${API_BASE}/admin/analytics/dashboard`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch admin analytics dashboard: ${errorText}`);
    }
    return response.json();
  },
};

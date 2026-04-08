import { CONFIG } from '../../config/constants';
import { safeFetch } from '../../utils/apiUtils';
import { AdminUserAnalytics } from './types';

const API_BASE = CONFIG.BACKEND_BASE_URL;

export const adminApi = {
  fetchAnalytics: async (): Promise<AdminUserAnalytics[]> => {
    const response = await safeFetch(`${API_BASE}/admin/analytics`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch admin analytics: ${errorText}`);
    }
    return response.json();
  },
};

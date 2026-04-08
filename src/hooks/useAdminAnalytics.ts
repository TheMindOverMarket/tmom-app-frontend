import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../domain/admin/api';
import type { AdminAnalyticsDashboard } from '../domain/admin/types';

export function useAdminAnalytics(enabled = true) {
  const [dashboard, setDashboard] = useState<AdminAnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setDashboard(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await adminApi.fetchDashboard();
      setDashboard(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin analytics');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard,
  };
}

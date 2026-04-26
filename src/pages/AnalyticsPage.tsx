import { SessionAnalytics } from '../components/session/SessionAnalytics';
import { ManagerAnalyticsDashboard } from '../components/admin/ManagerAnalyticsDashboard';
import { useUserSession } from '../contexts/UserSessionContext';

export function AnalyticsPage() {
  const { currentUser } = useUserSession();
  const isManager = currentUser?.role === 'MANAGER';

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, background: 'transparent' }}>
      <SessionAnalytics />
    </div>
  );
}

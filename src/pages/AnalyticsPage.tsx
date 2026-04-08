import { SessionAnalytics } from '../components/session/SessionAnalytics';
import { ManagerAnalyticsDashboard } from '../components/admin/ManagerAnalyticsDashboard';
import { useUserSession } from '../contexts/UserSessionContext';

export function AnalyticsPage() {
  const { currentUser } = useUserSession();
  const isManager = currentUser?.role === 'MANAGER';

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, background: isManager ? 'linear-gradient(180deg, #fffaf0 0%, #f8fafc 16%, #f8fafc 100%)' : 'transparent' }}>
      {isManager ? <ManagerAnalyticsDashboard /> : <SessionAnalytics />}
    </div>
  );
}

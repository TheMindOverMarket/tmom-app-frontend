import { Navigate, Outlet } from 'react-router-dom';
import { useUserSession } from '../../contexts/UserSessionContext';

export function ProtectedRoute() {
  const { currentUser, isLoading } = useUserSession();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
        Authenticating...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

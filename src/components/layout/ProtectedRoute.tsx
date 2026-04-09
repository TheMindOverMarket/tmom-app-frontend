import { Navigate, Outlet } from 'react-router-dom';
import { useUserSession } from '../../contexts/UserSessionContext';

export function ProtectedRoute() {
  const { currentUser, isLoading } = useUserSession();

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'grid', 
        placeItems: 'center', 
        backgroundColor: 'var(--auth-black)',
        color: 'var(--auth-accent)',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        letterSpacing: '0.2em'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(0, 255, 136, 0.1)',
            borderTop: '2px solid var(--auth-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          AUTHENTICATING SYSTEM...
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

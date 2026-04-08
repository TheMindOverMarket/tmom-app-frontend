import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlaybookProvider } from './contexts/PlaybookContext';
import { UserSessionProvider, useUserSession } from './contexts/UserSessionContext';
import { AppLayout } from './components/layout/AppLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { PlaybooksPage } from './pages/PlaybooksPage';
import { MonitorPage } from './pages/MonitorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthLayout } from './components/layout/AuthLayout';

function UserScopedApp() {
  const { currentUser, isLoading } = useUserSession();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748b', backgroundColor: '#f8fafc' }}>
        Loading user context...
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <PlaybookProvider>
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/playbooks" replace /> : <Navigate to="/login" replace />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        {currentUser ? (
          <Route element={<AppLayout />}>
            <Route path="/playbooks" element={<PlaybooksPage />} />
            <Route path="/supervision" element={<MonitorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
            <Route path="*" element={<Navigate to="/playbooks" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </PlaybookProvider>
  );
}

function App() {
  return (
    <Router>
      <UserSessionProvider>
        <UserScopedApp />
      </UserSessionProvider>
    </Router>
  );
}

export default App;

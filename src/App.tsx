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
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { SystemStatusProvider } from './contexts/SystemStatusContext';
import { BootingPopup } from './components/ui/BootingPopup';

function AppRoutes() {
  const { currentUser } = useUserSession();

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <PlaybookProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/playbooks" replace />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/playbooks" element={<PlaybooksPage />} />
            <Route path="/supervision" element={<MonitorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
            <Route path="*" element={<Navigate to="/playbooks" replace />} />
          </Route>
        </Route>
      </Routes>
      <BootingPopup />
    </PlaybookProvider>
  );
}

function App() {
  return (
    <Router>
      <SystemStatusProvider>
        <UserSessionProvider>
          <AppRoutes />
        </UserSessionProvider>
      </SystemStatusProvider>
    </Router>
  );
}

export default App;

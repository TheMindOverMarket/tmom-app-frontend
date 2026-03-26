import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlaybookProvider } from './contexts/PlaybookContext';
import { AppLayout } from './components/layout/AppLayout';
import { PlaybooksPage } from './pages/PlaybooksPage';
import { MonitorPage } from './pages/MonitorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function App() {
  return (
    <Router>
      <PlaybookProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/playbooks" replace />} />
            <Route path="/playbooks" element={<PlaybooksPage />} />
            <Route path="/supervision" element={<MonitorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/playbooks" replace />} />
          </Route>
        </Routes>
      </PlaybookProvider>
    </Router>
  );
}

export default App;

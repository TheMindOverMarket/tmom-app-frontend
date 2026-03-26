import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { NotificationBanner } from '../common/NotificationBanner';
import { usePlaybookContext } from '../../contexts/PlaybookContext';
import { useRuleEngineEvents } from '../../hooks/useRuleEngineEvents';

export function AppLayout() {
  const { notification, setNotification } = usePlaybookContext();
  const { isMockMode, toggleMockMode } = useRuleEngineEvents();

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '"Inter", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ flexShrink: 0 }}>
        <Header isMockMode={isMockMode} onToggleMockMode={toggleMockMode} />
        <Navbar />
      </div>

      {notification && (
        <NotificationBanner 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
      )}

      <main style={{ 
        flex: 1, 
        padding: '24px', 
        maxWidth: '1800px', 
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <Outlet />
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      ` }} />
    </div>
  );
}

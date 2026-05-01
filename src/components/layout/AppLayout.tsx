import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { NotificationBanner } from '../common/NotificationBanner';
import { usePlaybookContext } from '../../contexts/PlaybookContext';

export function AppLayout() {
  const { notification, setNotification } = usePlaybookContext();

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: 'var(--auth-black)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: '#ffffff'
    }}>
      <div style={{ flexShrink: 0 }}>
        <Header />
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
        padding: '16px', 
        maxWidth: '1800px', 
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--auth-black)'
      }}>
        <Outlet />
      </main>
    </div>
  );
}

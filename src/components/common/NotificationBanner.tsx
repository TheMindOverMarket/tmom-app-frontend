import { useEffect } from 'react';
import { X } from 'lucide-react';

interface NotificationBannerProps {
  notification: { type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
}

export function NotificationBanner({ notification, onClose }: NotificationBannerProps) {
  useEffect(() => {
    if (notification && notification.type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '6px',
      backgroundColor: notification.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : '#FDE8E8',
      color: notification.type === 'success' ? '#00ff88' : '#9B1C1C',
      border: `1px solid ${notification.type === 'success' ? 'rgba(0, 255, 136, 0.3)' : '#F8B4B4'}`,
      fontSize: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      margin: '0 24px 10px 24px',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
      animation: 'fadeInDown 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {notification.type === 'success' ? (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ff88' }} />
        ) : (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
        )}
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 500 }}>{notification.message}</span>
      </div>
      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'inherit', 
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.6,
          marginLeft: '16px',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        <X size={16} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}

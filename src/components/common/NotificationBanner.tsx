interface NotificationBannerProps {
  notification: { type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
}

export function NotificationBanner({ notification, onClose }: NotificationBannerProps) {
  if (!notification) return null;

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '6px',
      backgroundColor: notification.type === 'success' ? '#DEF7EC' : '#FDE8E8',
      color: notification.type === 'success' ? '#03543F' : '#9B1C1C',
      border: `1px solid ${notification.type === 'success' ? '#31C48D' : '#F8B4B4'}`,
      fontSize: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      marginBottom: '10px'
    }}>
      <span>{notification.message}</span>
      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'inherit', 
          cursor: 'pointer',
          fontWeight: 'bold',
          opacity: 0.6,
          marginLeft: '16px'
        }}
      >
        ✕
      </button>
    </div>
  );
}

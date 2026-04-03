import { useUserSession } from '../../contexts/UserSessionContext';

export function UserIDBanner() {
  const { currentUser } = useUserSession();

  if (!currentUser) return null;

  return (
    <div style={{
      padding: '4px 24px',
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '11px',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 500,
    }}>
      <span style={{ marginRight: '6px', opacity: 0.7 }}>👤</span>
      <strong style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Debug:</strong> &nbsp;{currentUser.id}
    </div>
  );
}

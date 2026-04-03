import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, UserRound, Plus } from 'lucide-react';
import { useUserSession } from '../contexts/UserSessionContext';

export function UserSelectionPage() {
  const navigate = useNavigate();
  const {
    users,
    currentUser,
    isLoadingUsers,
    selectUserById,
    createAndSelectUser,
    refreshUsers,
  } = useUserSession();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email)),
    [users]
  );

  const handleSelectUser = async (userId: string) => {
    setError(null);
    setIsSelecting(userId);
    try {
      await selectUserById(userId);
      navigate('/playbooks', { replace: true });
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : 'Failed to select user');
    } finally {
      setIsSelecting(null);
    }
  };

  const handleCreateUser = async () => {
    if (!email.trim()) return;

    setError(null);
    setIsCreating(true);
    try {
      await createAndSelectUser(email.trim());
      setEmail('');
      navigate('/playbooks', { replace: true });
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
          gap: '20px',
        }}
      >
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px -24px rgba(15, 23, 42, 0.15)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 900,
                color: '#64748b',
                letterSpacing: '0.12em',
                marginBottom: '10px',
              }}
            >
              TEMPORARY USER ENTRY
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>
              Choose a user before entering the app
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Quick and dirty implementation for local testing only. This selected user drives
              playbooks, sessions, and analytics for the rest of this browser session until you switch.
            </p>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #fcd34d',
              backgroundColor: '#fffbeb',
              color: '#92400e',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            This is intentionally not auth. There are no tokens, passwords, or permissions yet.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.08em' }}>
              AVAILABLE USERS
            </div>
            <button
              onClick={() => void refreshUsers()}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '10px',
                fontWeight: 800,
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              REFRESH
            </button>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {isLoadingUsers ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Loading users...
              </div>
            ) : sortedUsers.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                No users found yet. Create one on the right to get started.
              </div>
            ) : (
              sortedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => void handleSelectUser(user.id)}
                  disabled={isSelecting !== null || isCreating}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '8px',
                    border: currentUser?.id === user.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: currentUser?.id === user.id ? '#f8fafc' : '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: isSelecting !== null || isCreating ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '999px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                      }}
                    >
                      <UserRound size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.id}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '10px',
                      fontWeight: 900,
                      color: '#64748b',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {isSelecting === user.id ? 'OPENING...' : 'USE USER'}
                    <ChevronRight size={14} />
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <aside
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px -24px rgba(15, 23, 42, 0.15)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.08em' }}>
              QUICK CREATE
            </div>
            <h2 style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
              Create a temporary test user
            </h2>
          </div>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="trader@example.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              backgroundColor: '#fcfdfe',
            }}
          />

          <button
            onClick={() => void handleCreateUser()}
            disabled={isCreating || !email.trim()}
            style={{
              height: '42px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0f172a',
              color: 'white',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.06em',
              cursor: isCreating || !email.trim() ? 'not-allowed' : 'pointer',
              opacity: isCreating || !email.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Plus size={14} />
            {isCreating ? 'CREATING...' : 'CREATE AND USE'}
          </button>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

import { Session, SessionStatus } from '../../domain/session/types';
import { useNavigate } from 'react-router-dom';
import { Layers, Trash2 } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  onSelect: (session: Session) => void;
  onDelete?: (id: string) => void;
  selectedId?: string;
  isDark?: boolean;
}

export function SessionList({ sessions, onSelect, onDelete, selectedId, isDark = false }: SessionListProps) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <div style={{
        padding: '32px 24px',
        textAlign: 'center',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#f8fafc',
        borderRadius: '8px',
        border: isDark ? '1px solid var(--auth-border)' : '1px solid #e2e8f0',
        color: 'var(--auth-text-muted)',
        fontSize: '13px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
      }}>
        <div style={{ padding: '16px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'white', borderRadius: '50%', border: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Layers size={24} color={isDark ? 'rgba(255, 255, 255, 0.2)' : '#94a3b8'} />
        </div>
        <div style={{ maxWidth: '320px', lineHeight: '1.5' }}>
          No historical session records found. Ingest and activate a <strong style={{ color: isDark ? '#ffffff' : 'inherit' }}>Playbook</strong> to begin automated supervision.
        </div>
        
        <button 
          onClick={() => navigate('/playbooks')}
          style={{
            padding: '10px 24px',
            backgroundColor: isDark ? '#ffffff' : '#0f172a',
            color: isDark ? '#000000' : 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
          }}
        >
          GO TO PLAYBOOKS
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '12px',
      maxHeight: '500px',
      paddingBottom: '20px'
    }}>
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSelect(session)}
          style={{
            padding: '20px',
            backgroundColor: selectedId === session.id 
              ? (isDark ? 'rgba(0, 255, 136, 0.015)' : '#f8fafc') 
              : (isDark ? 'rgba(255, 255, 255, 0.01)' : '#ffffff'),
            borderRadius: '8px',
            border: selectedId === session.id 
              ? `1px solid ${isDark ? 'var(--auth-accent)' : '#0f172a'}` 
              : `1px solid ${isDark ? 'var(--auth-border)' : '#e5e7eb'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: '900',
                padding: '2px 8px',
                borderRadius: '2px',
                backgroundColor: session.status === SessionStatus.COMPLETED 
                  ? (isDark ? 'rgba(0, 255, 136, 0.1)' : '#dcfce7') 
                  : session.status === SessionStatus.STARTED 
                    ? (isDark ? 'rgba(99, 102, 241, 0.1)' : '#eff6ff') 
                    : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2'),
                color: session.status === SessionStatus.COMPLETED 
                  ? (isDark ? 'var(--auth-accent)' : '#15803d') 
                  : session.status === SessionStatus.STARTED 
                    ? (isDark ? 'var(--brand)' : '#1d4ed8') 
                    : (isDark ? '#ef4444' : '#b91c1c'),
                border: isDark ? `1px solid ${
                  session.status === SessionStatus.COMPLETED 
                    ? 'rgba(0, 255, 136, 0.2)' 
                    : session.status === SessionStatus.STARTED 
                      ? 'rgba(99, 102, 241, 0.2)' 
                      : 'rgba(239, 68, 68, 0.2)'
                }` : 'none',
                alignSelf: 'flex-start',
                fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
              }}>
                {session.status}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                fontSize: '10px', 
                color: 'var(--auth-text-muted)', 
                fontWeight: '600',
                fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
              }}>
                {new Date(session.start_time).toLocaleDateString()}
              </div>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Permanently delete session log "${session.id.slice(0, 8)}"?`)) {
                      onDelete(session.id);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    color: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="Purge session from logs"
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1'}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <h3 style={{ 
            fontSize: '15px', 
            fontWeight: isDark ? 400 : 800, 
            color: isDark ? '#ffffff' : '#0f172a', 
            margin: '0 0 6px 0', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
          }}>
            {`SESSION_${session.id.slice(0, 8).toUpperCase()}`}
          </h3>
          
          <p style={{ 
            fontSize: '11px', 
            color: 'var(--auth-text-muted)', 
            margin: 0,
            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
          }}>
            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ))}
    </div>
  );
}

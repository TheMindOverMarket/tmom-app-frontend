import { Session, SessionStatus } from '../../domain/session/types';
import { useNavigate } from 'react-router-dom';
import { Layers, Trash2 } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  onSelect: (session: Session) => void;
  onDelete?: (id: string) => void;
  selectedId?: string;
}

export function SessionList({ sessions, onSelect, onDelete, selectedId }: SessionListProps) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <div style={{
        padding: '64px 32px',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '4px',
        border: '1px dashed #e2e8f0',
        color: '#64748b',
        fontSize: '13px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '50%', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Layers size={24} color="#94a3b8" />
        </div>
        <div style={{ maxWidth: '320px', lineHeight: '1.6' }}>
          No historical session records found. Ingest and activate a <strong>Playbook</strong> to begin automated supervision.
        </div>
        
        <button 
          onClick={() => navigate('/playbooks')}
          style={{
            padding: '10px 24px',
            backgroundColor: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.05em'
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
      maxHeight: '400px',
      paddingBottom: '20px'
    }}>
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSelect(session)}
          style={{
            padding: '16px',
            backgroundColor: selectedId === session.id ? '#f8fafc' : '#ffffff',
            borderRadius: '4px',
            border: selectedId === session.id ? '1px solid #0f172a' : '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '900',
                padding: '2px 6px',
                borderRadius: '2px',
                backgroundColor: session.status === SessionStatus.COMPLETED ? '#dcfce7' : session.status === SessionStatus.STARTED ? '#eff6ff' : '#fee2e2',
                color: session.status === SessionStatus.COMPLETED ? '#15803d' : session.status === SessionStatus.STARTED ? '#1d4ed8' : '#b91c1c',
                alignSelf: 'flex-start'
              }}>
                {session.status}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: '600' }}>
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
                    color: '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="Purge session from logs"
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {`Session ${session.id.slice(0, 8)}`}
          </h3>
          
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ))}
    </div>
  );
}

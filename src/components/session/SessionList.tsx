import { Session, SessionStatus } from '../../domain/session/types';

interface SessionListProps {
  sessions: Session[];
  onSelect: (session: Session) => void;
  selectedId?: string;
}

export function SessionList({ sessions, onSelect, selectedId }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        backgroundColor: '#f9fbfd',
        borderRadius: '12px',
        border: '1px dashed #ced4da',
        color: '#6c757d',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        No sessions found. Start a strategy and session to begin recording.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
      maxHeight: '400px',
      paddingBottom: '20px'
    }}>
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSelect(session)}
          style={{
            padding: '16px',
            backgroundColor: selectedId === session.id ? '#f5f3ff' : '#ffffff',
            borderRadius: '12px',
            border: selectedId === session.id ? '2px solid #6366f1' : '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
            boxShadow: selectedId === session.id ? '0 4px 6px -1px rgba(99, 102, 241, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '700',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: session.status === SessionStatus.COMPLETED ? '#dcfce7' : session.status === SessionStatus.STARTED ? '#eff6ff' : '#fee2e2',
              color: session.status === SessionStatus.COMPLETED ? '#15803d' : session.status === SessionStatus.STARTED ? '#1d4ed8' : '#b91c1c',
            }}>
              {session.status}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>
              {new Date(session.start_time).toLocaleDateString()}
            </div>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {`Session ${session.id.slice(0, 8)}`}
          </h3>
          
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect, useMemo, useRef } from 'react';
import { Session, SessionEvent, SessionEventType } from '../../domain/session/types';

interface ReplayPlayerProps {
  session: Session;
  events: SessionEvent[];
  loading: boolean;
  onClose: () => void;
}

export function ReplayPlayer({ session, events, loading, onClose }: ReplayPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const playbackRef = useRef<number | null>(null);

  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId) || events[currentIndex], 
    [events, selectedEventId, currentIndex]
  );

  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = window.setInterval(() => {
        setCurrentIndex(prev => {
          if (prev < events.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000);
    } else if (playbackRef.current) {
      clearInterval(playbackRef.current);
    }
    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, events.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(parseInt(e.target.value, 10));
    setIsPlaying(false);
  };

  const getEventColor = (type: SessionEventType) => {
    switch (type) {
      case SessionEventType.ADHERENCE: return '#059669';
      case SessionEventType.DEVIATION: return '#dc2626';
      case SessionEventType.TRADING: return '#2563eb';
      case SessionEventType.NOTIFICATION: return '#d97706';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Session Replay: <span style={{ color: '#6366f1' }}>{session.id.slice(0, 8)}</span>
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
            Started {new Date(session.start_time).toLocaleString()} • {events.length} Events Total
          </p>
        </div>
        <button 
          onClick={onClose}
          style={{
            padding: '8px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280' }}>No events recorded for this session.</p>
        </div>
      ) : (
        <>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button 
              onClick={togglePlay}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#111827',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              )}
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input 
                type="range" 
                min="0" 
                max={events.length - 1} 
                value={currentIndex} 
                onChange={handleScrub}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#111827' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
                <span>Event {currentIndex + 1} of {events.length}</span>
                <span>{new Date(events[currentIndex]?.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ 
              width: '350px', 
              borderRight: '1px solid #e5e7eb', 
              overflowY: 'auto',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {events.map((evt, idx) => (
                  <div 
                    key={evt.id}
                    onClick={() => { setSelectedEventId(evt.id); setCurrentIndex(idx); setIsPlaying(false); }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: (idx === currentIndex) ? '#f8fafc' : 'transparent',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${getEventColor(evt.type)}`,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{evt.type}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{new Date(evt.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              {selectedEvent && (
                <div style={{ maxWidth: '600px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>{selectedEvent.type}</h3>
                  <pre style={{
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    padding: '24px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    overflowX: 'auto',
                    fontFamily: 'Fira Code, monospace'
                  }}>
                    {JSON.stringify(selectedEvent.event_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

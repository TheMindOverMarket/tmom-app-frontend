import { useState, useEffect, useMemo, useRef } from 'react';
import { Session, SessionEvent, SessionEventType } from '../../domain/session/types';
import { useDeviationEngine } from '../../hooks/useDeviationEngine';
import { AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { ReplayChart } from '../ReplayChart';
import { CONFIG } from '../../config/constants';

interface ReplayPlayerProps {
  session: Session;
  events: SessionEvent[];
  loading: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function ReplayPlayer({ session, events: rawEvents, loading, onClose, isDark = false }: ReplayPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Filter out any stale events that occurred before the session actually started
  // This solves the "Ghost Event" issue where old ticks are processed on session start.
  const events = useMemo(() => {
    const sessionStart = new Date(session.start_time).getTime();
    return rawEvents
      .filter(evt => new Date(evt.timestamp).getTime() >= sessionStart - 1000) // 1s buffer
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [rawEvents, session.start_time]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const { summary: deviationSummary } = useDeviationEngine(session.id);
  const playbackRef = useRef<number | null>(null);

  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), 
    [events, selectedEventId]
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
      case SessionEventType.ADHERENCE: return isDark ? 'var(--auth-accent)' : '#10b981';
      case SessionEventType.DEVIATION: return '#ef4444';
      case SessionEventType.TRADING: return '#3b82f6';
      case SessionEventType.NOTIFICATION: return '#f59e0b';
      default: return 'var(--auth-text-muted)';
    }
  };

  const handleMarkerClick = (timestamp: number, type?: 'adherence' | 'deviation') => {
    const snappedTimestamp = Math.floor(timestamp / 60) * 60;
    const idx = events.findIndex((event) => {
      const eventSnappedTimestamp = Math.floor(new Date(event.timestamp).getTime() / 1000 / 60) * 60;
      if (eventSnappedTimestamp !== snappedTimestamp) return false;
      if (!type) return true;
      return (
        (type === 'deviation' && event.type === SessionEventType.DEVIATION) ||
        (type === 'adherence' && event.type === SessionEventType.ADHERENCE)
      );
    });

    if (idx !== -1) {
       setCurrentIndex(idx);
       setSelectedEventId(events[idx].id);
       setIsPlaying(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: isDark ? 'var(--auth-black)' : '#ffffff',
      color: isDark ? '#ffffff' : 'inherit'
    }}>
      <div style={{
        padding: '32px',
        borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : 'var(--slate-200)'}`,
        backgroundColor: 'transparent',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                backgroundColor: session.status === 'COMPLETED' 
                  ? (isDark ? 'rgba(0, 255, 136, 0.1)' : 'rgba(16, 185, 129, 0.05)') 
                  : 'rgba(239, 68, 68, 0.05)',
                color: session.status === 'COMPLETED' ? (isDark ? 'var(--auth-accent)' : '#10b981') : '#ef4444',
                fontSize: '9px',
                fontWeight: 900,
                fontFamily: "'Space Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: `1px solid ${session.status === 'COMPLETED' 
                  ? (isDark ? 'rgba(0, 255, 136, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                  : 'rgba(239, 68, 68, 0.1)'}`
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                {session.status}
              </div>
              <div style={{
                fontSize: '8px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: CONFIG.WS_ENGINE_URL ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: CONFIG.WS_ENGINE_URL ? (isDark ? 'var(--auth-accent)' : '#10b981') : '#ef4444',
                border: `1px solid ${CONFIG.WS_ENGINE_URL ? 'rgba(0, 255, 136, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                fontFamily: "'Space Mono', monospace",
                fontWeight: 900,
                letterSpacing: '0.1em'
              }}>
                {CONFIG.WS_ENGINE_URL ? 'ENGINE: CONNECTED' : 'ENGINE: CONFIG MISSING'}
              </div>
            </div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: isDark ? 400 : 800, 
              color: isDark ? '#ffffff' : 'var(--slate-900)', 
              margin: 0, 
              letterSpacing: isDark ? '0.02em' : '-0.025em',
              fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit'
            }}>
              Archive: <span style={{ color: isDark ? 'var(--auth-accent)' : 'var(--brand)' }}>{session.id.slice(0, 8).toUpperCase()}</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              padding: '12px',
              borderRadius: '50%',
              border: `1px solid ${isDark ? 'var(--auth-border)' : 'var(--slate-200)'}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: isDark ? '#ffffff' : 'var(--slate-600)'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--slate-50)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'white'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Compact Metadata & Report Strip */}
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          marginBottom: '24px', 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
          padding: '16px 20px',
          borderRadius: '12px',
          border: `1px solid ${isDark ? 'var(--auth-border)' : '#e2e8f0'}`,
          alignItems: 'center'
        }}>
          {session.is_audit_ready && (session.session_metadata as any)?.report_card && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              paddingRight: '24px', 
              borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
              flex: 1 
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: isDark ? 'rgba(0, 255, 136, 0.1)' : '#ffffff',
                border: `2px solid ${isDark ? 'var(--auth-accent)' : '#10b981'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: isDark ? 'var(--auth-accent)' : '#10b981', fontFamily: "'Space Mono', monospace" }}>
                  {(session.session_metadata as any)?.report_card?.consistency_grade}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 900, color: isDark ? 'var(--auth-accent)' : '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>AUDIT REPORT</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#ffffff' : '#0f172a' }}>{(session.session_metadata as any)?.report_card?.behavioral_pattern} • {(session.session_metadata as any)?.report_card?.summary.slice(0, 80)}...</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
            {[
              { label: 'START', value: new Date(session.start_time).toLocaleTimeString() },
              { label: 'USER', value: session.user_id.slice(0, 8).toUpperCase() }
            ].map(meta => (
              <div key={meta.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace" }}>{meta.label}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#ffffff' : '#0f172a', fontFamily: "'Space Mono', monospace" }}>{meta.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost of Deviation Impact */}
        {deviationSummary && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px',
            padding: '24px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.015)' : '#f8fafc',
            borderRadius: '12px',
            border: isDark ? '1px solid var(--auth-border)' : '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2', padding: '12px', borderRadius: '10px', border: isDark ? '1px solid rgba(239, 68, 68, 0.2)' : 'none' }}>
                <DollarSign size={20} color="#ef4444" />
              </div>
              <div>
                <div style={{ 
                  fontSize: '9px', 
                  fontWeight: 900, 
                  color: 'var(--auth-text-muted)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>DEVIATION COST</div>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: 900, 
                  color: '#ef4444',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  -${deviationSummary.total_deviation_cost.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#ffedd5', padding: '12px', borderRadius: '10px', border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : 'none' }}>
                <DollarSign size={20} color="#f59e0b" />
              </div>
              <div>
                <div style={{ 
                  fontSize: '9px', 
                  fontWeight: 900, 
                  color: 'var(--auth-text-muted)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>UNAUTH GAIN</div>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: 900, 
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  ${deviationSummary.total_unauthorized_gain.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: isDark ? 'rgba(0, 255, 136, 0.1)' : '#f1f5f9', padding: '12px', borderRadius: '10px', border: isDark ? '1px solid rgba(0, 255, 136, 0.2)' : 'none' }}>
                <AlertTriangle size={20} color={isDark ? 'var(--auth-accent)' : '#64748b'} />
              </div>
              <div>
                <div style={{ 
                  fontSize: '9px', 
                  fontWeight: 900, 
                  color: 'var(--auth-text-muted)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>DEVIATION FLAGS</div>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: 900, 
                  color: isDark ? 'var(--auth-accent)' : '#0f172a',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  {deviationSummary.deviation_count}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '13px' }}>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '13px' }}>No events recorded for this session.</p>
        </div>
      ) : (
        <>
          <div style={{
            padding: '16px 32px',
            borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#e5e7eb'}`,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <button 
              onClick={togglePlay}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isDark ? '#ffffff' : '#111827',
                color: isDark ? '#000000' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'transform 0.1s active'
              }}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              )}
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input 
                type="range" 
                min="0" 
                max={events.length - 1} 
                value={currentIndex} 
                onChange={handleScrub}
                style={{ 
                  width: '100%', 
                  cursor: 'pointer', 
                  accentColor: isDark ? 'var(--auth-accent)' : '#111827'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '10px', 
                color: 'var(--auth-text-muted)',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 600
              }}>
                <span>EVENT {currentIndex + 1} OF {events.length}</span>
                <span>{new Date(events[currentIndex]?.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Event Timeline Sidebar */}
            <div style={{ 
              width: '320px', 
              borderRight: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`, 
              overflowY: 'auto',
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#fcfdfe',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'transparent' }}>
                <div style={{ 
                  fontSize: '8px', 
                  fontWeight: 900, 
                  color: 'var(--auth-text-muted)', 
                  letterSpacing: '0.15em',
                  fontFamily: "'Space Mono', monospace"
                }}>FEED ({events.length})</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {events.map((evt, idx) => (
                  <div 
                    key={evt.id}
                    id={`event-${evt.id}`}
                    onClick={() => { setSelectedEventId(evt.id); setCurrentIndex(idx); setIsPlaying(false); }}
                    style={{
                      padding: '16px 24px',
                      backgroundColor: (idx === currentIndex) 
                        ? (isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff') 
                        : 'transparent',
                      borderLeft: `4px solid ${(idx === currentIndex) ? getEventColor(evt.type) : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: (idx === currentIndex && !isDark) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      zIndex: (idx === currentIndex) ? 1 : 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ 
                        fontSize: '9px', 
                        fontWeight: 900, 
                        color: getEventColor(evt.type),
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontFamily: "'Space Mono', monospace"
                      }}>{evt.type}</div>
                      <div style={{ 
                        fontSize: '9px', 
                        color: 'var(--auth-text-muted)', 
                        fontWeight: 700,
                        fontFamily: "'Space Mono', monospace"
                      }}>{new Date(evt.timestamp).toLocaleTimeString([], { hour12: false })}</div>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: (idx === currentIndex) ? 600 : 400, 
                      color: (idx === currentIndex) ? '#ffffff' : 'var(--auth-text-muted)',
                      fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                    }}>
                        {evt.event_data?.summary as string || 
                         (evt.event_data?.price ? `Price Action: $${Number(evt.event_data.price).toLocaleString()}` : 
                          (evt.tick ? `Price Tick: #${evt.tick}` : 'System Event'))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Replay Area: Map/Chart + Details Overlay */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              backgroundColor: isDark ? 'var(--auth-black)' : '#f8fafc', 
              position: 'relative' 
            }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                 <ReplayChart 
                   session={session} 
                   events={events} 
                   onMarkerClick={(ts) => {
                     // FLUID SYNC: Find matching event and scroll feed
                     const matchingEvent = events.find(e => {
                       const evtTs = Math.floor(new Date(e.timestamp).getTime() / 1000);
                       return Math.abs(evtTs - ts) < 2;
                     });
                     if (matchingEvent) {
                       setSelectedEventId(matchingEvent.id);
                       const idx = events.findIndex(e => e.id === matchingEvent.id);
                       if (idx !== -1) setCurrentIndex(idx);
                       
                       document.getElementById(`event-${matchingEvent.id}`)?.scrollIntoView({ 
                         behavior: 'smooth', 
                         block: 'center' 
                       });
                     }
                   }} 
                   isDark={isDark}
                   selectedEventId={selectedEventId}
                 />
              </div>

              {/* Collapsible Details Drawer */}
              {selectedEvent && (
                <div style={{ 
                  height: '280px', 
                  backgroundColor: isDark ? 'var(--auth-black)' : '#ffffff', 
                  borderTop: `1px solid ${isDark ? 'var(--auth-border)' : '#e2e8f0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isDark ? '0 -10px 40px rgba(0,0,0,0.5)' : '0 -4px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    padding: '14px 24px', 
                    borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#ffffff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={14} color={getEventColor(selectedEvent.type)} />
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 900, 
                          color: isDark ? '#ffffff' : '#0f172a',
                          letterSpacing: '0.1em',
                          fontFamily: "'Space Mono', monospace"
                        }}>EVENT INSPECTOR</span>
                    </div>
                    <div style={{ 
                      fontSize: '9px', 
                      color: 'var(--auth-text-muted)', 
                      fontWeight: 700,
                      fontFamily: "'Space Mono', monospace"
                    }}>{selectedEvent.id}</div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    <pre style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#f8fafc',
                      color: isDark ? 'var(--auth-accent)' : '#334155',
                      padding: '20px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      lineHeight: '1.6',
                      overflowX: 'auto',
                      fontFamily: "'Space Mono', monospace",
                      border: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`
                    }}>
                      {JSON.stringify(selectedEvent.event_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

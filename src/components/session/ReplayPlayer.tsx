import { useState, useEffect, useMemo } from 'react';
import { Session, SessionEvent, SessionEventType } from '../../domain/session/types';
import { Activity } from 'lucide-react';
import { ReplayChart } from '../ReplayChart';
import { playbookApi } from '../../domain/playbook/api';
import { Playbook, Rule } from '../../domain/playbook/types';
import { RuleLogicTree } from '../playbook/RuleLogicTree';

interface ReplayPlayerProps {
  session: Session;
  events: SessionEvent[];
  loading: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function ReplayPlayer({ session, events: rawEvents, loading, onClose, isDark = true }: ReplayPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);

  // Filter out any stale events that occurred before the session actually started
  // This solves the "Ghost Event" issue where old ticks are processed on session start.
  const events = useMemo(() => {
    const sessionStart = new Date(session.start_time).getTime();
    return rawEvents
      .filter(evt => new Date(evt.timestamp).getTime() >= sessionStart - 1000) // 1s buffer
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [rawEvents, session.start_time]);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  useEffect(() => {
    const fetchPlaybook = async () => {
      if (!session.playbook_id) return;
      try {
        const data = await playbookApi.getPlaybook(session.playbook_id);
        setPlaybook(data);
      } catch (err) {
        console.error("Failed to fetch playbook for replay:", err);
      }
    };
    fetchPlaybook();
  }, [session.playbook_id]);



  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), 
    [events, selectedEventId]
  );

  useEffect(() => {
    let interval: any;
    if (isPlaying && events.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= events.length) {
            setIsPlaying(false);
            return prev;
          }
          
          // FLUID SYNC: Keep list in view
          const nextEvent = events[next];
          setSelectedEventId(nextEvent.id);
          
          // Use requestAnimationFrame for smoother scroll
          requestAnimationFrame(() => {
            document.getElementById(`event-${nextEvent.id}`)?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest' 
            });
          });
          
          return next;
        });
      }, 1000); // 1-second playback steps
    }
    return () => clearInterval(interval);
  }, [isPlaying, events, setSelectedEventId]);

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

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: isDark ? 'var(--auth-black)' : '#ffffff',
      color: isDark ? '#ffffff' : 'inherit'
    }}>
      <div style={{
        padding: '12px 24px',
        borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : 'var(--slate-200)'}`,
        backgroundColor: isDark ? 'var(--auth-black)' : '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexShrink: 0
      }}>
        {/* LEFT: Branding & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: isDark ? 400 : 800, 
            margin: 0, 
            fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit'
          }}>
            Archive: <span style={{ color: isDark ? 'var(--auth-accent)' : 'var(--brand)' }}>{session.id.slice(0, 8).toUpperCase()}</span>
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '4px 10px', 
            borderRadius: '6px', 
            backgroundColor: session.status === 'COMPLETED' ? (isDark ? 'rgba(0, 255, 136, 0.1)' : 'rgba(16, 185, 129, 0.05)') : 'rgba(239, 68, 68, 0.05)',
            color: session.status === 'COMPLETED' ? (isDark ? 'var(--auth-accent)' : '#10b981') : '#ef4444',
            fontSize: '9px', fontWeight: 900, fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em'
          }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            {session.status}
          </div>
          
          {session.is_audit_ready && session.session_metadata?.report_card && (
             <div style={{
               display: 'flex', alignItems: 'center', gap: '8px',
               padding: '4px 12px', borderRadius: '6px',
               backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
               border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1'
             }}>
               <span style={{ fontSize: '10px', fontWeight: 900, color: isDark ? 'var(--auth-accent)' : '#10b981', fontFamily: "'Space Mono', monospace" }}>
                 GRADE: {session.session_metadata.report_card.consistency_grade}
               </span>
             </div>
          )}
        </div>

        {/* CENTER: Scrubber */}
        {!loading && events.length > 0 && (
          <div style={{ flex: 1, maxWidth: '600px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={togglePlay}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                backgroundColor: isDark ? '#ffffff' : '#111827', color: isDark ? '#000000' : '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
              }}
            >
              {isPlaying ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>}
            </button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input type="range" min="0" max={events.length - 1} value={currentIndex} onChange={handleScrub} style={{ width: '100%', cursor: 'pointer', accentColor: isDark ? 'var(--auth-accent)' : '#111827' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
                <span>EVENT {currentIndex + 1} OF {events.length}</span>
                <span>{new Date(events[currentIndex]?.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT: Close */}
        <button onClick={onClose} style={{ padding: '8px', borderRadius: '50%', border: `1px solid ${isDark ? 'var(--auth-border)' : 'var(--slate-200)'}`, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white', cursor: 'pointer', color: isDark ? '#ffffff' : 'var(--slate-600)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
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
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Event Timeline Sidebar (Left) */}
          <div style={{ 
            width: '240px', 
            borderRight: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`, 
            overflowY: 'auto',
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#fcfdfe',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'transparent' }}>
              <div style={{ fontSize: '8px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>FEED ({events.length})</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {events.map((evt, idx) => (
                <div 
                  key={evt.id}
                  id={`event-${evt.id}`}
                  onClick={() => { setSelectedEventId(evt.id); setCurrentIndex(idx); setIsPlaying(false); }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: (idx === currentIndex) ? (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9') : 'transparent',
                    borderLeft: `3px solid ${(idx === currentIndex) ? getEventColor(evt.type) : 'transparent'}`,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: getEventColor(evt.type), textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>{evt.type}</div>
                    <div style={{ fontSize: '9px', color: 'var(--auth-text-muted)', fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{new Date(evt.timestamp).toLocaleTimeString([], { hour12: false })}</div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: (idx === currentIndex) ? 600 : 400, color: (idx === currentIndex) ? (isDark ? '#fff' : '#000') : 'var(--auth-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evt.event_data?.summary as string || 
                       (evt.event_data?.price ? `Price: $${Number(evt.event_data.price).toLocaleString()}` : 
                        (evt.tick ? `Tick #${evt.tick}` : 'System Event'))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chart Area (Center) */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', backgroundColor: isDark ? 'var(--auth-black)' : '#f8fafc' }}>
             <ReplayChart 
               session={session} 
               events={events} 
               onMarkerClick={(ts) => {
                 const matchingEvent = events.find(e => Math.abs(Math.floor(new Date(e.timestamp).getTime() / 1000) - ts) < 2);
                 if (matchingEvent) {
                   setSelectedEventId(matchingEvent.id);
                   const idx = events.findIndex(e => e.id === matchingEvent.id);
                   if (idx !== -1) setCurrentIndex(idx);
                   document.getElementById(`event-${matchingEvent.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }
               }} 
               isDark={isDark}
               selectedEventId={selectedEventId}
             />
          </div>

          {/* Event Inspector Sidebar (Right) */}
          {selectedEvent && (
            <div style={{ 
              width: '320px', 
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : '#ffffff', 
              borderLeft: `1px solid ${isDark ? 'var(--auth-border)' : '#e2e8f0'}`,
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0
            }}>
              <div style={{ padding: '16px', borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} color={getEventColor(selectedEvent.type)} />
                  <span style={{ fontSize: '11px', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>SESSION EVENT INSPECTOR</span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {/* AI Reasoning Section */}
                {((selectedEvent.event_data as any)?.ai_reasoning || (selectedEvent.event_metadata as any)?.ai_reasoning || (selectedEvent as any).ai_reasoning) && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace", marginBottom: '8px' }}>AI SIGNAL / REASONING</div>
                    <div style={{ padding: '12px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#bfdbfe'}`, fontSize: '12px', lineHeight: '1.6', color: isDark ? '#e2e8f0' : '#1e3a8a' }}>
                      {(selectedEvent.event_data as any)?.ai_reasoning || (selectedEvent.event_metadata as any)?.ai_reasoning || (selectedEvent as any).ai_reasoning}
                    </div>
                  </div>
                )}

                {/* Rules Evaluated */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace", marginBottom: '12px' }}>RULE EVALUATIONS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.keys(selectedEvent.event_data.rule_evaluations || {}).length > 0 ? (
                      Object.entries(selectedEvent.event_data.rule_evaluations || {}).map(([ruleId, passed]) => {
                        const rule = (playbook?.rules || []).find((r: Rule) => r.id === ruleId || r.name === ruleId);
                        const isTrue = passed === true;
                        return (
                          <div key={ruleId} style={{ 
                            padding: '12px', 
                            backgroundColor: isDark ? (isTrue ? 'rgba(0, 255, 136, 0.05)' : 'rgba(239, 68, 68, 0.05)') : (isTrue ? '#f0fdf4' : '#fef2f2'),
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? (isTrue ? 'rgba(0, 255, 136, 0.2)' : 'rgba(239, 68, 68, 0.2)') : (isTrue ? '#bcf1d3' : '#fee2e2')}`,
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: rule ? '12px' : '0' }}>
                              <div style={{ fontSize: '11px', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '0.05em', fontFamily: "'Space Mono', monospace" }}>
                                {rule ? 'RULE EVALUATED' : (ruleId.length > 20 ? `ID: ${ruleId.slice(0, 8)}` : ruleId)}
                              </div>
                              <div style={{ 
                                padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 900, fontFamily: "'Space Mono', monospace",
                                backgroundColor: isTrue ? (isDark ? 'var(--auth-accent)' : '#10b981') : '#ef4444',
                                color: isDark ? 'var(--auth-black)' : '#ffffff',
                                boxShadow: isTrue && isDark ? '0 0 10px rgba(0,255,136,0.2)' : 'none'
                              }}>
                                {isTrue ? 'PASS' : 'FAIL'}
                              </div>
                            </div>
                            {rule && (
                                <div style={{ 
                                    transform: 'scale(0.95)', 
                                    transformOrigin: 'top left', 
                                    width: '105.26%',
                                    margin: '-8px 0 -16px 0'
                                }}>
                                   <RuleLogicTree rule={rule} isDark={isDark} />
                                </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '8px', color: 'var(--auth-text-muted)', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>
                        NO RULE EVALUATIONS FOR THIS EVENT
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Event Metadata */}
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace", marginBottom: '12px' }}>EVENT DATA</div>
                  <div style={{ padding: '12px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontFamily: "'Space Mono', monospace", color: isDark ? '#e2e8f0' : '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--auth-text-muted)' }}>TIME</span>
                      <span>{new Date(selectedEvent.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {selectedEvent.event_data?.price && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--auth-text-muted)' }}>PRICE</span>
                        <span>${Number(selectedEvent.event_data.price).toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--auth-text-muted)' }}>TYPE</span>
                      <span>{selectedEvent.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useRuleEngineEvents } from '../hooks/useRuleEngineEvents';
import { PriceChart } from '../components/PriceChart';
import { RuleEventInspector } from '../components/RuleEventInspector';
import { Activity, Circle, Check, X } from 'lucide-react';
import { useDeviationEngine } from '../hooks/useDeviationEngine';
import { DeviationPanel } from '../components/deviation/DeviationPanel';
import { resolvePlaybookSymbol } from '../domain/playbook/utils';
import { RuleLogicTree } from '../components/playbook/RuleLogicTree';

export function MonitorPage() {
  const {
    selectedPlaybook,
    playbooks,
    activeSession,
    isStreaming,
    isStartingStream,
    isStoppingStream,
    startStream,
    stopStream,
    lastCompletedSessionId,
    clearLastCompletedSession,
  } = usePlaybookContext();
  const { events, lastEvent, isMockMode, toggleMockMode } = useRuleEngineEvents(isStreaming, activeSession?.id);
  const { summary: deviationSummary, records: deviationRecords } = useDeviationEngine(activeSession?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (lastCompletedSessionId) {
      const timer = setTimeout(() => {
        clearLastCompletedSession();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastCompletedSessionId, clearLastCompletedSession]);

  const [focusedView, setFocusedView] = useState<{ timestamp: number; filter: 'adherence' | 'deviation' | null } | null>(null);
  const isLoading = isStartingStream || isStoppingStream;
  const supervisionPlaybook =
    (activeSession ? playbooks.find((playbook) => playbook.id === activeSession.playbook_id) : selectedPlaybook) ??
    selectedPlaybook ??
    playbooks.find((playbook) => playbook.is_active) ??
    null;

  const rules = (supervisionPlaybook?.context?.compiled_rules as any[]) || [];

  const allChartEvents = useMemo(() => {
    const mappedDeviations = deviationRecords.map(rec => ({
      id: rec.id,
      timestamp: Math.floor(rec.detected_at / 1000),
      msTimestamp: rec.detected_at,
      originalTimestamp: new Date(rec.detected_at).toISOString(),
      price: (rec.explainability_payload as any)?.price || 0,
      playbook_id: supervisionPlaybook?.id || '',
      session_id: activeSession?.id || '',
      user_id: supervisionPlaybook?.user_id || '',
      rule: rec.deviation_type,
      rule_triggered: false,
      triggered_entries: [],
      rule_evaluations: {},
      action: false,
      deviation: true,
      ai_reasoning: rec.ai_reasoning,
      rawRule: rec.explainability_payload
    }));

    const combined = [...events];
    mappedDeviations.forEach(dev => {
      if (!combined.some(e => e.id === dev.id)) {
        combined.push(dev as any);
      }
    });

    return combined;
  }, [events, deviationRecords, supervisionPlaybook, activeSession]);

  // Guard: Redirect if no playbook selected
  useEffect(() => {
    if (playbooks.length === 0 && !activeSession) {
      navigate('/playbooks');
    }
  }, [activeSession, navigate, playbooks.length]);

  const handleMarkerClick = (timestamp: number, type?: 'adherence' | 'deviation') => {
    setFocusedView({ timestamp, filter: type || null });
  };

  if (!supervisionPlaybook) return null;
  const playbookSymbol = resolvePlaybookSymbol(supervisionPlaybook);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 340px', 
      gap: '12px', 
      flex: 1,
      minHeight: 0,
      backgroundColor: 'var(--auth-black)',
      padding: '12px',
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left Column: Chart & Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid var(--auth-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={16} color="var(--auth-accent)" />
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 900, 
                color: '#ffffff', 
                letterSpacing: '0.15em', 
                fontFamily: "'Space Mono', monospace" 
              }}>
                PLAYBOOK SUPERVISION: <span style={{ color: 'var(--auth-accent)' }}>{(supervisionPlaybook?.name || 'PLAYBOOK').toUpperCase()}</span>
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleMockMode}
              style={{
                display: 'none', // HIDDEN for now until requested for a demo
                padding: '0 12px',
                height: '32px',
                backgroundColor: isMockMode ? '#0f172a' : 'white',
                color: isMockMode ? 'white' : 'var(--slate-500)',
                border: `1px solid ${isMockMode ? '#0f172a' : 'var(--slate-200)'}`,
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Toggle Live Session Simulation [MOCK DATA MODE]"
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: isMockMode ? 'white' : 'var(--slate-400)' 
              }} />
              {isMockMode ? 'SIMULATING' : 'VIRTUAL FEED'}
            </button>

            <button
              onClick={isStreaming ? stopStream : () => startStream(supervisionPlaybook.id)}
              disabled={isLoading || (!isStreaming && supervisionPlaybook.generation_status !== 'COMPLETED')}
              style={{
                  height: '28px',
                  padding: '0 16px',
                  backgroundColor: isStreaming ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                  color: isStreaming ? '#ef4444' : 'var(--auth-accent)',
                  border: `1px solid ${isStreaming ? '#ef4444' : 'var(--auth-accent)'}`,
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 900,
                  cursor: (isLoading || (!isStreaming && supervisionPlaybook.generation_status !== 'COMPLETED')) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Space Mono', monospace",
                  transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: isStreaming ? '#ef4444' : 'var(--auth-accent)', 
                animation: (isStreaming || isLoading) ? 'pulse 1.5s infinite' : 'none' 
              }} />
              {isStartingStream ? 'WARMING...' : (isStoppingStream ? 'CLOSING...' : (isStreaming ? 'STOP STREAM' : 'START LIVE'))}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: 'var(--auth-black)', borderRadius: '4px', border: '1px solid #1e293b', overflow: 'hidden' }}>
          <PriceChart 
            events={allChartEvents}
            symbol={playbookSymbol}
            onMarkerClick={handleMarkerClick}
            isDark={true}
            selectedTimestamp={focusedView?.timestamp}
          />
        </div>

        {/* Rules Dashboard: High-Density At-a-Glance view */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: '4px',
          border: '1px solid var(--auth-border)',
          maxHeight: '280px',
          flexShrink: 0
        }}>
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: 'transparent', 
            borderBottom: '1px solid var(--auth-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Circle size={10} color="var(--auth-accent)" />
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>SESSION RULES</div>
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '12px',
            overflowY: 'auto'
          }}>
            {rules.length === 0 ? (
              <div style={{ fontSize: '11px', color: 'var(--auth-text-muted)', textAlign: 'center', padding: '12px' }}>
                Fetching active playbook parameters...
              </div>
            ) : (
              rules.map((rule, idx) => {
                const status = lastEvent?.rule_status?.[rule.id];
                return (
                  <div key={rule.id || idx} style={{
                    border: `1px solid ${
                      status === false ? 'rgba(239, 68, 68, 0.2)' : 
                      status === true ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255,255,255,0.05)'
                    }`,
                    borderRadius: '4px',
                    backgroundColor: status === false ? 'rgba(239, 68, 68, 0.05)' : 
                                     status === true ? 'rgba(0, 255, 136, 0.05)' : 'rgba(0,0,0,0.15)',
                    boxShadow: status === false ? '0 0 15px rgba(239, 68, 68, 0.1)' : 'none',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Card Header */}
                    <div style={{ 
                        padding: '8px 12px', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#ffffff', fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}>{rule.name.toUpperCase()}</span>
                            <span style={{ 
                                fontSize: '8px', 
                                padding: '1px 6px', 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                color: 'var(--auth-text-muted)', 
                                borderRadius: '2px', 
                                fontWeight: 900, 
                                letterSpacing: '0.05em',
                                fontFamily: "'Space Mono', monospace"
                            }}>{rule.category.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {status === true && <Check size={14} color="var(--auth-accent)" strokeWidth={3} />}
                            {status === false && <X size={14} color="#ef4444" strokeWidth={3} />}
                        </div>
                    </div>

                    <div style={{ padding: '12px' }}>
                      <RuleLogicTree rule={rule} isDark={true} compact={true} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Rule Engine Feed + Deviation Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: '16px', height: '100%' }}>
        <RuleEventInspector 
          events={allChartEvents} 
          rules={rules}
          focusedTimestamp={focusedView?.timestamp || null}
          isActive={isStreaming}
          filterType={focusedView?.filter || null}
          onClearFocus={() => setFocusedView(null)}
        />
        <DeviationPanel
          summary={deviationSummary}
          records={deviationRecords}
          isActive={isStreaming}
          onRecordClick={(ts) => handleMarkerClick(ts, 'deviation')}
        />
      </div>

      {lastCompletedSessionId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--auth-black)',
            border: '1px solid var(--auth-border)',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={clearLastCompletedSession}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8,
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <X size={20} />
            </button>
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid rgba(0, 255, 136, 0.2)'
              }}>
                <Check size={24} color="var(--auth-accent)" />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontFamily: "'Cormorant Garamond', serif", color: '#ffffff' }}>
                Session Completed
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace" }}>
                Supervision has been stopped. The engine records have been finalized and are ready for review.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={clearLastCompletedSession}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--auth-border)',
                  color: 'var(--auth-text-muted)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '11px',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.1em'
                }}
              >
                DISMISS
              </button>
              <button
                onClick={() => {
                  clearLastCompletedSession();
                  navigate(`/analytics?session_id=${lastCompletedSessionId}`);
                }}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid var(--auth-accent)',
                  color: 'var(--auth-accent)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '11px',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.1em'
                }}
              >
                VIEW ANALYTICS &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

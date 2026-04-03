import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useRuleEngineEvents } from '../hooks/useRuleEngineEvents';
import { PriceChart } from '../components/PriceChart';
import { RuleEventInspector } from '../components/RuleEventInspector';
import { Activity, Circle, Check, X, Bell } from 'lucide-react';
import { useDeviationEngine } from '../hooks/useDeviationEngine';
import { DeviationPanel } from '../components/deviation/DeviationPanel';

export function MonitorPage() {
  const { selectedPlaybook, rules, activeSession, isStreaming, isStartingStream, isStoppingStream, startStream, stopStream } = usePlaybookContext();
  const { events, lastEvent, isMockMode, toggleMockMode } = useRuleEngineEvents(isStreaming, activeSession?.id);
  const { summary: deviationSummary, records: deviationRecords } = useDeviationEngine(activeSession?.id);
  const navigate = useNavigate();

  const [focusedView, setFocusedView] = useState<{ timestamp: number; filter: 'adherence' | 'deviation' | null } | null>(null);
  const isLoading = isStartingStream || isStoppingStream;

  // Guard: Redirect if no playbook selected
  useEffect(() => {
    if (!selectedPlaybook) {
      navigate('/playbooks');
    }
  }, [selectedPlaybook, navigate]);

  const handleMarkerClick = (timestamp: number, type?: 'adherence' | 'deviation') => {
    setFocusedView({ timestamp, filter: type || null });
  };

  if (!selectedPlaybook) return null;


  const { notification } = usePlaybookContext();

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 340px', 
      gap: '16px', 
      flex: 1,
      minHeight: 0
    }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          backgroundColor: notification.type === 'success' ? '#059669' : '#dc2626',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 700,
          animation: 'slideDown 0.3s ease-out'
        }}>
          <Bell size={16} />
          {notification.message}
        </div>
      )}

      {/* Left Column: Chart & Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={12} color="var(--brand)" />
              <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--slate-400)', letterSpacing: '0.05em' }}>PLAYBOOK SUPERVISION:</div>
              <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 800 }}>{selectedPlaybook.name}</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleMockMode}
              style={{
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
                display: 'flex',
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
              onClick={isStreaming ? stopStream : () => startStream(selectedPlaybook.id)}
              disabled={isLoading || (!isStreaming && selectedPlaybook.generation_status !== 'COMPLETED')}
              style={{
                  height: '32px',
                  padding: '0 16px',
                  backgroundColor: isLoading ? 'var(--slate-50)' : (isStreaming ? 'var(--danger-alpha)' : (selectedPlaybook.generation_status === 'COMPLETED' ? '#0f172a' : 'var(--slate-50)')),
                  color: (isLoading || (selectedPlaybook.generation_status !== 'COMPLETED' && !isStreaming)) ? 'var(--slate-400)' : (isStreaming ? 'var(--danger)' : 'white'),
                  border: isStreaming ? '1px solid var(--danger)' : 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: (isLoading || (!isStreaming && selectedPlaybook.generation_status !== 'COMPLETED')) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (isLoading || (selectedPlaybook.generation_status !== 'COMPLETED' && !isStreaming)) ? 0.6 : 1,
                  transition: 'all 0.2s ease'
              }}
              title={selectedPlaybook.generation_status !== 'COMPLETED' ? "Playbook analysis in progress. Monitoring restricted." : "Initialize real-time supervision orchestration"}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: isStreaming ? 'var(--danger)' : 'white', 
                animation: (isStreaming || isLoading) ? 'pulse 1.5s infinite' : 'none' 
              }} />
              {isStartingStream ? 'WARMING UP...' : (isStoppingStream ? 'CLOSING...' : (isStreaming ? 'STOP STREAM' : (selectedPlaybook.generation_status === 'COMPLETED' ? 'START LIVE SESSION' : 'ANALYZING...')))}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <PriceChart 
            events={events}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Rules Dashboard: High-Density At-a-Glance view */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          maxHeight: '280px',
          flexShrink: 0
        }}>
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f8fafc', 
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Circle size={10} color="#94a3b8" />
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.15em' }}>SESSION RULES</div>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '4px',
            padding: '8px',
            overflowY: 'auto'
          }}>
            {rules.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1', padding: '12px' }}>
                Fetching active playbook parameters...
              </div>
            ) : (
              rules.map((rule, idx) => (
                <div key={rule.id || idx} style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${
                    lastEvent?.deviation_true?.includes(rule.id) ? '#fee2e2' : 
                    lastEvent?.deviation_false?.includes(rule.id) ? '#dcfce7' : '#f1f5f9'
                  }`,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.3s ease',
                  boxShadow: lastEvent?.deviation_true?.includes(rule.id) ? '0 0 10px rgba(239, 68, 68, 0.1)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <div style={{ 
                        fontSize: '10px', 
                        fontWeight: '900', 
                        color: '#0f172a', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.01em',
                        lineHeight: '1.2'
                      }}>
                        {rule.name}
                      </div>
                    </div>
                    {lastEvent?.deviation_true?.includes(rule.id) ? (
                      <X size={12} color="#ef4444" strokeWidth={3} />
                    ) : lastEvent?.deviation_false?.includes(rule.id) ? (
                      <Check size={12} color="#10b981" strokeWidth={3} />
                    ) : (
                      <Circle size={8} color="#cbd5e1" />
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {rule.conditions?.map((cond: any, cIdx: number) => (
                      <div key={cond.id || cIdx} style={{ 
                        fontSize: '8.5px', 
                        padding: '2px 6px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '2px', 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #f1f5f9'
                      }}>
                        <Circle size={6} color="#e2e8f0" />
                        <span style={{ fontWeight: 800, color: 'var(--brand)' }}>{cond.metric}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 700 }}>{cond.comparator}</span>
                        <span style={{ fontWeight: 900, color: '#0f172a' }}>{cond.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Rule Engine Feed + Deviation Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: '16px' }}>
        <RuleEventInspector 
          events={events} 
          focusedTimestamp={focusedView?.timestamp || null}
          isActive={isStreaming}
          filterType={focusedView?.filter || null}
          onClearFocus={() => setFocusedView(null)}
        />
        <DeviationPanel
          summary={deviationSummary}
          records={deviationRecords}
          isActive={isStreaming}
        />
      </div>
    </div>
  );
}

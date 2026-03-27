import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useRuleEngineEvents } from '../hooks/useRuleEngineEvents';
import { PriceChart } from '../components/PriceChart';
import { RuleEventInspector } from '../components/RuleEventInspector';
import { Activity, Circle } from 'lucide-react';

export function MonitorPage() {
  const { selectedPlaybook, rules, activeSession, isStreaming, isStartingStream, isStoppingStream, startStream, stopStream } = usePlaybookContext();
  const { events, isMockMode, toggleMockMode } = useRuleEngineEvents(isStreaming, activeSession?.id);
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

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 400px', 
      gap: '24px', 
      flex: 1,
      minHeight: 0
    }}>
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
      </div>

      {/* Right Column: Rule Engine & Logic Inspector */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 0,
        gap: '16px'
      }}>
        {/* Logic Inspector Panel */}
        <div style={{ 
          flex: 1, 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '10px 16px', 
            backgroundColor: '#f8fafc', 
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Circle size={10} color="#94a3b8" />
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em' }}>PLAYBOOK LOGIC</div>
          </div>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {rules.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                Fetching playbook parameters...
              </div>
            ) : (
              rules.map((rule, idx) => (
                <div key={rule.id || idx} style={{
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #f1f5f9',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Circle size={8} color="#cbd5e1" />
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}>{rule.name}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.4', marginBottom: '10px', paddingLeft: '16px' }}>{rule.description}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '16px' }}>
                    {rule.conditions?.map((cond: any, cIdx: number) => (
                      <div key={cond.id || cIdx} style={{ 
                        fontSize: '10px', 
                        padding: '6px 10px', 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #f1f5f9', 
                        borderRadius: '2px', 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '8px' 
                      }}>
                        <Circle size={6} color="#e2e8f0" />
                        <span style={{ fontWeight: 800, color: 'var(--brand)' }}>{cond.metric}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 700 }}>{cond.comparator}</span>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{cond.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Existing Event Inspector Panel */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <RuleEventInspector 
            events={events} 
            focusedTimestamp={focusedView?.timestamp || null}
            isActive={isStreaming}
            filterType={focusedView?.filter || null}
            onClearFocus={() => setFocusedView(null)}
          />
        </div>
      </div>
    </div>
  );
}

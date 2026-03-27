import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useRuleEngineEvents } from '../hooks/useRuleEngineEvents';
import { PriceChart } from '../components/PriceChart';
import { RuleEventInspector } from '../components/RuleEventInspector';
import { Activity } from 'lucide-react';

export function MonitorPage() {
  const { selectedPlaybook, activeSession, isStreaming, isStartingStream, isStoppingStream, startStream, stopStream } = usePlaybookContext();
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

      {/* Right Column: Rule Engine */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <RuleEventInspector 
          events={events} 
          focusedTimestamp={focusedView?.timestamp || null}
          isActive={isStreaming}
          filterType={focusedView?.filter || null}
          onClearFocus={() => setFocusedView(null)}
        />
      </div>
    </div>
  );
}

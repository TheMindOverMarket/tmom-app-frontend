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
          padding: '12px 20px',
          borderRadius: '12px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={14} color="var(--brand)" />
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--slate-400)' }}>STRATEGY SUPERVISION:</div>
            <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 700 }}>{selectedPlaybook.name}</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleMockMode}
              style={{
                padding: '6px 12px',
                backgroundColor: isMockMode ? 'var(--brand)' : 'white',
                color: isMockMode ? 'white' : 'var(--slate-400)',
                border: `1px solid ${isMockMode ? 'var(--brand)' : 'var(--slate-200)'}`,
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Toggle Live Session Simulation"
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
              disabled={isLoading}
              style={{
                  padding: '6px 16px',
                  backgroundColor: isLoading ? 'var(--slate-100)' : (isStreaming ? 'var(--danger)' : 'var(--success)'),
                  color: isLoading ? 'var(--slate-400)' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: isLoading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isLoading ? 0.8 : 1,
                  transition: 'var(--transition)'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: 'white', 
                animation: (isStreaming || isLoading) ? 'pulse 1.5s infinite' : 'none' 
              }} />
              {isStartingStream ? 'WARMING UP...' : (isStoppingStream ? 'CLOSING...' : (isStreaming ? 'STOP STREAM' : 'START LIVE SESSION'))}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
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

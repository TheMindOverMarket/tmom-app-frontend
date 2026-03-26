import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useRuleEngineEvents } from '../hooks/useRuleEngineEvents';
import { PriceChart } from '../components/PriceChart';
import { RuleEventInspector } from '../components/RuleEventInspector';
import { Activity } from 'lucide-react';

export function MonitorPage() {
  const { selectedPlaybook, isStreaming, isStartingStream, isStoppingStream, startStream, stopStream } = usePlaybookContext();
  const { events } = useRuleEngineEvents(isStreaming);
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
            <Activity size={14} color="#6366f1" />
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ACTIVE MONITORING:</div>
            <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 700 }}>{selectedPlaybook.name}</div>
          </div>
          
          <button
            onClick={isStreaming ? stopStream : () => startStream(selectedPlaybook.id)}
            disabled={isLoading}
            style={{
                padding: '6px 16px',
                backgroundColor: isLoading ? '#e2e8f0' : (isStreaming ? '#EF4444' : '#059669'),
                color: isLoading ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: isLoading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isLoading ? 0.8 : 1,
                transition: 'all 0.2s'
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
          filterType={focusedView?.filter || null}
          onClearFocus={() => setFocusedView(null)}
        />
      </div>
    </div>
  );
}

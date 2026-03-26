import { useState, useCallback } from 'react';
import { usePlaybook } from './hooks/usePlaybook';
import { useRuleEngineEvents } from './hooks/useRuleEngineEvents';
import { Header } from './components/layout/Header';
import { PriceChart } from './components/PriceChart';

import { RuleEventInspector } from './components/RuleEventInspector';
import { StrategyIngestion } from './components/strategy/StrategyIngestion';
import { NotificationBanner } from './components/common/NotificationBanner';
import { SessionAnalytics } from './components/session/SessionAnalytics';

function App() {
  const { 
    strategyInput, 
    setStrategyInput, 
    isSubmitting, 
    notification, 
    setNotification, 
    submitStrategy,
    playbooks,
    selectedPlaybook,
    setSelectedPlaybook,
    activeSession,
    isStreaming,
    startStream,
    stopStream
  } = usePlaybook();

  const { events, isMockMode, toggleMockMode } = useRuleEngineEvents();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'playbooks' | 'monitor' | 'analytics'>('playbooks');
  
  // Interaction State
  const [focusedView, setFocusedView] = useState<{ timestamp: number; filter: 'adherence' | 'deviation' | null } | null>(null);

  const handleMarkerClick = useCallback((timestamp: number, type?: 'adherence' | 'deviation') => {
    setFocusedView({
      timestamp,
      filter: type || null
    });
  }, []);

  const handleSelectAndMonitor = (playbook: any) => {
    setSelectedPlaybook(playbook);
    setActiveTab('monitor');
  };

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '"Inter", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ flexShrink: 0 }}>
        <Header isMockMode={isMockMode} onToggleMockMode={toggleMockMode} />
      </div>

      {notification && (
        <NotificationBanner 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '24px',
        padding: '0 24px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        flexShrink: 0,
        height: '32px'
      }}>
        {['playbooks', 'monitor', 'analytics'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '0 4px',
              fontSize: '11px',
              fontWeight: 800,
              color: activeTab === tab ? '#6366f1' : '#64748b',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              height: '100%',
              letterSpacing: '0.05em',
              opacity: (tab === 'monitor' && !selectedPlaybook) ? 0.4 : 1
            }}
            disabled={tab === 'monitor' && !selectedPlaybook}
          >
            {tab === 'analytics' ? 'SESSION ANALYTICS' : tab.toUpperCase()}
          </button>
        ))}
      </div>

      <main style={{ 
        flex: 1, 
        padding: '24px', 
        maxWidth: '1800px', 
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {activeTab === 'playbooks' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1, minHeight: 0 }}>
              <section style={{ 
                padding: '24px', 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                flexShrink: 0
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>INGEST NEW PLAYBOOK</h3>
                <StrategyIngestion 
                  value={strategyInput}
                  onChange={setStrategyInput}
                  onSubmit={submitStrategy}
                  isSubmitting={isSubmitting}
                  onStartSession={() => {}} 
                  onStopSession={() => {}}
                  isStreaming={false}
                  disabled={true}
                />
              </section>

              <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>YOUR PLAYBOOKS</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                  gap: '16px', 
                  overflowY: 'auto',
                  paddingBottom: '24px'
                }}>
                  {playbooks.map(pb => (
                    <div 
                      key={pb.id} 
                      style={{ 
                        padding: '20px', 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        border: selectedPlaybook?.id === pb.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{pb.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Created {new Date(pb.created_at).toLocaleDateString()}</div>
                        </div>
                        <button 
                          onClick={() => handleSelectAndMonitor(pb)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: selectedPlaybook?.id === pb.id ? '#6366f1' : '#f1f5f9',
                            color: selectedPlaybook?.id === pb.id ? 'white' : '#475569',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {selectedPlaybook?.id === pb.id ? 'ACTIVE' : 'SELECT'}
                        </button>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#475569', 
                        backgroundColor: '#f8fafc', 
                        padding: '10px', 
                        borderRadius: '8px',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                      }}>
                        {pb.original_nl_input}
                      </div>
                    </div>
                  ))}
                  {playbooks.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px' }}>
                      No playbooks yet. Ingest your first strategy above!
                    </div>
                  )}
                </div>
              </section>
           </div>
        )}

        {activeTab === 'monitor' && selectedPlaybook && (
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
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>MONITORING:</div>
                  <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>{selectedPlaybook.name}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button
                    onClick={isStreaming ? stopStream : () => startStream(selectedPlaybook.id)}
                    style={{
                        padding: '6px 16px',
                        backgroundColor: isStreaming ? '#EF4444' : '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', animation: isStreaming ? 'pulse 1.5s infinite' : 'none' }}></div>
                    {isStreaming ? 'STOP STREAM' : 'START LIVE SESSION'}
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
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
        )}

        {activeTab === 'analytics' && (
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <SessionAnalytics />
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      ` }} />
    </div>
  );
}

export default App;

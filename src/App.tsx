import { useState, useCallback } from 'react';
import { usePlaybook } from './hooks/usePlaybook';
import { useRuleEngineEvents } from './hooks/useRuleEngineEvents';
import { Header } from './components/layout/Header';
import { UserIDBanner } from './components/layout/UserIDBanner';
import { PriceChart } from './components/PriceChart';
import { RuleEventInspector } from './components/RuleEventInspector';
import { StrategyIngestion } from './components/strategy/StrategyIngestion';
import { NotificationBanner } from './components/common/NotificationBanner';
import { SessionAnalytics } from './components/session/SessionAnalytics';

function App() {
  const { 
    ruleInput, 
    setRuleInput, 
    isSubmitting, 
    notification, 
    setNotification, 
    submitStrategy,
    isStreaming,
    startStream,
    stopStream,
    lastPlaybookId
  } = usePlaybook();

  const { events, isMockMode, toggleMockMode } = useRuleEngineEvents();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'monitor' | 'analytics'>('monitor');
  
  // Interaction State
  const [focusedView, setFocusedView] = useState<{ timestamp: number; filter: 'adherence' | 'deviation' | null } | null>(null);

  const handleMarkerClick = useCallback((timestamp: number, type?: 'adherence' | 'deviation') => {
    setFocusedView({
      timestamp,
      filter: type || null
    });
  }, []);

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
        <UserIDBanner />
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
        flexShrink: 0
      }}>
        <button 
          onClick={() => setActiveTab('monitor')}
          style={{
            padding: '16px 4px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'monitor' ? '#6366f1' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'monitor' ? '2px solid #6366f1' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Monitor
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '16px 4px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'analytics' ? '#6366f1' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'analytics' ? '2px solid #6366f1' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Session Analytics
        </button>
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
        {activeTab === 'monitor' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 400px', 
            gap: '24px', 
            flex: 1,
            minHeight: 0
          }}>
            {/* Left Column: Flow & Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 0 }}>
              <section style={{ 
                padding: '24px', 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                flexShrink: 0
              }}>
                <StrategyIngestion 
                  value={ruleInput}
                  onChange={setRuleInput}
                  onSubmit={submitStrategy}
                  isSubmitting={isSubmitting}
                  onStartSession={() => startStream(lastPlaybookId || 'default-playbook')}
                  onStopSession={stopStream}
                  isStreaming={isStreaming}
                  disabled={!lastPlaybookId}
                />
              </section>

              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <PriceChart 
                  events={events}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </div>

            {/* Right Column: Rule Engine & Mocking */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <RuleEventInspector 
                events={events} 
                focusedTimestamp={focusedView?.timestamp || null}
                filterType={focusedView?.filter || null}
                onClearFocus={() => setFocusedView(null)}
              />
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <SessionAnalytics />
          </div>
        )}
      </main>
    </div>
  );

}

export default App;

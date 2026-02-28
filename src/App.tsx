import { useState, useCallback } from 'react';
import { PriceChart } from './components/PriceChart';
import { RuleEventInspector } from './components/RuleEventInspector';
import { useRuleEngineEvents } from './hooks/useRuleEngineEvents';
import { usePlaybook } from './hooks/usePlaybook';
import { Header } from './components/layout/Header';
import { UserIDBanner } from './components/layout/UserIDBanner';
import { NotificationBanner } from './components/common/NotificationBanner';
import { StrategyIngestion } from './components/strategy/StrategyIngestion';

function App() {
  // Centralized Data Source
  const { events, isMockMode, toggleMockMode } = useRuleEngineEvents();
  
  // Playbook Management
  const { 
    ruleInput, 
    setRuleInput, 
    isSubmitting, 
    notification, 
    setNotification, 
    submitStrategy 
  } = usePlaybook();
  
  // Interaction State
  const [focusedView, setFocusedView] = useState<{ timestamp: number; filter: 'adherence' | 'deviation' | null } | null>(null);

  const handleMarkerClick = useCallback((timestamp: number, type?: 'adherence' | 'deviation') => {
    setFocusedView({
      timestamp,
      filter: type || null
    });
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedView(null);
  }, []);

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      padding: '20px', 
      gap: '20px',
      backgroundColor: '#f3f4f6', 
      fontFamily: 'sans-serif',
    }}>
      <Header isMockMode={isMockMode} onToggleMockMode={toggleMockMode} />
      
      <UserIDBanner />

      <NotificationBanner 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      <StrategyIngestion 
        value={ruleInput}
        onChange={setRuleInput}
        onSubmit={submitStrategy}
        isSubmitting={isSubmitting}
      />
      
      {/* Chart Section */}
      <div style={{ 
        flex: 3, 
        minHeight: 0, 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        display: 'flex'
      }}>
        <PriceChart 
          events={events} 
          onMarkerClick={handleMarkerClick} 
        />
      </div>
      
      {/* Inspector Section */}
      <div style={{ 
        flex: 2, 
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
         <RuleEventInspector 
            events={events}
            focusedTimestamp={focusedView?.timestamp ?? null}
            filterType={focusedView?.filter ?? null}
            onClearFocus={clearFocus}
         />
      </div>
    </main>
  );
}

export default App;


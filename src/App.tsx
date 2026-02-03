import { useState, useCallback } from 'react';
import { PriceChart } from './components/PriceChart';
import { RuleEventInspector } from './components/RuleEventInspector';
import { useRuleEngineEvents } from './hooks/useRuleEngineEvents';

function App() {
  // Centralized Data Source
  const { events, isMockMode, toggleMockMode } = useRuleEngineEvents();
  
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
      <header style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          TheMindOverMarket <span style={{ fontWeight: 'normal', color: '#6B7280' }}>| Demo Scaffolding</span>
        </h1>
        
        <button
          onClick={toggleMockMode}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: isMockMode ? '1px solid #059669' : '1px solid #D1D5DB',
            backgroundColor: isMockMode ? '#059669' : '#FFFFFF',
            color: isMockMode ? '#FFFFFF' : '#374151',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: isMockMode ? '#FFFFFF' : '#9CA3AF',
            display: 'inline-block'
          }}></span>
          {isMockMode ? 'Simulating Events' : 'Enable Mock Stream'}
        </button>
      </header>
      
      {/* Chart Section */}
      <div style={{ 
        flex: 3, // Chart takes more space
        minHeight: '400px', 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <PriceChart 
          events={events} 
          onMarkerClick={handleMarkerClick} 
        />
      </div>
      
      {/* Inspector Section */}
      <div style={{ 
        flex: 2, // Inspector takes less space but is substantial
        minHeight: '250px',
        overflow: 'hidden' 
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

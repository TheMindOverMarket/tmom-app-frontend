import { useState, useCallback } from 'react';
import { PriceChart } from './components/PriceChart';
import { RuleEventInspector } from './components/RuleEventInspector';
import { useRuleEngineEvents } from './hooks/useRuleEngineEvents';

function App() {
  // Centralized Data Source
  const { events } = useRuleEngineEvents();
  
  // Interaction State
  const [focusedTimestamp, setFocusedTimestamp] = useState<number | null>(null);

  const handleMarkerClick = useCallback((timestamp: number) => {
    setFocusedTimestamp(timestamp);
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedTimestamp(null);
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
      <header style={{ marginBottom: '4px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Mind Over Market <span style={{ fontWeight: 'normal', color: '#6B7280' }}>| Demo Scaffolding</span>
        </h1>
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
            focusedTimestamp={focusedTimestamp}
            onClearFocus={clearFocus}
         />
      </div>
    </main>
  );
}

export default App;

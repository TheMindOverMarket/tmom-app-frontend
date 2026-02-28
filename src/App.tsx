import { useState, useCallback } from 'react';
import { PriceChart } from './components/PriceChart';
import { RuleEventInspector } from './components/RuleEventInspector';
import { useRuleEngineEvents } from './hooks/useRuleEngineEvents';
import { playbookApi } from './domain/playbook/api';


function App() {
  // Centralized Data Source
  const { events, isMockMode, toggleMockMode } = useRuleEngineEvents();
  
  // Interaction State
  // Interaction State
  const [focusedView, setFocusedView] = useState<{ timestamp: number; filter: 'adherence' | 'deviation' | null } | null>(null);
  
  // Rule Ingestion State
  const [ruleInput, setRuleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);


  const handleMarkerClick = useCallback((timestamp: number, type?: 'adherence' | 'deviation') => {
    setFocusedView({
      timestamp,
      filter: type || null
    });
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedView(null);
  }, []);

  const handleRuleSubmit = async () => {
    if (!ruleInput.trim()) return;
    
    setIsSubmitting(true);
    setNotification(null);

    const TEMP_USER_ID = '0ea839a8-dd23-45ce-b631-9c28335983d7';

    try {
        await playbookApi.createPlaybook({
          name: `Playbook ${new Date().toLocaleTimeString()}`,
          user_id: TEMP_USER_ID,
          original_nl_input: ruleInput
        });
        setRuleInput(''); // Clear on success
        setNotification({ type: 'success', message: 'Strategy playbook successfully created and deployed!' });
        
        // Auto-dismiss success notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
        console.error('Failed to create playbook:', error);
        setNotification({ type: 'error', message: `Failed to deploy strategy: ${error.message || 'Unknown error'}` });
    } finally {
        setIsSubmitting(false);
    }
  };

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

      {/* Global Hardcoded User Banner */}
      <div style={{
        padding: '6px 12px',
        borderRadius: '6px',
        backgroundColor: '#E0E7FF',
        color: '#3730A3',
        border: '1px solid #C7D2FE',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        fontWeight: 500
      }}>
        <span style={{ marginRight: '8px' }}>👤</span>
        <strong>DEBUG:</strong> &nbsp;Using default hardcoded user ID ({'0ea839a8-dd23-45ce-b631-9c28335983d7'})
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          backgroundColor: notification.type === 'success' ? '#DEF7EC' : '#FDE8E8',
          color: notification.type === 'success' ? '#03543F' : '#9B1C1C',
          border: `1px solid ${notification.type === 'success' ? '#31C48D' : '#F8B4B4'}`,
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: 0.6,
              marginLeft: '16px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Rule Ingestion Section */}
      <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Describe your strategy in natural language (e.g. 'Alert if price drops 5% in 1 hour')..."
            value={ruleInput}
            onChange={(e) => setRuleInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRuleSubmit()}
            style={{ 
                flex: 1, 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: '1px solid #D1D5DB', 
                fontSize: '14px',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                color: '#111827'
            }} 
          />
          <button
            onClick={handleRuleSubmit}
            disabled={isSubmitting || !ruleInput.trim()}
            style={{
                padding: '8px 16px',
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (isSubmitting || !ruleInput.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isSubmitting || !ruleInput.trim()) ? 0.7 : 1,
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap'
            }}
          >
            {isSubmitting ? 'Ingesting...' : 'Ingest Strategy'}
          </button>
      </div>
      
      {/* Chart Section */}
      <div style={{ 
        flex: 3, // Chart takes more space
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
        flex: 2, // Inspector takes less space but is substantial
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

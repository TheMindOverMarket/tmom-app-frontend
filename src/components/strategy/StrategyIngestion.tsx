interface StrategyIngestionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export function StrategyIngestion({ 
  value, 
  onChange, 
  onSubmit, 
  isSubmitting,
  onStartSession,
  onStopSession,
  isStreaming,
  disabled
}: StrategyIngestionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="Describe your strategy in natural language..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          style={{ 
              flex: 1, 
              padding: '10px 14px', 
              borderRadius: '8px', 
              border: '1px solid #D1D5DB', 
              fontSize: '14px',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              color: '#111827'
          }} 
        />
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !value.trim()}
          style={{
              padding: '10px 20px',
              backgroundColor: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (isSubmitting || !value.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isSubmitting || !value.trim()) ? 0.7 : 1,
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
          }}
        >
          {isSubmitting ? 'Ingesting...' : 'Ingest Strategy'}
        </button>

        <button
          onClick={isStreaming ? onStopSession : onStartSession}
          disabled={disabled && !isStreaming}
          style={{
              padding: '10px 20px',
              backgroundColor: isStreaming ? '#EF4444' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
              opacity: (disabled && !isStreaming) ? 0.5 : 1,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isStreaming ? '0 4px 6px -1px rgba(239, 68, 68, 0.4)' : '0 4px 6px -1px rgba(5, 150, 105, 0.4)'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white', animation: isStreaming ? 'pulse 1.5s infinite' : 'none' }}></div>
          {isStreaming ? 'Stop Session' : 'Start Session'}
        </button>
      </div>
      
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

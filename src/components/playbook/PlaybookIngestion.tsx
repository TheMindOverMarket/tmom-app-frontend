interface PlaybookIngestionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onStartSession?: () => void;
  onStopSession?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  showSessionControls?: boolean;
}

export function PlaybookIngestion({ 
  value, 
  onChange, 
  onSubmit, 
  isSubmitting,
  onStartSession,
  onStopSession,
  isStreaming = false,
  disabled = false,
  showSessionControls = false
}: PlaybookIngestionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <textarea 
          placeholder="Describe your playbook... (e.g. 'If price stays below EMA-9 for 3 minutes, then rises above it, alert me.')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) && onSubmit()}
          style={{ 
              flex: 1, 
              padding: '16px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--slate-200)', 
              fontSize: '14px',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--slate-900)',
              backgroundColor: 'white',
              resize: 'none',
              minHeight: '160px',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              transition: 'var(--transition)'
          }} 
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--brand)', e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--slate-200)', e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
            style={{
                padding: '12px 16px',
                backgroundColor: 'var(--slate-900)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: (isSubmitting || !value.trim()) ? 'default' : 'pointer',
                opacity: (isSubmitting || !value.trim()) ? 0.5 : 1,
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
                boxShadow: 'var(--shadow-sm)'
            }}
          >
            {isSubmitting ? 'INGESTING...' : 'INGEST PLAYBOOK'}
          </button>

          {showSessionControls && (
            <button
              onClick={isStreaming ? onStopSession : onStartSession}
              disabled={disabled && !isStreaming}
              style={{
                  padding: '10px 16px',
                  backgroundColor: isStreaming ? '#EF4444' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
                  opacity: (disabled && !isStreaming) ? 0.5 : 1,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isStreaming ? '0 4px 6px -1px rgba(239, 68, 68, 0.4)' : '0 4px 6px -1px rgba(5, 150, 105, 0.4)'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', animation: isStreaming ? 'pulse 1.5s infinite' : 'none' }}></div>
              {isStreaming ? 'Stop Session' : 'Start Session'}
            </button>
          )}
        </div>
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

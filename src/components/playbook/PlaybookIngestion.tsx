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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: '6px', 
        border: '1px solid var(--slate-200)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}>
        <textarea 
          placeholder="Describe your playbook logic..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ 
              width: '100%',
              padding: '16px', 
              border: 'none', 
              fontSize: '14px',
              outline: 'none',
              color: 'var(--slate-900)',
              backgroundColor: 'transparent',
              resize: 'none',
              minHeight: '120px',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              boxSizing: 'border-box'
          }} 
        />
      </div>

      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px'
      }}>
        {showSessionControls && (
          <button
            onClick={isStreaming ? onStopSession : onStartSession}
            disabled={disabled && !isStreaming}
            style={{
                height: '38px',
                padding: '0 16px',
                backgroundColor: isStreaming ? 'var(--danger-alpha)' : 'white',
                color: isStreaming ? 'var(--danger)' : 'var(--slate-700)',
                border: `1px solid ${isStreaming ? 'var(--danger)' : 'var(--slate-200)'}`,
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
                opacity: (disabled && !isStreaming) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: isStreaming ? 'var(--danger)' : 'var(--success)', 
              animation: isStreaming ? 'pulse 1.5s infinite' : 'none',
            }}></div>
            {isStreaming ? 'STOP LIVE' : 'START LIVE'}
          </button>
        )}

        <button
          onClick={onSubmit}
          disabled={isSubmitting || !value.trim()}
          style={{
              height: '38px',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: isSubmitting ? 'var(--brand)' : (value.trim() ? 'var(--brand)' : 'var(--slate-100)'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              cursor: (isSubmitting || !value.trim()) ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: (isSubmitting || !value.trim()) ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {isSubmitting ? (
            <>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTopColor: 'white', 
                animation: 'spin 0.8s linear infinite' 
              }} />
              <span>INGESTING...</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '14px' }}>✨</span>
              <span>INGEST PLAYBOOK</span>
            </>
          )}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 1; }
          70% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(0.95); opacity: 1; }
        }
      ` }} />
    </div>
  );
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: '4px', 
        border: '1px solid var(--slate-200)',
        transition: 'all 0.1s ease',
        overflow: 'hidden'
      }}>
        <textarea 
          placeholder="Describe your strategy logic..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ 
              width: '100%',
              padding: '12px 16px', 
              border: 'none', 
              fontSize: '13px',
              outline: 'none',
              color: 'var(--slate-900)',
              backgroundColor: 'transparent',
              resize: 'none',
              minHeight: '80px',
              fontFamily: 'var(--font-mono, monospace)',
              lineHeight: '1.5',
              boxSizing: 'border-box'
          }} 
        />
      </div>

      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px'
      }}>
        {showSessionControls && (
          <button
            onClick={isStreaming ? onStopSession : onStartSession}
            disabled={disabled && !isStreaming}
            title={disabled && !isStreaming ? "Select or initiate a Playbook to enable live feed orchestration. Requires COMPLETED analysis status." : (isStreaming ? "Terminate active live session" : "Initialize real-time supervision feed")}
            style={{
                height: '32px',
                padding: '0 12px',
                backgroundColor: isStreaming ? 'var(--danger-alpha)' : 'white',
                color: isStreaming ? 'var(--danger)' : 'var(--slate-600)',
                border: `1px solid ${isStreaming ? 'var(--danger)' : 'var(--slate-200)'}`,
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
                opacity: (disabled && !isStreaming) ? 0.6 : 1,
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
            {isStreaming ? 'STOP FEED' : 'START LIVE FEED'}
          </button>
        )}

        <button
          onClick={onSubmit}
          disabled={isSubmitting || !value.trim()}
          title={isSubmitting ? "Background extraction in progress..." : (!value.trim() ? "Input descriptive logic to enable strategy ingestion." : "Submit logic for deterministic derivation")}
          style={{
              height: '32px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: isSubmitting ? 'var(--brand)' : (value.trim() ? '#0f172a' : 'var(--slate-100)'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              cursor: (isSubmitting || !value.trim()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
          }}
        >
          {isSubmitting ? (
            <>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTopColor: 'white', 
                animation: 'spin 0.8s linear infinite' 
              }} />
              <span>INGESTING...</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '13px' }}>✨</span>
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

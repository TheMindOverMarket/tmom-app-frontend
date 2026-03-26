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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: '24px',
        border: '1px solid var(--slate-200)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--slate-300)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--slate-200)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
      >
        <textarea 
          placeholder="Describe your playbook in natural language... (e.g. 'If BTC drops below VWAP $-1.5*ATR, alert me on the next 5-min candle close if EMA-20 is trending up.')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ 
              width: '100%',
              padding: '24px', 
              border: 'none', 
              fontSize: '15px',
              outline: 'none',
              color: 'var(--slate-900)',
              backgroundColor: 'transparent',
              resize: 'none',
              minHeight: '140px',
              fontFamily: 'inherit',
              lineHeight: '1.7',
              boxSizing: 'border-box'
          }} 
        />

        {/* Integrated Action Bar */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: 'var(--slate-50)',
          borderTop: '1px solid var(--slate-100)',
          gap: '16px'
        }}>
          {showSessionControls && (
            <button
              onClick={isStreaming ? onStopSession : onStartSession}
              disabled={disabled && !isStreaming}
              style={{
                  height: '48px',
                  padding: '0 24px',
                  backgroundColor: isStreaming ? 'var(--danger-alpha)' : 'var(--success-alpha)',
                  color: isStreaming ? 'var(--danger)' : 'var(--success)',
                  border: `1px solid ${isStreaming ? 'var(--danger)' : 'var(--success)'}`,
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 950,
                  letterSpacing: '0.05em',
                  cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
                  opacity: (disabled && !isStreaming) ? 0.5 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
              }}
              onMouseEnter={e => {
                if (!(disabled && !isStreaming)) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                if (!(disabled && !isStreaming)) {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: isStreaming ? 'var(--danger)' : 'var(--success)', 
                animation: isStreaming ? 'pulse 1.5s infinite' : 'none',
                boxShadow: isStreaming ? '0 0 10px var(--danger)' : 'none'
              }}></div>
              {isStreaming ? 'STOP SUPERVISION' : 'START LIVE SUPERVISION'}
            </button>
          )}

          <button
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
            style={{
                height: '48px',
                padding: '0 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backgroundColor: isSubmitting ? 'var(--brand)' : (value.trim() ? 'var(--brand)' : 'var(--slate-100)'),
                color: isSubmitting ? 'white' : (value.trim() ? 'white' : 'var(--slate-400)'),
                border: 'none',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 950,
                letterSpacing: '0.05em',
                cursor: (isSubmitting || !value.trim()) ? 'default' : 'pointer',
                transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                boxShadow: (isSubmitting || !value.trim()) ? 'none' : '0 10px 20px -5px var(--brand-alpha)',
                overflow: 'hidden'
            }}
            onMouseEnter={e => {
              if (!isSubmitting && value.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px -8px var(--brand-alpha)';
              }
            }}
            onMouseLeave={e => {
              if (!isSubmitting && value.trim()) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px -5px var(--brand-alpha)';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  border: '2.5px solid rgba(255,255,255,0.3)', 
                  borderTopColor: 'white', 
                  animation: 'spin 0.8s linear infinite' 
                }} />
                <span>EXTRACTING INTELLIGENCE...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '18px' }}>✨</span>
                <span>INGEST PLAYBOOK</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      ` }} />
    </div>
  );
}

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
          placeholder="Describe your strategy in natural language... (e.g. 'If BTC drops below VWAP $-1.5*ATR, alert me on the next 5-min candle close if EMA-20 is trending up.')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ 
              width: '100%',
              padding: '24px 80px 24px 24px', 
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

        {/* Integrated Action Button */}
        <div style={{ 
          position: 'absolute', 
          bottom: '16px', 
          right: '16px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {showSessionControls && (
            <button
              onClick={isStreaming ? onStopSession : onStartSession}
              disabled={disabled && !isStreaming}
              style={{
                  height: '40px',
                  padding: '8px 16px',
                  backgroundColor: isStreaming ? 'var(--danger-alpha)' : 'var(--success-alpha)',
                  color: isStreaming ? 'var(--danger)' : 'var(--success)',
                  border: `1px solid ${isStreaming ? 'var(--danger)' : 'var(--success)'}`,
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
                  opacity: (disabled && !isStreaming) ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isStreaming ? 'var(--danger)' : 'var(--success)', animation: isStreaming ? 'pulse 1.5s infinite' : 'none' }}></div>
              {isStreaming ? 'STOP' : 'SUPERVISE'}
            </button>
          )}

          <button
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
            style={{
                width: isSubmitting ? '140px' : '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: isSubmitting ? 'var(--brand)' : (value.trim() ? 'var(--brand)' : 'var(--slate-100)'),
                color: isSubmitting ? 'white' : (value.trim() ? 'white' : 'var(--slate-300)'),
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: (isSubmitting || !value.trim()) ? 'default' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: (isSubmitting || !value.trim()) ? 'none' : '0 4px 12px -2px var(--brand-alpha)',
                overflow: 'hidden'
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
                <span style={{ fontSize: '11px', letterSpacing: '0.05em' }}>ANALYZING...</span>
              </>
            ) : (
              <span style={{ transition: 'transform 0.2s' }}>✨</span>
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

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
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <textarea 
          placeholder="Describe your strategy in natural language... (e.g. 'If BTC drops below VWAP $-1.5*ATR, alert me on the next 5-min candle close if EMA-20 is trending up.')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ 
              width: '100%',
              padding: '24px 24px 80px 24px', 
              borderRadius: '24px', 
              border: '1.5px solid #f1f5f9', 
              fontSize: '15px',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--slate-900)',
              backgroundColor: '#fcfdfe',
              resize: 'none',
              minHeight: '220px',
              fontFamily: 'inherit',
              lineHeight: '1.7',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxSizing: 'border-box'
          }} 
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--brand)';
            e.currentTarget.style.boxShadow = '0 0 0 5px var(--brand-alpha)';
            e.currentTarget.style.backgroundColor = 'white';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#f1f5f9';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.backgroundColor = '#fcfdfe';
          }}
        />

        {/* Action Footer */}
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          right: '12px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {showSessionControls && (
              <button
                onClick={isStreaming ? onStopSession : onStartSession}
                disabled={disabled && !isStreaming}
                style={{
                    padding: '8px 16px',
                    backgroundColor: isStreaming ? 'var(--danger-alpha)' : 'var(--success-alpha)',
                    color: isStreaming ? 'var(--danger)' : 'var(--success)',
                    border: `1.5px solid ${isStreaming ? 'var(--danger)' : 'var(--success)'}`,
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
                    opacity: (disabled && !isStreaming) ? 0.5 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isStreaming ? 'var(--danger)' : 'var(--success)', animation: isStreaming ? 'pulse 1.5s infinite' : 'none' }}></div>
                {isStreaming ? 'STOP STREAM' : 'START SESSION'}
              </button>
            )}

            <button
              onClick={onSubmit}
              disabled={isSubmitting || !value.trim()}
              style={{
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: isSubmitting ? 'var(--slate-100)' : 'var(--brand)',
                  color: isSubmitting ? 'var(--slate-400)' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: (isSubmitting || !value.trim()) ? 'default' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSubmitting ? 'none' : '0 4px 6px -1px var(--brand-alpha)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--slate-300)', borderTopColor: 'var(--brand)', animation: 'spin 0.8s linear infinite' }} />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '14px' }}>✨</span>
                  <span>ANALYZE STRATEGY</span>
                </>
              )}
            </button>
          </div>
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

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
      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea 
            placeholder="Describe your strategy in natural language... (e.g. 'If BTC drops below VWAP $-1.5*ATR, alert me on the next 5-min candle close if EMA-20 is trending up.')"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) && onSubmit()}
            style={{ 
                width: '100%',
                padding: '24px', 
                borderRadius: '20px', 
                border: '1.5px solid #f1f5f9', 
                fontSize: '15px',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
                color: 'var(--slate-900)',
                backgroundColor: '#fcfdfe',
                resize: 'none',
                minHeight: '180px',
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
          <div style={{ 
            position: 'absolute', 
            bottom: '16px', 
            right: '16px', 
            fontSize: '10px', 
            fontWeight: 700, 
            color: 'var(--slate-400)',
            letterSpacing: '0.05em'
          }}>
            CMD + ENTER TO ANALYZE
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
            style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: isSubmitting ? 'var(--slate-100)' : 'var(--brand)',
                backgroundImage: isSubmitting ? 'none' : 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
                color: isSubmitting ? 'var(--slate-400)' : 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: (isSubmitting || !value.trim()) ? 'default' : 'pointer',
                opacity: (isSubmitting || !value.trim()) ? 0.6 : 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSubmitting ? 'none' : '0 10px 15px -3px var(--brand-alpha)',
                letterSpacing: '0.025em'
            }}
            onMouseEnter={e => !isSubmitting && value.trim() && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 20px 25px -5px var(--brand-alpha)')}
            onMouseLeave={e => !isSubmitting && value.trim() && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 10px 15px -3px var(--brand-alpha)')}
          >
            {isSubmitting ? (
              <>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  border: '2px solid var(--slate-300)', 
                  borderTopColor: 'var(--brand)', 
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>ANALYZING...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '18px', marginBottom: '4px' }}>✨</span>
                <span>ANALYZE STRATEGY</span>
              </>
            )}
          </button>

          {showSessionControls && (
            <button
              onClick={isStreaming ? onStopSession : onStartSession}
              disabled={disabled && !isStreaming}
              style={{
                  padding: '12px 16px',
                  backgroundColor: isStreaming ? 'var(--danger)' : 'var(--success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: (disabled && !isStreaming) ? 'not-allowed' : 'pointer',
                  opacity: (disabled && !isStreaming) ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', animation: isStreaming ? 'pulse 1.5s infinite' : 'none' }}></div>
              {isStreaming ? 'STOP SUPERVISION' : 'START LIVE SESSION'}
            </button>
          )}
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

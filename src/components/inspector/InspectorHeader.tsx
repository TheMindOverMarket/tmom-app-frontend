interface InspectorHeaderProps {
  focusedTimestamp: number | null;
  isActive: boolean;
  filterType?: 'adherence' | 'deviation' | null;
  onClearFocus: () => void;
}

const formatHeaderDate = (ts: number) => {
  return new Date(ts * 1000).toLocaleString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

export function InspectorHeader({ focusedTimestamp, isActive, filterType, onClearFocus }: InspectorHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid var(--auth-border)',
      backgroundColor: 'var(--auth-black)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '10px', color: '#ffffff', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em' }}>
              RULE ENGINE
          </span>
          
          <span style={{ color: 'var(--auth-border)' }}>|</span>

          {focusedTimestamp !== null ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                    fontSize: '9px', 
                    padding: '2px 6px', 
                    backgroundColor: 'rgba(251, 191, 36, 0.1)', 
                    color: '#fbbf24', 
                    borderRadius: '4px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.05em',
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                }}>
                    HISTORY
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', fontFamily: "'Space Mono', monospace" }}>
                  {formatHeaderDate(focusedTimestamp)}
                </span>
                
                {filterType && (
                  <span style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    backgroundColor: filterType === 'deviation' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                    color: filterType === 'deviation' ? '#fb923c' : 'var(--auth-accent)',
                    border: `1px solid ${filterType === 'deviation' ? 'rgba(234, 88, 12, 0.2)' : 'rgba(0, 255, 136, 0.2)'}`,
                    borderRadius: '4px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    marginLeft: '4px',
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.05em'
                  }}>
                    VIEWING: {filterType}
                  </span>
                )}
             </div>
          ) : isActive ? (
              <span style={{ 
                  fontSize: '9px', 
                  padding: '2px 8px', 
                  backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                  color: 'var(--auth-accent)', 
                  borderRadius: '4px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'uppercase',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.1em',
                  border: '1px solid rgba(0, 255, 136, 0.2)'
              }}>
                 <span style={{ display: 'block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--auth-accent)', animation: 'pulse 1.5s infinite' }}></span>
                 LIVE FEED
              </span>
          ) : (
            <span style={{ 
                fontSize: '9px', 
                padding: '2px 8px', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                color: 'var(--auth-text-muted)', 
                borderRadius: '4px',
                fontWeight: 900,
                textTransform: 'uppercase',
                fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.1em',
                border: '1px solid var(--auth-border)'
            }}>
               IDLE
            </span>
          )}
      </div>

      {focusedTimestamp !== null && (
        <button 
          onClick={onClearFocus}
          style={{
              fontSize: '10px',
              color: 'var(--auth-accent)',
              backgroundColor: 'transparent',
              border: '1px solid var(--auth-accent)',
              borderRadius: '4px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontWeight: 900,
              fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ← LIVE VIEW
        </button>
      )}
    </div>
  );
}

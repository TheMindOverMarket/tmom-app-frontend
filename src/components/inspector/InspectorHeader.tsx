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
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
              Rule Engine
          </span>
          
          <span style={{ color: '#D1D5DB' }}>|</span>

          {focusedTimestamp !== null ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 6px', 
                    backgroundColor: '#FEF3C7', 
                    color: '#92400E', 
                    borderRadius: '4px',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                }}>
                    History
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                  {formatHeaderDate(focusedTimestamp)}
                </span>
                
                {filterType && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: filterType === 'deviation' ? '#FFF7ED' : '#EFF6FF',
                    color: filterType === 'deviation' ? '#C2410C' : '#1D4ED8',
                    border: `1px solid ${filterType === 'deviation' ? '#FDBA74' : '#93C5FD'}`,
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginLeft: '4px'
                  }}>
                    Viewing: {filterType}
                  </span>
                )}
             </div>
          ) : isActive ? (
              <span style={{ 
                  fontSize: '11px', 
                  padding: '2px 6px', 
                  backgroundColor: '#D1FAE5', 
                  color: '#065F46', 
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'uppercase'
              }}>
                 <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
                 Live Feed
              </span>
          ) : (
            <span style={{ 
                fontSize: '11px', 
                padding: '2px 6px', 
                backgroundColor: '#f3f4f6', 
                color: '#6b7280', 
                borderRadius: '4px',
                fontWeight: 600,
                textTransform: 'uppercase'
            }}>
               Idle
            </span>
          )}
      </div>

      {focusedTimestamp !== null && (
        <button 
          onClick={onClearFocus}
          style={{
              fontSize: '12px',
              color: '#2563EB',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontWeight: 500
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ← Back to Live
        </button>
      )}
    </div>
  );
}

import { MarketOption } from '../../domain/playbook/types';

interface PlaybookIngestionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedMarket: string;
  onMarketChange: (value: string) => void;
  availableMarkets: MarketOption[];
  isLoadingMarkets?: boolean;
  onStartSession?: () => void;
  onStopSession?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  showSessionControls?: boolean;
  chatHistory?: Array<{role: string, content: string}> | null;
  hideMarket?: boolean;
}

export function PlaybookIngestion({ 
  value, 
  onChange, 
  onSubmit, 
  isSubmitting,
  selectedMarket,
  onMarketChange,
  availableMarkets,
  isLoadingMarkets = false,
  onStartSession,
  onStopSession,
  isStreaming = false,
  disabled = false,
  showSessionControls = false,
  chatHistory = null,
  hideMarket = false
}: PlaybookIngestionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {!hideMarket && (
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px', alignItems: 'end', marginBottom: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '0.06em' }}>
            MARKET
          </label>
          <select
            value={selectedMarket}
            onChange={(e) => onMarketChange(e.target.value)}
            disabled={isSubmitting || isLoadingMarkets || availableMarkets.length === 0}
            style={{
              height: '38px',
              borderRadius: '4px',
              border: '1px solid var(--slate-200)',
              backgroundColor: 'white',
              color: 'var(--slate-900)',
              padding: '0 12px',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none',
            }}
          >
            {availableMarkets.length === 0 && (
              <option value="">No markets available</option>
            )}
            {availableMarkets.map((market) => (
              <option key={market.symbol} value={market.symbol}>
                {market.symbol}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            minHeight: '38px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            borderRadius: '4px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#475569',
            fontWeight: 600,
          }}
        >
          {availableMarkets.find((market) => market.symbol === selectedMarket)?.display_name || selectedMarket}
        </div>
      </div>
      )}

      {chatHistory && chatHistory.length > 0 && (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {chatHistory.map((msg, i) => (
                <div key={i} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                        {msg.role === 'user' ? 'YOU' : 'SYSTEM'}
                    </span>
                    <div style={{ 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        backgroundColor: msg.role === 'user' ? '#0f172a' : 'white', 
                        color: msg.role === 'user' ? 'white' : 'var(--slate-900)',
                        border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                        fontSize: '13px',
                        maxWidth: '85%',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {msg.content}
                    </div>
                </div>
            ))}
         </div>
      )}

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
          placeholder="Describe your playbook..."
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
          disabled={isSubmitting || !value.trim() || !selectedMarket}
          
          title={
            isSubmitting
              ? "Background extraction in progress..."
              : (!hideMarket && !selectedMarket)
                ? "Select a market before ingesting a playbook."
                : !value.trim()
                  ? "Input playbook details or an answer to continue playbook ingestion."
                  : "Submit playbook for deterministic derivation"
          }
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
              cursor: (isSubmitting || !value.trim() || !selectedMarket) ? 'not-allowed' : 'pointer',
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

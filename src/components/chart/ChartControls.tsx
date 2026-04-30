interface ChartControlsProps {
  deduplicateEvents: boolean;
  onToggle: () => void;
  interval: number;
  onIntervalChange: (interval: number) => void;
}

export function ChartControls({ deduplicateEvents, onToggle, interval, onIntervalChange }: ChartControlsProps) {
  return (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          value={interval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--auth-border)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#ffffff',
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
            outline: 'none'
          }}
        >
          <option value={60}>1m</option>
          <option value={300}>5m</option>
          <option value={600}>10m</option>
          <option value={900}>15m</option>
          <option value={1200}>20m</option>
          <option value={3600}>1H</option>
          <option value={86400}>1D</option>
        </select>
        <button 
          onClick={onToggle}
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.8)', 
            backdropFilter: 'blur(4px)', 
            border: '1px solid var(--auth-border)', 
            padding: '6px 12px', 
            borderRadius: '4px', 
            fontSize: '12px', 
            fontWeight: 700, 
            color: '#ffffff', 
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace"
          }}
        >
          {deduplicateEvents ? 'Mode: Grouped' : 'Mode: Debug Stream'}
        </button>
      </div>
      <span style={{ fontSize: '10px', color: 'var(--auth-text-muted)', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--auth-border)', fontFamily: "'Space Mono', monospace" }}>
        {deduplicateEvents 
          ? 'Showing 1 marker per event block (clean)' 
          : 'Showing all raw events (stacked)'}
      </span>
    </div>
  );
}

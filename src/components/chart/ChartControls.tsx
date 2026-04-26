interface ChartControlsProps {
  deduplicateEvents: boolean;
  onToggle: () => void;
}

export function ChartControls({ deduplicateEvents, onToggle }: ChartControlsProps) {
  return (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
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
      <span style={{ fontSize: '10px', color: 'var(--auth-text-muted)', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--auth-border)', fontFamily: "'Space Mono', monospace" }}>
        {deduplicateEvents 
          ? 'Showing 1 marker per minute (clean)' 
          : 'Showing all raw events (stacked)'}
      </span>
    </div>
  );
}

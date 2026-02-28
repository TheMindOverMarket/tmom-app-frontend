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
          backgroundColor: 'rgba(255,255,255,0.9)', 
          backdropFilter: 'blur(4px)', 
          border: '1px solid #E5E7EB', 
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
          padding: '6px 12px', 
          borderRadius: '4px', 
          fontSize: '12px', 
          fontWeight: 600, 
          color: '#374151', 
          cursor: 'pointer' 
        }}
      >
        {deduplicateEvents ? 'Mode: Grouped' : 'Mode: Debug Stream'}
      </button>
      <span style={{ fontSize: '10px', color: '#6B7280', backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', padding: '0 4px', borderRadius: '4px' }}>
        {deduplicateEvents 
          ? 'Showing 1 marker per minute (clean)' 
          : 'Showing all raw events (stacked)'}
      </span>
    </div>
  );
}

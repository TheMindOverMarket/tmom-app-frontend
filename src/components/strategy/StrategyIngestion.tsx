interface StrategyIngestionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StrategyIngestion({ value, onChange, onSubmit, isSubmitting }: StrategyIngestionProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input 
        type="text" 
        placeholder="Describe your strategy in natural language (e.g. 'Alert if price drops 5% in 1 hour')..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        style={{ 
            flex: 1, 
            padding: '8px 12px', 
            borderRadius: '6px', 
            border: '1px solid #D1D5DB', 
            fontSize: '14px',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            color: '#111827'
        }} 
      />
      <button
        onClick={onSubmit}
        disabled={isSubmitting || !value.trim()}
        style={{
            padding: '8px 16px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: (isSubmitting || !value.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isSubmitting || !value.trim()) ? 0.7 : 1,
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap'
        }}
      >
        {isSubmitting ? 'Ingesting...' : 'Ingest Strategy'}
      </button>
    </div>
  );
}

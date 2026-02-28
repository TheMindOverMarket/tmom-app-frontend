interface HeaderProps {
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

export function Header({ isMockMode, onToggleMockMode }: HeaderProps) {
  return (
    <header style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
        TheMindOverMarket <span style={{ fontWeight: 'normal', color: '#6B7280' }}>| Demo Scaffolding</span>
      </h1>
      
      <button
        onClick={onToggleMockMode}
        style={{
          fontSize: '12px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: isMockMode ? '1px solid #059669' : '1px solid #D1D5DB',
          backgroundColor: isMockMode ? '#059669' : '#FFFFFF',
          color: isMockMode ? '#FFFFFF' : '#374151',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: isMockMode ? '#FFFFFF' : '#9CA3AF',
          display: 'inline-block'
        }}></span>
        {isMockMode ? 'Simulating Events' : 'Enable Mock Stream'}
      </button>
    </header>
  );
}

interface HeaderProps {
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

export function Header({ isMockMode, onToggleMockMode }: HeaderProps) {
  return (
    <header style={{ 
      padding: '8px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid #f1f5f9',
      backgroundColor: '#ffffff'
    }}>
      <h1 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
        TheMindOverMarket <span style={{ fontWeight: '400', color: '#64748b' }}>| Scaffolding</span>
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          padding: '2px 8px',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '700',
          color: '#64748b',
          border: '1px solid #e2e8f0',
          letterSpacing: '0.02em'
        }}>
          DEBUG USER
        </div>
        
        <button
          onClick={onToggleMockMode}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: isMockMode ? '1px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: isMockMode ? '#10b981' : '#ffffff',
            color: isMockMode ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: isMockMode ? '#FFFFFF' : '#9CA3AF',
            display: 'inline-block'
          }}></span>
          {isMockMode ? 'Simulating' : 'Mock Mode'}
        </button>
      </div>

    </header>
  );
}

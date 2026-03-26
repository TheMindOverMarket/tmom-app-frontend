import { useState } from 'react';
import { CONFIG } from '../../config/constants';

interface HeaderProps {
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

export function Header({ isMockMode, onToggleMockMode }: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CONFIG.USER_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{ 
      padding: '8px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid #f1f5f9',
      backgroundColor: '#ffffff'
    }}>
      <h1 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
        TheMindOverMarket <span style={{ fontWeight: '400', color: '#64748b' }}>| Scaffolding</span>
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div 
          onClick={copyToClipboard}
          title={copied ? "Copied!" : `Copy User ID: ${CONFIG.USER_ID}`}
          style={{
            padding: '4px 12px',
            backgroundColor: copied ? '#eff6ff' : '#f8fafc',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: '600',
            color: copied ? '#3b82f6' : '#64748b',
            border: `1px solid ${copied ? '#3b82f6' : '#e2e8f0'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!copied) e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseOut={(e) => {
            if (!copied) e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
        >
          <span style={{ fontSize: '11px', opacity: 0.8 }}>👤</span>
          {copied ? 'ID Copied!' : 'Demo User'}
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

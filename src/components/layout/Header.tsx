import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../../contexts/UserSessionContext';

export function Header() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { currentUser, clearSelectedUser } = useUserSession();

  const copyToClipboard = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id);
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
        {currentUser && (
          <>
            <div 
              onClick={copyToClipboard}
              title={copied ? 'Copied!' : `Copy User ID: ${currentUser.id}`}
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
              {copied ? 'ID Copied!' : currentUser.email}
            </div>

            <button
              onClick={() => {
                clearSelectedUser();
                navigate('/select-user');
              }}
              style={{
                padding: '4px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
            >
              SWITCH USER
            </button>
          </>
        )}
      </div>
    </header>
  );
}

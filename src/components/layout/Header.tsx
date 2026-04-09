import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../../contexts/UserSessionContext';

export function Header() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useUserSession();

  const copyToClipboard = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{ 
      padding: '12px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid var(--auth-border)',
      backgroundColor: 'var(--auth-black)',
      color: '#ffffff'
    }}>
      <h1 style={{ 
        fontSize: '18px', 
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: '400', 
        color: '#ffffff', 
        margin: 0, 
        letterSpacing: '0.02em',
        textTransform: 'uppercase'
      }}>
        TheMindOverMarket <span style={{ fontWeight: '300', color: 'var(--auth-text-muted)', fontSize: '12px' }}>| System v1.0</span>
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentUser && (
          <>
            <div 
              onClick={copyToClipboard}
              title={copied ? 'Copied!' : `Copy User ID: ${currentUser.id}`}
              style={{
                padding: '6px 16px',
                backgroundColor: copied ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: "'Space Mono', monospace",
                color: copied ? 'var(--auth-accent)' : 'var(--auth-text-muted)',
                border: `1px solid ${copied ? 'var(--auth-accent)' : 'var(--auth-border)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!copied) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseOut={(e) => {
                if (!copied) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--auth-accent)' }} />
              {copied ? 'ID COPIED' : currentUser.email.toUpperCase()}
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                padding: '6px 16px',
                backgroundColor: 'transparent',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: "'Space Mono', monospace",
                color: '#ffffff',
                border: '1px solid var(--auth-border)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              DISCONNECT
            </button>
          </>
        )}
      </div>
    </header>
  );
}

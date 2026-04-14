import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserSession } from '../contexts/UserSessionContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TRADER' | 'MANAGER'>('TRADER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUserSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const user = await login({ email: email.trim(), password });
      navigate(user.role === 'MANAGER' ? '/admin' : '/playbooks');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--auth-input-bg)',
    border: '1px solid var(--auth-border)',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: "'Space Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--auth-text-muted)',
    marginBottom: '8px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  };

  return (
    <div style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--auth-border)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '32px 32px 40px 32px' }}>
        <h2 style={{ 
          fontSize: '32px', 
          fontFamily: "'Cormorant Garamond', serif", 
          margin: '0 0 8px 0',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Authenticate Session
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--auth-text-muted)', 
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          Sign in to continue under your active supervision profile.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@example.com"
              disabled={isLoading}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: '4px' }}>
            <button
              type="submit"
              disabled={!email || isLoading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Processing...' : 'Enter System'}
            </button>
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', 
              fontSize: '12px',
              fontFamily: "'Space Mono', monospace"
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
            <button 
              type="button"
              onClick={() => setRole(role === 'TRADER' ? 'MANAGER' : 'TRADER')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--auth-text-muted)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              SWITCH TO {role === 'TRADER' ? 'MANAGER' : 'TRADER'} LOGIN
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--auth-text-muted)', margin: 0 }}>
            No account?{' '}
            <Link to="/signup" style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>
              Create Profile
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

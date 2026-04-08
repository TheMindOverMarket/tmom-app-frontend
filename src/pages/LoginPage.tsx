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
      // We can also verify if the user's role matches the selected role if we want,
      // but for now we just navigate to the appropriate dashboard.
      navigate(user.role === 'MANAGER' ? '/admin' : '/playbooks');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(true); // Keep loading while navigating
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>Welcome Back</h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Log in to access your playbooks</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="trader@example.com"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
            LOGIN AS
          </label>
          <div style={{ 
            display: 'flex', 
            padding: '4px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '8px', 
            gap: '4px' 
          }}>
            <button
              type="button"
              onClick={() => setRole('TRADER')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: role === 'TRADER' ? '#ffffff' : 'transparent',
                color: role === 'TRADER' ? '#0f172a' : '#64748b',
                boxShadow: role === 'TRADER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              TRADER
            </button>
            <button
              type="button"
              onClick={() => setRole('MANAGER')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: role === 'MANAGER' ? '#ffffff' : 'transparent',
                color: role === 'MANAGER' ? '#0f172a' : '#64748b',
                boxShadow: role === 'MANAGER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              MANAGER
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!email || isLoading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
            cursor: !email || isLoading ? 'not-allowed' : 'pointer',
            opacity: !email || isLoading ? 0.7 : 1,
            letterSpacing: '0.05em'
          }}
        >
          {isLoading ? 'VERIFYING...' : 'LOG IN'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', margin: '16px 0 0 0' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#0f172a', fontWeight: 800, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

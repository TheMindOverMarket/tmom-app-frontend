import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserSession } from '../contexts/UserSessionContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUserSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      await login(email.trim());
      navigate('/playbooks');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
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

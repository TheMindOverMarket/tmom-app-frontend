import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserSession } from '../contexts/UserSessionContext';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'TRADER' | 'MANAGER'>('TRADER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useUserSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !password) return;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await signup({ 
        email: email.trim(), 
        first_name: firstName.trim(), 
        last_name: lastName.trim(), 
        password,
        role
      });
      navigate(role === 'MANAGER' ? '/admin' : '/playbooks');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: 'var(--auth-input-bg)',
    border: '1px solid var(--auth-border)',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '13px',
    fontFamily: "'Space Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '9px',
    fontWeight: 700,
    color: 'var(--auth-text-muted)',
    marginBottom: '6px',
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
      {/* Form Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid var(--auth-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--auth-text-muted)' }}>INITIALIZATION</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--auth-accent)' }}></div>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--auth-accent)' }}>READY</span>
        </div>
      </div>

      <div style={{ padding: '24px 24px 32px 24px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontFamily: "'Cormorant Garamond', serif", 
          margin: '0 0 4px 0',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Create Profile
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: 'var(--auth-text-muted)', 
          margin: '0 0 16px 0',
          lineHeight: '1.4'
        }}>
          Join the system to establish your trading supervision baseline.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@example.com"
              disabled={isLoading}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                disabled={isLoading}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                disabled={isLoading}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={inputStyle}
            />
          </div>

          <div style={{ 
            padding: '10px', 
            backgroundColor: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid var(--auth-border)',
            borderRadius: '4px'
          }}>
            <label style={labelStyle}>Account Role</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('TRADER')}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: role === 'TRADER' ? '#ffffff' : 'transparent',
                  color: role === 'TRADER' ? '#000000' : 'var(--auth-text-muted)',
                  border: role === 'TRADER' ? 'none' : '1px solid var(--auth-border)',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Trader
              </button>
              <button
                type="button"
                onClick={() => setRole('MANAGER')}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: role === 'MANAGER' ? '#ffffff' : 'transparent',
                  color: role === 'MANAGER' ? '#000000' : 'var(--auth-text-muted)',
                  border: role === 'MANAGER' ? 'none' : '1px solid var(--auth-border)',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Manager
              </button>
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', 
              fontSize: '11px',
              fontFamily: "'Space Mono', monospace"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!email || isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}
          >
            {isLoading ? 'Initialising...' : 'Create Profile'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--auth-text-muted)', margin: 0 }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>
              Authenticate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

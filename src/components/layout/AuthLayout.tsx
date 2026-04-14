import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  const containerStyle: React.CSSProperties = {
    height: '100vh',
    backgroundColor: 'var(--auth-black)',
    backgroundImage: `
      linear-gradient(var(--auth-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--auth-grid) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 520px',
    color: 'var(--auth-text-main)',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden'
  };

  return (
    <div style={containerStyle}>
      {/* Left Side: Information */}
      <div style={{ 
        padding: '60px', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--auth-border)'
      }}>
        {/* Logo and Tagline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
            <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.1em' }}>TMOM</span>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              border: '1px solid var(--auth-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'var(--auth-text-muted)'
            }}>M</div>
          </div>

          <div style={{ maxWidth: '600px' }}>
            <p style={{ 
              fontSize: '12px', 
              fontWeight: 700, 
              letterSpacing: '0.2em', 
              color: 'var(--auth-text-muted)',
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}>
              Strategy Supervision Layer
            </p>
            <h1 style={{ 
              fontSize: '64px', 
              fontFamily: "'Cormorant Garamond', serif",
              lineHeight: '1.1',
              margin: '0 0 32px 0',
              fontWeight: 400
            }}>
              Execution is monitored.<br />
              <span style={{ color: 'var(--auth-text-muted)' }}>Discipline is explicit.</span>
            </h1>
            <p style={{ 
              fontSize: '18px', 
              lineHeight: '1.6', 
              color: 'var(--auth-text-muted)',
              maxWidth: '480px'
            }}>
              TMOM observes live trading behavior against your pre-determined playbook and records deviations in real time.
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '60px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--auth-text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Playbook State:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontFamily: "'Space Mono', monospace" }}>versioned</span>
              </div>
              <div style={{ width: '80px', height: '2px', backgroundColor: 'var(--auth-accent)', marginTop: '8px', opacity: 0.5 }}></div>
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--auth-text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Session Context:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontFamily: "'Space Mono', monospace" }}>active</span>
              </div>
              <div style={{ width: '80px', height: '2px', backgroundColor: 'var(--auth-accent)', marginTop: '8px', opacity: 0.5 }}></div>
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--auth-text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Deviation Logging:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontFamily: "'Space Mono', monospace" }}>auditable</span>
              </div>
              <div style={{ width: '80px', height: '2px', backgroundColor: 'var(--auth-accent)', marginTop: '8px', opacity: 0.5 }}></div>
            </div>
          </div>

          <div style={{ 
            fontSize: '10px', 
            fontWeight: 700, 
            letterSpacing: '0.2em', 
            color: 'var(--auth-text-muted)', 
            textTransform: 'uppercase' 
          }}>
            Replayable Decisions | Rule-Bound Execution
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

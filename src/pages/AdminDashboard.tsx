import { useEffect, useState } from 'react';
import { adminApi } from '../domain/admin/api';
import { AdminUserAnalytics } from '../domain/admin/types';
import { RefreshButton } from '../components/common/RefreshButton';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminUserAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.fetchAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUserClick = (userId: string) => {
    // Navigate to analytics page with the user_id and force the completed tab
    navigate(`/analytics?user_id=${userId}&tab=completed`);
  };

  const handleViewReplay = (e: React.MouseEvent, userId: string, latestSessionId: string) => {
    e.stopPropagation(); // Prevent the row click from firing
    navigate(`/analytics?user_id=${userId}&session_id=${latestSessionId}`);
  };

  return (
    <div style={{
      padding: '32px',
      backgroundColor: 'var(--auth-black)',
      borderRadius: '12px',
      border: '1px solid var(--auth-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      color: '#ffffff'
    }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '4px 12px', 
            borderRadius: '4px', 
            backgroundColor: 'rgba(0, 255, 136, 0.05)',
            color: 'var(--auth-accent)',
            fontSize: '10px',
            fontWeight: 900,
            fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            border: '1px solid rgba(0, 255, 136, 0.1)',
            marginBottom: '16px'
          }}>
            <LayoutGrid size={10} />
            Command Center
          </div>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 400, 
            margin: 0, 
            color: '#ffffff', 
            letterSpacing: '0.02em',
            fontFamily: "'Cormorant Garamond', serif"
          }}>
            Platform <span style={{ color: 'var(--auth-accent)' }}>Oversight</span>
          </h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--auth-text-muted)', fontSize: '13px', maxWidth: '600px' }}>
            Real-time behavioral monitoring across the TMOM ecosystem. Identify pattern drift, audit unauthorized gain, and enforce strategy discipline.
          </p>
        </div>
        
        <RefreshButton 
          onRefresh={fetchAnalytics}
          isLoading={loading}
        />
      </div>

      {error && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'rgba(239, 68, 68, 0.05)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '8px', 
          color: '#ef4444', 
          marginBottom: '24px',
          fontSize: '12px',
          fontFamily: "'Space Mono', monospace"
        }}>
          ERROR: {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr>
               <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '9px', fontWeight: '900', color: 'var(--auth-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>OPERATOR</th>
               <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '9px', fontWeight: '900', color: 'var(--auth-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>LATEST TRACE</th>
               <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '9px', fontWeight: '900', color: 'var(--auth-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>RISK SCORE</th>
               <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '9px', fontWeight: '900', color: 'var(--auth-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>STATUS</th>
               <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '9px', fontWeight: '900', color: 'var(--auth-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>AUDIT</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((u) => (
              <tr key={u.user_id} 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => handleUserClick(u.user_id)}
              >
                <td style={{ 
                  padding: '16px 20px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px 0 0 8px',
                  border: '1px solid var(--auth-border)',
                  borderRight: 'none'
                }}>
                  <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>{u.email}</div>
                  <div style={{ fontSize: '10px', color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace", marginTop: '4px' }}>{u.user_id.slice(0, 18)}...</div>
                </td>
                <td style={{ 
                  padding: '16px 20px', 
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid var(--auth-border)',
                  borderBottom: '1px solid var(--auth-border)'
                }}>
                  {u.latest_session_id ? (
                    <div style={{ fontSize: '11px', color: 'var(--auth-accent)', fontFamily: "'Space Mono', monospace", fontWeight: 900 }}>
                      SESSION_{u.latest_session_id.substring(0, 8)}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--auth-text-muted)', fontSize: '11px' }}>---</span>
                  )}
                </td>
                <td style={{ 
                  padding: '16px 20px', 
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid var(--auth-border)',
                  borderBottom: '1px solid var(--auth-border)'
                }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    backgroundColor: u.latest_deviation_score > 5 ? 'rgba(239, 68, 68, 0.1)' : (u.latest_deviation_score > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 255, 136, 0.1)'),
                    color: u.latest_deviation_score > 5 ? '#ef4444' : (u.latest_deviation_score > 0 ? '#f59e0b' : 'var(--auth-accent)'),
                    fontWeight: '900',
                    fontSize: '12px',
                    fontFamily: "'Space Mono', monospace",
                    border: `1px solid ${u.latest_deviation_score > 5 ? 'rgba(239, 68, 68, 0.2)' : (u.latest_deviation_score > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 255, 136, 0.2)')}`,
                    minWidth: '40px'
                  }}>
                    {u.latest_deviation_score.toFixed(1)}
                  </div>
                </td>
                <td style={{ 
                  padding: '16px 20px', 
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid var(--auth-border)',
                  borderBottom: '1px solid var(--auth-border)'
                }}>
                  {u.session_status ? (
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '10px', 
                      fontWeight: '900', 
                      textTransform: 'uppercase',
                      color: u.session_status === 'STARTED' ? 'var(--auth-accent)' : 'var(--auth-text-muted)',
                      fontFamily: "'Space Mono', monospace"
                    }}>
                      <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: u.session_status === 'STARTED' ? 'var(--auth-accent)' : 'currentColor',
                        boxShadow: u.session_status === 'STARTED' ? '0 0 8px var(--auth-accent)' : 'none'
                      }} />
                      {u.session_status}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--auth-text-muted)', fontSize: '11px' }}>IDLE</span>
                  )}
                </td>
                <td style={{ 
                  padding: '16px 20px', 
                  textAlign: 'right',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0 8px 8px 0',
                  border: '1px solid var(--auth-border)',
                  borderLeft: 'none'
                }}>
                  <button 
                    disabled={!u.latest_session_id}
                    onClick={(e) => u.latest_session_id && handleViewReplay(e, u.user_id, u.latest_session_id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '10px',
                      fontWeight: '900',
                      borderRadius: '4px',
                      backgroundColor: u.latest_session_id ? 'var(--auth-accent)' : 'rgba(255, 255, 255, 0.02)',
                      color: u.latest_session_id ? 'var(--auth-black)' : 'var(--auth-text-muted)',
                      border: u.latest_session_id ? 'none' : '1px solid var(--auth-border)',
                      cursor: u.latest_session_id ? 'pointer' : 'not-allowed',
                      fontFamily: "'Space Mono', monospace",
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Auditor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && analytics.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
            NO ACTIVE OPERATORS DETECTED IN SECTOR
          </div>
        )}
      </div>
    </div>
  );
}

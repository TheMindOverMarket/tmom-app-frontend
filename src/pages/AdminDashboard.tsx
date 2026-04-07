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
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Admin Control Center
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Monitor user adherence across the platform. Identify top deviators and audit specific sessions.
          </p>
        </div>
        
        <RefreshButton 
          onRefresh={fetchAnalytics}
          isLoading={loading}
        />
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '4px', color: '#b91c1c', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
               <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
               <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Session</th>
               <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deviation Score</th>
               <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
               <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((u) => (
              <tr key={u.user_id} 
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => handleUserClick(u.user_id)}
              >
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{u.email}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{u.user_id}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  {u.latest_session_id ? (
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                      {u.latest_session_id.substring(0, 8)}...
                    </div>
                  ) : (
                    <span style={{ color: '#cbd5e1', fontSize: '12px' }}>None</span>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    backgroundColor: u.latest_deviation_score > 5 ? '#fef2f2' : (u.latest_deviation_score > 0 ? '#fffbeb' : '#f0fdf4'),
                    color: u.latest_deviation_score > 5 ? '#b91c1c' : (u.latest_deviation_score > 0 ? '#b45309' : '#15803d'),
                    fontWeight: '800',
                    fontSize: '12px',
                    border: '1px solid currentColor',
                    minWidth: '40px'
                  }}>
                    {u.latest_deviation_score}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  {u.session_status ? (
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      textTransform: 'uppercase',
                      color: u.session_status === 'STARTED' ? '#6366f1' : '#94a3b8'
                    }}>
                      {u.session_status}
                    </span>
                  ) : (
                    <span style={{ color: '#cbd5e1', fontSize: '11px' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button 
                    disabled={!u.latest_session_id}
                    onClick={(e) => u.latest_session_id && handleViewReplay(e, u.user_id, u.latest_session_id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '800',
                      borderRadius: '4px',
                      backgroundColor: u.latest_session_id ? '#0f172a' : '#f1f5f9',
                      color: u.latest_session_id ? '#ffffff' : '#94a3b8',
                      border: 'none',
                      cursor: u.latest_session_id ? 'pointer' : 'not-allowed',
                    }}
                  >
                    View Replay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && analytics.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No users found in the system.
          </div>
        )}
      </div>
    </div>
  );
}

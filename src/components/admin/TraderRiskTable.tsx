import type { AdminTraderRow } from '../../domain/admin/types';

interface TraderRiskTableProps {
  traders: AdminTraderRow[];
  onOpenReplay: (userId: string, sessionId?: string) => void;
  isDark?: boolean;
}

const RISK_TONE: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
  medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
  high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  critical: { bg: '#ffffff', text: '#000000', border: 'transparent' },
};

export function TraderRiskTable({ traders, onOpenReplay, isDark = false }: TraderRiskTableProps) {
  return (
    <div
      style={{
        borderRadius: '8px',
        border: isDark ? '1px solid var(--auth-border)' : '1px solid rgba(148,163,184,0.18)',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#ffffff',
        overflow: 'hidden',
        boxShadow: isDark ? 'none' : '0 16px 40px -28px rgba(15,23,42,0.35)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#e2e8f0'}` }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: isDark ? 400 : 900, 
          color: isDark ? '#ffffff' : '#0f172a', 
          letterSpacing: isDark ? '0.01em' : '-0.03em',
          fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit'
        }}>Trader Risk Intelligence</div>
        <div style={{ 
          fontSize: '13px', 
          color: isDark ? 'var(--auth-text-muted)' : '#64748b', 
          marginTop: '6px',
          fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
        }}>
          Consolidated risk profile mapping process adherence to financial exposure.
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
          <thead>
            <tr style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#f8fafc' }}>
              {['Trader', 'Risk', 'Adherence', 'Deviation Cost', 'Events', 'Drift (7d)', 'Primary Pattern', 'Replay'].map((header) => (
                <th
                  key={header}
                  style={{
                    textAlign: header === 'Replay' ? 'right' : 'left',
                    padding: '16px 32px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: isDark ? 'var(--auth-text-muted)' : '#64748b',
                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                    borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#e2e8f0'}`
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {traders.map((row) => {
              const tone = RISK_TONE[row.risk_rank_label] || RISK_TONE.low;
              return (
                <tr key={row.user_id} style={{ borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}` }}>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                    }}>{row.email}</div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: 'var(--auth-text-muted)', 
                      marginTop: '6px',
                      fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                      textTransform: 'uppercase'
                    }}>
                      {row.sessions_count} sessions audited
                    </div>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: tone.bg,
                        color: tone.text,
                        border: tone.border !== 'transparent' ? `1px solid ${tone.border}` : 'none',
                        fontSize: '9px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                      }}
                    >
                      {row.risk_rank_label}
                    </span>
                    <div style={{ 
                      fontSize: '10px', 
                      color: 'var(--auth-text-muted)', 
                      marginTop: '8px',
                      fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                    }}>Score {row.risk_rank_score.toFixed(1)}</div>
                  </td>
                  <td style={{ 
                    padding: '20px 32px', 
                    fontSize: '15px', 
                    fontWeight: 400, 
                    color: isDark ? 'var(--auth-accent)' : '#0f766e',
                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                  }}>
                    {row.adherence_rate.toFixed(1)}%
                  </td>
                  <td style={{ 
                    padding: '20px 32px', 
                    fontSize: '15px', 
                    fontWeight: 400, 
                    color: row.total_deviation_cost > 0 ? '#ef4444' : (isDark ? 'var(--auth-accent)' : '#10b981'),
                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                   }}>
                    ${row.total_deviation_cost.toFixed(2)}
                  </td>
                  <td style={{ 
                    padding: '20px 32px', 
                    fontSize: '12px', 
                    color: isDark ? '#ffffff' : '#334155', 
                    fontWeight: 400,
                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                  }}>
                    {row.total_deviation_events}
                    <span style={{ color: 'var(--auth-text-muted)', fontSize: '10px' }}> [{row.severe_deviation_events} SEVERE]</span>
                  </td>
                  <td style={{ 
                    padding: '20px 32px', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: row.drift_delta_7d < 0 ? '#ef4444' : (isDark ? 'var(--auth-accent)' : '#10b981'),
                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                  }}>
                    {row.drift_delta_7d > 0 ? '+' : ''}
                    {row.drift_delta_7d.toFixed(1)} pts
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ 
                      fontSize: '13px', 
                      color: isDark ? '#ffffff' : '#0f172a', 
                      fontWeight: 600,
                      fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                    }}>{row.top_deviation_type ?? 'STABLE'}</div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: 'var(--auth-text-muted)', 
                      marginTop: '6px',
                      fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                      textTransform: 'uppercase'
                    }}>{row.top_deviation_family ?? 'NO CRITICAL PATTERNS'}</div>
                  </td>
                  <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                    <button
                      onClick={() => onOpenReplay(row.user_id, row.latest_session_id)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '4px',
                        border: isDark ? '1px solid var(--auth-border)' : '1px solid #cbd5e1',
                        backgroundColor: isDark ? 'transparent' : '#ffffff',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: row.latest_session_id ? 'pointer' : 'not-allowed',
                        opacity: row.latest_session_id ? 1 : 0.55,
                        letterSpacing: '0.1em',
                        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={e => isDark && row.latest_session_id && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                      onMouseOut={e => isDark && row.latest_session_id && (e.currentTarget.style.backgroundColor = 'transparent')}
                      disabled={!row.latest_session_id}
                    >
                      AUDIT REPLAY
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

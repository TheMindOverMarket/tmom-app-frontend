import type { AdminPlaybookRow } from '../../domain/admin/types';

interface PlaybookInsightsTableProps {
  playbooks: AdminPlaybookRow[];
  isDark?: boolean;
}

export function PlaybookInsightsTable({ playbooks, isDark = false }: PlaybookInsightsTableProps) {
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
        }}>Strategy Friction Map</div>
        <div style={{ 
          fontSize: '13px', 
          color: 'var(--auth-text-muted)', 
          marginTop: '6px',
          fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
        }}>
          Exposing collision points between strategy architecture and execution reality.
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
          <thead>
            <tr style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#f8fafc' }}>
              {['Playbook', 'Traders', 'Sessions', 'Adherence', 'Deviation Cost', 'Broken Most'].map((header) => (
                <th
                  key={header}
                  style={{
                    textAlign: 'left',
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
            {playbooks.map((row) => (
              <tr key={row.playbook_id} style={{ borderBottom: `1px solid ${isDark ? 'var(--auth-border)' : '#f1f5f9'}` }}>
                <td style={{ padding: '20px 32px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                  }}>{row.playbook_name}</div>
                </td>
                <td style={{ 
                  padding: '20px 32px', 
                  fontSize: '14px', 
                  color: isDark ? '#ffffff' : '#334155', 
                  fontWeight: 400,
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>{row.trader_count}</td>
                <td style={{ 
                  padding: '20px 32px', 
                  fontSize: '14px', 
                  color: isDark ? '#ffffff' : '#334155', 
                  fontWeight: 400,
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>{row.sessions_count}</td>
                <td style={{ 
                  padding: '20px 32px', 
                  fontSize: '15px', 
                  color: isDark ? 'var(--auth-accent)' : '#0f766e', 
                  fontWeight: 400,
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>{row.adherence_rate.toFixed(1)}%</td>
                <td style={{ 
                  padding: '20px 32px', 
                  fontSize: '15px', 
                  color: row.total_deviation_cost > 0 ? '#ef4444' : (isDark ? 'var(--auth-accent)' : '#0f766e'), 
                  fontWeight: 400,
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  ${row.total_deviation_cost.toFixed(2)}
                </td>
                <td style={{ 
                  padding: '20px 32px', 
                  fontSize: '13px', 
                  color: isDark ? '#ffffff' : '#475569', 
                  fontWeight: 400,
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  {row.most_broken_rule?.toUpperCase() ?? 'NONE'}
                </td>
              </tr>
            ))}
            {playbooks.length === 0 && (
              <tr>
                <td colSpan={6} style={{ 
                  padding: '40px 32px', 
                  fontSize: '12px', 
                  color: 'var(--auth-text-muted)', 
                  textAlign: 'center',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  NO PLAYBOOK INTELLIGENCE CAPTURED
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

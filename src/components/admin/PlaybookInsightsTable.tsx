import type { AdminPlaybookRow } from '../../domain/admin/types';

interface PlaybookInsightsTableProps {
  playbooks: AdminPlaybookRow[];
}

export function PlaybookInsightsTable({ playbooks }: PlaybookInsightsTableProps) {
  return (
    <div
      style={{
        borderRadius: '20px',
        border: '1px solid rgba(148,163,184,0.18)',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 16px 40px -28px rgba(15,23,42,0.35)',
      }}
    >
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Playbook Friction Map</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          Exposes where strategy design and trader behavior are colliding.
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['Playbook', 'Traders', 'Sessions', 'Adherence', 'Deviation Cost', 'Broken Most'].map((header) => (
                <th
                  key={header}
                  style={{
                    textAlign: 'left',
                    padding: '12px 18px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playbooks.map((row) => (
              <tr key={row.playbook_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{row.playbook_name}</div>
                </td>
                <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 700 }}>{row.trader_count}</td>
                <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 700 }}>{row.sessions_count}</td>
                <td style={{ padding: '14px 18px', fontSize: '14px', color: '#0f766e', fontWeight: 800 }}>{row.adherence_rate.toFixed(1)}%</td>
                <td style={{ padding: '14px 18px', fontSize: '14px', color: row.total_deviation_cost > 0 ? '#b91c1c' : '#0f766e', fontWeight: 800 }}>
                  ${row.total_deviation_cost.toFixed(2)}
                </td>
                <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>
                  {row.most_broken_rule ?? 'No recurring break yet'}
                </td>
              </tr>
            ))}
            {playbooks.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '18px', fontSize: '13px', color: '#64748b' }}>
                  No playbook data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

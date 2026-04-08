import type { AdminTraderRow } from '../../domain/admin/types';

interface TraderRiskTableProps {
  traders: AdminTraderRow[];
  onOpenReplay: (userId: string, sessionId?: string) => void;
}

const RISK_TONE: Record<string, { bg: string; text: string }> = {
  low: { bg: '#dcfce7', text: '#15803d' },
  medium: { bg: '#fef3c7', text: '#b45309' },
  high: { bg: '#fee2e2', text: '#b91c1c' },
  critical: { bg: '#111827', text: '#f8fafc' },
};

export function TraderRiskTable({ traders, onOpenReplay }: TraderRiskTableProps) {
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
        <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Trader Risk Table</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          Rank traders by hidden risk, not just by latest PnL or last session.
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['Trader', 'Risk', 'Adherence', 'Deviation Cost', 'Events', 'Drift (7d)', 'Primary Pattern', 'Replay'].map((header) => (
                <th
                  key={header}
                  style={{
                    textAlign: header === 'Replay' ? 'right' : 'left',
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
            {traders.map((row) => {
              const tone = RISK_TONE[row.risk_rank_label];
              return (
                <tr key={row.user_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{row.email}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      {row.sessions_count} sessions
                      {row.latest_session_status ? ` • ${row.latest_session_status}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 10px',
                        borderRadius: '999px',
                        backgroundColor: tone.bg,
                        color: tone.text,
                        fontSize: '11px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {row.risk_rank_label}
                    </span>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Score {row.risk_rank_score.toFixed(1)}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 800, color: '#0f766e' }}>
                    {row.adherence_rate.toFixed(1)}%
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 800, color: row.total_deviation_cost > 0 ? '#b91c1c' : '#0f766e' }}>
                    ${row.total_deviation_cost.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 700 }}>
                    {row.total_deviation_events}
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}> total / {row.severe_deviation_events} severe</span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 800, color: row.drift_delta_7d < 0 ? '#b91c1c' : '#0f766e' }}>
                    {row.drift_delta_7d > 0 ? '+' : ''}
                    {row.drift_delta_7d.toFixed(1)} pts
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{row.top_deviation_type ?? 'No pattern yet'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{row.top_deviation_family ?? 'Stable behavior'}</div>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => onOpenReplay(row.user_id, row.latest_session_id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 900,
                        cursor: row.latest_session_id ? 'pointer' : 'not-allowed',
                        opacity: row.latest_session_id ? 1 : 0.55,
                      }}
                      disabled={!row.latest_session_id}
                    >
                      View Replay
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

import type { AdminInterventionRow } from '../../domain/admin/types';

interface InterventionQueueProps {
  interventions: AdminInterventionRow[];
  onOpenReplay: (userId: string, sessionId?: string) => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  monitor: { bg: '#eff6ff', text: '#1d4ed8' },
  coach: { bg: '#fef3c7', text: '#b45309' },
  restrict: { bg: '#fee2e2', text: '#b91c1c' },
  urgent: { bg: '#111827', text: '#f8fafc' },
};

export function InterventionQueue({ interventions, onOpenReplay }: InterventionQueueProps) {
  return (
    <div
      style={{
        padding: '22px',
        borderRadius: '24px',
        background:
          'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 48%, rgba(127,29,29,0.92) 100%)',
        color: '#f8fafc',
        boxShadow: '0 30px 80px -40px rgba(15,23,42,0.85)',
      }}
    >
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fca5a5' }}>
          Aha Layer
        </div>
        <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.04em', marginTop: '8px' }}>Intervention Queue</div>
        <div style={{ fontSize: '14px', color: 'rgba(248,250,252,0.72)', marginTop: '6px', maxWidth: '760px' }}>
          Ranked by cost, severity, repeat behavior, and recent drift so a risk manager can act before a breach turns into an account blow-up.
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {interventions.slice(0, 5).map((row) => {
          const priorityStyle = PRIORITY_STYLES[row.priority_label] || PRIORITY_STYLES.monitor;
          return (
            <div
              key={row.user_id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                alignItems: 'center',
                padding: '16px 18px',
                borderRadius: '18px',
                backgroundColor: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: priorityStyle.bg,
                      color: priorityStyle.text,
                      fontSize: '11px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {row.priority_label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>{row.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {row.drivers.map((driver) => (
                    <span
                      key={driver}
                      style={{
                        fontSize: '11px',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '999px',
                        padding: '5px 10px',
                      }}
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                <Metric label="Score" value={row.priority_score.toFixed(1)} />
                <Metric label="Cost" value={`$${row.total_deviation_cost.toFixed(2)}`} />
                <Metric label="Severe" value={`${row.severe_events}`} />
              </div>

              <button
                onClick={() => onOpenReplay(row.user_id, row.latest_session_id)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  cursor: row.latest_session_id ? 'pointer' : 'not-allowed',
                  opacity: row.latest_session_id ? 1 : 0.55,
                }}
                disabled={!row.latest_session_id}
              >
                Audit Replay
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: '17px', fontWeight: 900, color: '#f8fafc', marginTop: '5px' }}>{value}</div>
    </div>
  );
}

import type { AdminInterventionRow } from '../../domain/admin/types';

interface InterventionQueueProps {
  interventions: AdminInterventionRow[];
  onOpenReplay: (userId: string, sessionId?: string) => void;
  isDark?: boolean;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  monitor: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
  coach: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
  restrict: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  urgent: { bg: '#ffffff', text: '#000000', border: 'transparent' },
};

export function InterventionQueue({ interventions, onOpenReplay, isDark = false }: InterventionQueueProps) {
  return (
    <div
      style={{
        padding: '32px',
        borderRadius: '12px',
        background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 48%, rgba(127,29,29,0.92) 100%)',
        color: '#ffffff',
        boxShadow: isDark ? 'none' : '0 30px 80px -40px rgba(15,23,42,0.85)',
        border: isDark ? '1px solid var(--auth-border)' : 'none'
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: 800, 
          letterSpacing: '0.2em', 
          textTransform: 'uppercase', 
          color: isDark ? 'var(--auth-accent)' : '#fca5a5',
          fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
        }}>
          Risk Mitigation Layer
        </div>
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 400, 
          letterSpacing: '0.01em', 
          marginTop: '12px',
          fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit'
        }}>Intervention Queue</div>
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--auth-text-muted)', 
          marginTop: '8px', 
          maxWidth: '760px',
          fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
          lineHeight: 1.6
        }}>
          Ranked by cost, severity, repeat behavior, and recent drift. Targeted interventions designed to neutralize bad habits before they compound.
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {interventions.slice(0, 5).map((row) => {
          const priorityStyle = PRIORITY_STYLES[row.priority_label] || PRIORITY_STYLES.monitor;
          return (
            <div
              key={row.user_id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                alignItems: 'center',
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${isDark ? 'var(--auth-border)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      backgroundColor: priorityStyle.bg,
                      color: priorityStyle.text,
                      border: priorityStyle.border !== 'transparent' ? `1px solid ${priorityStyle.border}` : 'none',
                      fontSize: '10px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                    }}
                  >
                    {row.priority_label}
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: isDark ? '#ffffff' : '#e2e8f0',
                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                  }}>{row.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {row.drivers.map((driver) => (
                    <span
                      key={driver}
                      style={{
                        fontSize: '10px',
                        color: 'var(--auth-text-muted)',
                        border: '1px solid var(--auth-border)',
                        borderRadius: '2px',
                        padding: '4px 10px',
                        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                        textTransform: 'uppercase'
                      }}
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                <Metric label="Score" value={row.priority_score.toFixed(1)} isDark={isDark} />
                <Metric label="Cost" value={`$${row.total_deviation_cost.toFixed(2)}`} isDark={isDark} />
                <Metric label="Severe" value={`${row.severe_events}`} isDark={isDark} />
              </div>

              <button
                onClick={() => onOpenReplay(row.user_id, row.latest_session_id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '4px',
                  border: isDark ? '1px solid var(--auth-border)' : 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: isDark ? 'transparent' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div>
      <div style={{ 
        fontSize: '9px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.1em', 
        color: 'var(--auth-text-muted)', 
        fontWeight: 800,
        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '20px', 
        fontWeight: 400, 
        color: isDark ? '#ffffff' : '#f8fafc', 
        marginTop: '6px',
        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
      }}>{value}</div>
    </div>
  );
}

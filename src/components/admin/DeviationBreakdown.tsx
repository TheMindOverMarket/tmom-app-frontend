import type { AdminDeviationBreakdown } from '../../domain/admin/types';

interface DeviationBreakdownProps {
  breakdown: AdminDeviationBreakdown;
}

function toRows(record: Record<string, number>, costRecord?: Record<string, number>) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, value]) => ({
      key,
      value,
      cost: costRecord?.[key] ?? 0,
    }));
}

function NiceLabel({ value }: { value: string }) {
  return <>{value.replace(/_/g, ' ')}</>;
}

export function DeviationBreakdown({ breakdown, isDark = false }: DeviationBreakdownProps & { isDark?: boolean }) {
  const familyRows = toRows(breakdown.by_family, breakdown.cost_by_family);
  const typeRows = toRows(breakdown.by_type, breakdown.cost_by_type);
  const severityRows = toRows(breakdown.by_severity);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
      }}
    >
      <BreakdownCard
        title="Deviation Families"
        subtitle="Where the process is leaking"
        rows={familyRows}
        isDark={isDark}
      />
      <BreakdownCard
        title="Deviation Types"
        subtitle="Common behavioral deviations"
        rows={typeRows}
        isDark={isDark}
      />
      <BreakdownCard
        title="Severity Mix"
        subtitle="Risk impact distribution"
        rows={severityRows}
        hideCost
        isDark={isDark}
      />
    </div>
  );
}

function BreakdownCard({
  title,
  subtitle,
  rows,
  hideCost = false,
  isDark = false
}: {
  title: string;
  subtitle: string;
  rows: Array<{ key: string; value: number; cost: number }>;
  hideCost?: boolean;
  isDark?: boolean;
}) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '8px',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#ffffff',
        border: isDark ? '1px solid var(--auth-border)' : '1px solid rgba(148,163,184,0.18)',
        boxShadow: isDark ? 'none' : '0 16px 40px -28px rgba(15,23,42,0.35)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ 
        fontSize: '18px', 
        fontWeight: isDark ? 400 : 900, 
        color: isDark ? '#ffffff' : '#0f172a', 
        letterSpacing: isDark ? '0.01em' : '-0.03em',
        fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit'
      }}>{title}</div>
      <div style={{ 
        fontSize: '12px', 
        color: 'var(--auth-text-muted)', 
        marginTop: '6px', 
        marginBottom: '20px',
        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
      }}>{subtitle}</div>
      <div style={{ display: 'grid', gap: '16px' }}>
        {rows.length === 0 && (
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--auth-text-muted)', 
            padding: '20px 0', 
            textAlign: 'center',
            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
          }}>DATA UNAVAILABLE</div>
        )}
        {rows.map((row) => (
          <div key={row.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: isDark ? '#ffffff' : '#0f172a',
                fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                textTransform: 'uppercase'
              }}>
                <NiceLabel value={row.key} />
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: isDark ? 'var(--auth-accent)' : '#475569', 
                fontWeight: 800,
                fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
              }}>
                {row.value}
                {!hideCost && row.cost > 0 ? ` [ $${row.cost.toFixed(2)} ]` : ''}
              </div>
            </div>
            <div style={{ height: '4px', borderRadius: '2px', backgroundColor: isDark ? 'var(--auth-border)' : '#e2e8f0', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(row.value / maxValue) * 100}%`,
                  background: isDark ? 'var(--auth-accent)' : 'linear-gradient(90deg, #0f766e 0%, #b91c1c 100%)',
                  opacity: isDark ? 0.7 : 1
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

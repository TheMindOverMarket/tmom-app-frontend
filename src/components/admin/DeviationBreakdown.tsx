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

export function DeviationBreakdown({ breakdown }: DeviationBreakdownProps) {
  const familyRows = toRows(breakdown.by_family, breakdown.cost_by_family);
  const typeRows = toRows(breakdown.by_type, breakdown.cost_by_type);
  const severityRows = toRows(breakdown.by_severity);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      <BreakdownCard
        title="Deviation Families"
        subtitle="Where the process is leaking"
        rows={familyRows}
      />
      <BreakdownCard
        title="Deviation Types"
        subtitle="What behavior is showing up most"
        rows={typeRows}
      />
      <BreakdownCard
        title="Severity Mix"
        subtitle="How dangerous the pattern is"
        rows={severityRows}
        hideCost
      />
    </div>
  );
}

function BreakdownCard({
  title,
  subtitle,
  rows,
  hideCost = false,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ key: string; value: number; cost: number }>;
  hideCost?: boolean;
}) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(148,163,184,0.18)',
        boxShadow: '0 16px 40px -28px rgba(15,23,42,0.35)',
      }}
    >
      <div style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>{title}</div>
      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>{subtitle}</div>
      <div style={{ display: 'grid', gap: '12px' }}>
        {rows.length === 0 && <div style={{ fontSize: '13px', color: '#64748b' }}>No deviation data yet.</div>}
        {rows.map((row) => (
          <div key={row.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                <NiceLabel value={row.key} />
              </div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>
                {row.value}
                {!hideCost && row.cost > 0 ? ` • $${row.cost.toFixed(2)}` : ''}
              </div>
            </div>
            <div style={{ height: '9px', borderRadius: '999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(row.value / maxValue) * 100}%`,
                  background: 'linear-gradient(90deg, #0f766e 0%, #b91c1c 100%)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

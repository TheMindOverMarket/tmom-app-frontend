import type { AdminTrendPoint } from '../../domain/admin/types';

interface AnalyticsTrendChartProps {
  title: string;
  subtitle: string;
  points: AdminTrendPoint[];
  metric: 'adherence_rate' | 'deviation_cost';
}

function formatValue(metric: 'adherence_rate' | 'deviation_cost', value: number) {
  return metric === 'adherence_rate' ? `${value.toFixed(1)}%` : `$${value.toFixed(2)}`;
}

export function AnalyticsTrendChart({ title, subtitle, points, metric }: AnalyticsTrendChartProps) {
  const values = points.map((point) => point[metric]);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);

  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 100 - ((point[metric] - minValue) / range) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const accent = metric === 'adherence_rate' ? '#0f766e' : '#b91c1c';

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(148,163,184,0.18)',
        backgroundColor: '#ffffff',
        boxShadow: '0 16px 40px -28px rgba(15,23,42,0.4)',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{subtitle}</div>
      </div>

      {points.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#64748b', padding: '32px 0' }}>No historical sessions yet.</div>
      ) : (
        <>
          <div style={{ height: '160px', marginBottom: '16px' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id={`fill-${metric}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <path d={`M 0 100 ${path} L 100 100 Z`} fill={`url(#fill-${metric})`} stroke="none" />
              <path d={path} fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" />
              {points.map((point, index) => {
                const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
                const y = 100 - ((point[metric] - minValue) / range) * 100;
                return <circle key={`${point.bucket}-${metric}`} cx={x} cy={y} r="2.2" fill={accent} />;
              })}
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(points.length, 6)}, 1fr)`, gap: '10px' }}>
            {points.slice(-6).map((point) => (
              <div key={point.bucket} style={{ minWidth: 0 }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                  {new Date(point.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '15px', color: accent, fontWeight: 900, marginTop: '4px' }}>
                  {formatValue(metric, point[metric])}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{point.sessions} sessions</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

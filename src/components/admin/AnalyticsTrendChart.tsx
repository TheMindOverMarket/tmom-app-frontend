import type { AdminTrendPoint } from '../../domain/admin/types';

interface AnalyticsTrendChartProps {
  title: string;
  subtitle: string;
  points: AdminTrendPoint[];
  metric: 'adherence_rate' | 'deviation_cost';
  isDark?: boolean;
}

function formatValue(metric: 'adherence_rate' | 'deviation_cost', value: number) {
  return metric === 'adherence_rate' ? `${value.toFixed(1)}%` : `$${value.toFixed(2)}`;
}

export function AnalyticsTrendChart({ title, subtitle, points, metric, isDark = false }: AnalyticsTrendChartProps) {
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

  const accent = metric === 'adherence_rate' ? (isDark ? 'var(--auth-accent)' : '#0f766e') : '#ef4444';

  return (
    <div
      style={{
        padding: '28px',
        borderRadius: '8px',
        border: isDark ? '1px solid var(--auth-border)' : '1px solid rgba(148,163,184,0.18)',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#ffffff',
        boxShadow: isDark ? 'none' : '0 16px 40px -28px rgba(15,23,42,0.4)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: isDark ? 400 : 900, 
          color: isDark ? '#ffffff' : '#0f172a', 
          letterSpacing: isDark ? '0.01em' : '-0.03em',
          fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit'
        }}>{title}</div>
        <div style={{ 
          fontSize: '13px', 
          color: isDark ? 'var(--auth-text-muted)' : '#64748b', 
          marginTop: '6px',
          fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
        }}>{subtitle}</div>
      </div>

      {points.length === 0 ? (
        <div style={{ 
          fontSize: '13px', 
          color: 'var(--auth-text-muted)', 
          padding: '40px 0', 
          textAlign: 'center',
          fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
        }}>No historical sessions recorded in this scope.</div>
      ) : (
        <>
          <div style={{ height: '180px', marginBottom: '24px' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id={`fill-${metric}-${isDark}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.15" : "0.22"} />
                  <stop offset="100%" stopColor={accent} stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path d={`M 0 100 ${path} L 100 100 Z`} fill={`url(#fill-${metric}-${isDark})`} stroke="none" />
              <path d={path} fill="none" stroke={accent} strokeWidth={isDark ? "1.5" : "2.6"} strokeLinecap="round" />
              {points.map((point, index) => {
                const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
                const y = 100 - ((point[metric] - minValue) / range) * 100;
                return (
                  <circle 
                    key={`${point.bucket}-${metric}`} 
                    cx={x} 
                    cy={y} 
                    r={isDark ? "1.8" : "2.2"} 
                    fill={isDark ? "var(--auth-black)" : accent} 
                    stroke={accent} 
                    strokeWidth={isDark ? "1" : "0"}
                  />
                );
              })}
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(points.length, 6)}, 1fr)`, gap: '16px' }}>
            {points.slice(-6).map((point) => (
              <div key={point.bucket} style={{ minWidth: 0 }}>
                <div style={{ 
                  fontSize: '9px', 
                  color: 'var(--auth-text-muted)', 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  {new Date(point.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ 
                  fontSize: '15px', 
                  color: isDark ? '#ffffff' : accent, 
                  fontWeight: 900, 
                  marginTop: '4px',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>
                  {formatValue(metric, point[metric])}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: isDark ? 'rgba(255, 255, 255, 0.3)' : '#475569', 
                  marginTop: '4px',
                  fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                }}>{point.sessions} sessions</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

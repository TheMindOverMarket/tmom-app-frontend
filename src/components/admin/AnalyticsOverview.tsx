import type { AdminAnalyticsOverview } from '../../domain/admin/types';

interface AnalyticsOverviewProps {
  overview: AdminAnalyticsOverview;
  isDark?: boolean;
}

const CARD_STYLES = [
  { label: 'Firm Adherence', key: 'adherence_rate', accent: 'var(--auth-accent)', format: (value: number) => `${value.toFixed(1)}%` },
  { label: 'Deviation Cost', key: 'total_deviation_cost', accent: '#ef4444', format: (value: number) => `$${value.toFixed(2)}` },
  { label: 'Deviation Events', key: 'total_deviation_events', accent: '#f59e0b', format: (value: number) => `${value}` },
  { label: 'At-Risk Traders', key: 'at_risk_traders', accent: '#3b82f6', format: (value: number) => `${value}` },
  { label: 'Live Sessions', key: 'active_sessions', accent: '#ffffff', format: (value: number) => `${value}` },
];

export function AnalyticsOverview({ overview, isDark = false }: AnalyticsOverviewProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {CARD_STYLES.map((card) => {
        const rawValue = overview[card.key as keyof AdminAnalyticsOverview] as number;
        return (
          <div
            key={card.label}
            style={{
              padding: '24px',
              borderRadius: '8px',
              border: isDark ? '1px solid var(--auth-border)' : '1px solid rgba(148,163,184,0.18)',
              background: isDark ? 'rgba(255, 255, 255, 0.01)' : 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
              boxShadow: isDark ? 'none' : '0 18px 32px -24px rgba(15,23,42,0.35)',
              transition: 'all 0.3s ease'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: isDark ? 'var(--auth-text-muted)' : '#64748b',
                marginBottom: '12px',
                fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
              }}
            >
              {card.label}
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 400, 
              color: isDark ? (card.key === 'active_sessions' ? '#ffffff' : card.accent) : card.accent, 
              letterSpacing: isDark ? '0.02em' : '-0.04em',
              fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
            }}>
              {card.format(rawValue)}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: isDark ? 'rgba(255, 255, 255, 0.3)' : '#475569', 
              marginTop: '12px', 
              minHeight: '18px',
              fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
              lineHeight: 1.4
            }}>
              {card.key === 'adherence_rate' && `${overview.total_traders} Tracked Traders`}
              {card.key === 'total_deviation_cost' && `$${overview.total_unauthorized_gain.toFixed(2)} Unauthorized Gain`}
              {card.key === 'total_deviation_events' && `${overview.completed_sessions} Audited Sessions`}
              {card.key === 'at_risk_traders' && 'High-priority interventions'}
              {card.key === 'active_sessions' && 'Live automated supervision'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import type { AdminAnalyticsOverview } from '../../domain/admin/types';

interface AnalyticsOverviewProps {
  overview: AdminAnalyticsOverview;
}

const CARD_STYLES = [
  { label: 'Firm Adherence', key: 'adherence_rate', accent: '#0f766e', format: (value: number) => `${value.toFixed(1)}%` },
  { label: 'Deviation Cost', key: 'total_deviation_cost', accent: '#b91c1c', format: (value: number) => `$${value.toFixed(2)}` },
  { label: 'Deviation Events', key: 'total_deviation_events', accent: '#7c3aed', format: (value: number) => `${value}` },
  { label: 'At-Risk Traders', key: 'at_risk_traders', accent: '#b45309', format: (value: number) => `${value}` },
  { label: 'Live Sessions', key: 'active_sessions', accent: '#1d4ed8', format: (value: number) => `${value}` },
];

export function AnalyticsOverview({ overview }: AnalyticsOverviewProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
      {CARD_STYLES.map((card) => {
        const rawValue = overview[card.key as keyof AdminAnalyticsOverview] as number;
        return (
          <div
            key={card.label}
            style={{
              padding: '18px',
              borderRadius: '18px',
              border: '1px solid rgba(148,163,184,0.18)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
              boxShadow: '0 18px 32px -24px rgba(15,23,42,0.35)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#64748b',
                marginBottom: '10px',
              }}
            >
              {card.label}
            </div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: card.accent, letterSpacing: '-0.04em' }}>
              {card.format(rawValue)}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px', minHeight: '18px' }}>
              {card.key === 'adherence_rate' && `${overview.total_traders} tracked traders across the firm`}
              {card.key === 'total_deviation_cost' && `${overview.total_unauthorized_gain.toFixed(2)} unauthorized gain captured`}
              {card.key === 'total_deviation_events' && `${overview.completed_sessions} completed sessions audited`}
              {card.key === 'at_risk_traders' && 'Intervention candidates needing attention'}
              {card.key === 'active_sessions' && 'Currently supervised sessions in progress'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

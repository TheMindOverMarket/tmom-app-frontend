import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AnalyticsTrendChart } from './AnalyticsTrendChart';
import { InterventionQueue } from './InterventionQueue';
import { TraderRiskTable } from './TraderRiskTable';
import { DeviationBreakdown } from './DeviationBreakdown';
import { PlaybookInsightsTable } from './PlaybookInsightsTable';
import { RefreshButton } from '../common/RefreshButton';
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics';
import { SessionAnalytics } from '../session/SessionAnalytics';

export function ManagerAnalyticsDashboard() {
  const { dashboard, loading, error, refresh } = useAdminAnalytics(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showAuditTrail = useMemo(() => searchParams.has('user_id') || searchParams.has('session_id'), [searchParams]);

  const handleOpenReplay = (userId: string, sessionId?: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('user_id', userId);
    params.set('tab', 'completed');
    if (sessionId) {
      params.set('session_id', sessionId);
    }
    navigate(`/analytics?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div
        style={{
          padding: '28px',
          borderRadius: '28px',
          background:
            'radial-gradient(circle at top left, rgba(251,191,36,0.28) 0%, rgba(255,255,255,0.96) 28%, rgba(248,250,252,0.95) 100%)',
          border: '1px solid rgba(148,163,184,0.18)',
          boxShadow: '0 28px 80px -48px rgba(15,23,42,0.55)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px' }}>
          <div style={{ maxWidth: '760px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Strategy Supervisor Analytics
            </div>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '34px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.05em' }}>
              Make discipline visible, auditable, and actionable.
            </h1>
            <p style={{ margin: '12px 0 0 0', fontSize: '15px', lineHeight: 1.6, color: '#475569' }}>
              This view is built for a prop-firm risk manager: consistency, strategy adherence, hidden cost of deviation,
              and the next intervention to make before a bad pattern turns into a blow-up.
            </p>
          </div>
          <RefreshButton onRefresh={() => void refresh()} isLoading={loading} label="REFRESH DASHBOARD" />
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '16px 18px',
            borderRadius: '14px',
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {dashboard ? (
        <>
          <AnalyticsOverview overview={dashboard.overview} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <AnalyticsTrendChart
              title="Adherence Trend"
              subtitle="How consistently the firm is following plan across audited sessions."
              points={dashboard.trends}
              metric="adherence_rate"
            />
            <AnalyticsTrendChart
              title="Deviation Cost Trend"
              subtitle="How much process leakage is costing over time."
              points={dashboard.trends}
              metric="deviation_cost"
            />
          </div>

          <InterventionQueue interventions={dashboard.interventions} onOpenReplay={handleOpenReplay} />

          <TraderRiskTable traders={dashboard.traders} onOpenReplay={handleOpenReplay} />

          <DeviationBreakdown breakdown={dashboard.deviations} />

          <PlaybookInsightsTable playbooks={dashboard.playbooks} />
        </>
      ) : loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading analytics...</div>
      ) : null}

      {showAuditTrail && (
        <div style={{ marginTop: '8px' }}>
          <SessionAnalytics />
        </div>
      )}
    </div>
  );
}

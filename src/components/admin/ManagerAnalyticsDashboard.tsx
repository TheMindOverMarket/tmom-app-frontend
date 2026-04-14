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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px', backgroundColor: 'transparent' }}>
      <div
        style={{
          padding: '40px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--auth-border)',
          boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div style={{ maxWidth: '800px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              color: 'var(--auth-accent)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em',
              fontFamily: "'Space Mono', monospace",
              marginBottom: '12px'
            }}>
              Strategy Supervisor Intelligence
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '42px', 
              fontWeight: 400, 
              color: '#ffffff', 
              letterSpacing: '0.02em',
              fontFamily: "'Cormorant Garamond', serif",
              lineHeight: 1.1
            }}>
              Quantify discipline, audit execution, and maximize adherence.
            </h1>
            <p style={{ 
              margin: '16px 0 0 0', 
              fontSize: '15px', 
              lineHeight: 1.6, 
              color: 'var(--auth-text-muted)',
              fontFamily: "'Space Mono', monospace"
            }}>
              Consolidated audit trail for all active and completed sessions. Monitor deviation drift, process leakage, and intervenable patterns in real-time.
            </p>
          </div>
          <RefreshButton onRefresh={() => void refresh()} isLoading={loading} isDark={true} />
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '20px 24px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: '#f87171',
            fontSize: '13px',
            fontWeight: 800,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.05em'
          }}
        >
          <span style={{ color: '#ef4444', marginRight: '8px' }}>[CRITICAL]</span> {error}
        </div>
      )}

      {dashboard ? (
        <>
          <AnalyticsOverview overview={dashboard.overview} isDark={true} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <AnalyticsTrendChart
              title="Adherence Trend"
              subtitle="Firm-wide process consistency across audited sessions."
              points={dashboard.trends}
              metric="adherence_rate"
              isDark={true}
            />
            <AnalyticsTrendChart
              title="Deviation Cost Trend"
              subtitle="Impact of process leakage over chronological scope."
              points={dashboard.trends}
              metric="deviation_cost"
              isDark={true}
            />
          </div>

          <InterventionQueue interventions={dashboard.interventions} onOpenReplay={handleOpenReplay} isDark={true} />

          <TraderRiskTable traders={dashboard.traders} onOpenReplay={handleOpenReplay} isDark={true} />

          <DeviationBreakdown breakdown={dashboard.deviations} isDark={true} />

          <PlaybookInsightsTable playbooks={dashboard.playbooks} isDark={true} />
        </>
      ) : loading ? (
        <div style={{ 
          padding: '80px', 
          textAlign: 'center', 
          color: 'var(--auth-text-muted)', 
          fontSize: '12px', 
          fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.2em'
        }}>
          INITIALIZING ANALYTICS ENGINE...
        </div>
      ) : null}

      {showAuditTrail && (
        <div style={{ marginTop: '16px' }}>
          <SessionAnalytics />
        </div>
      )}
    </div>
  );
}

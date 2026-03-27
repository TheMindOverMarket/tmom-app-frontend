import { AlertTriangle, DollarSign, Shield, Clock, BarChart3, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useState } from 'react';
import type { DeviationRecord, DeviationSummary } from '../../hooks/useDeviationEngine';
import { StatusPlaceholder } from '../common/StatusPlaceholder';

// ─── Severity Colors ─────────────────────────────────────────────────
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#6b7280',
};

const DEVIATION_TYPE_LABELS: Record<string, string> = {
  INVALID_TRADE: 'Invalid Trade',
  EARLY_ENTRY: 'Early Entry',
  LATE_ENTRY: 'Late Entry',
  MISSED_TRADE: 'Missed Trade',
  OVERSIZE: 'Oversize',
  UNDERSIZE: 'Undersize',
  COOLDOWN_VIOLATION: 'Cooldown Breach',
  PYRAMIDING_VIOLATION: 'Pyramiding Breach',
  DAILY_LOSS_CAP_BREACH: 'Loss Cap Breach',
  MAX_POSITIONS_BREACH: 'Max Positions',
};

const FAMILY_ICONS: Record<string, any> = {
  VALIDITY: Shield,
  TIMING: Clock,
  SIZE: BarChart3,
  RISK_PROCESS: AlertTriangle,
};

// ─── Component Props ─────────────────────────────────────────────────

interface DeviationPanelProps {
  summary: DeviationSummary | null;
  records: DeviationRecord[];
  isActive: boolean;
}

// ─── Main Component ──────────────────────────────────────────────────

export function DeviationPanel({ summary, records, isActive }: DeviationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isActive && records.length === 0) {
    return (
      <StatusPlaceholder 
        icon={Zap}
        title={`DEVIATION ENGINE INACTIVE`}
        subtitle={`Start a live session to begin the real-time cost-of-deviation analysis.`}
        style={{ 
          border: '1px solid #e2e8f0', 
          borderRadius: '4px',
          padding: '40px 16px',
          minHeight: 'auto'
        }}
      />
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1,
      minHeight: '400px', // ensure panel stands out visually
    }}>
      {/* ── Header ─── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 16px',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isActive ? '#10b981' : '#94a3b8',
            animation: isActive ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{
            fontSize: '10px',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '0.15em',
          }}>
            DEVIATION COST ENGINE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {summary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={12} color="#ef4444" />
              <span style={{
                fontSize: '12px',
                fontWeight: 900,
                color: summary.total_deviation_cost > 0 ? '#ef4444' : '#10b981',
              }}>
                {summary.total_deviation_cost > 0
                  ? `-$${summary.total_deviation_cost.toFixed(2)}`
                  : '$0.00'}
              </span>
            </div>
          )}
          {isExpanded
            ? <ChevronUp size={14} color="#94a3b8" />
            : <ChevronDown size={14} color="#94a3b8" />}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* ── Summary Cards ─── */}
          {summary && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              backgroundColor: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
            }}>
              <SummaryCell
                label="COST"
                value={`$${summary.total_deviation_cost.toFixed(2)}`}
                color={summary.total_deviation_cost > 0 ? '#ef4444' : '#10b981'}
              />
              <SummaryCell
                label="UNAUTH GAIN"
                value={`$${summary.total_unauthorized_gain.toFixed(2)}`}
                color={summary.total_unauthorized_gain > 0 ? '#f97316' : '#6b7280'}
              />
              <SummaryCell
                label="TRADES"
                value={`${summary.trade_count}`}
                color="#0f172a"
              />
              <SummaryCell
                label="DEVIATIONS"
                value={`${summary.deviation_count}`}
                color={summary.deviation_count > 0 ? '#ef4444' : '#10b981'}
              />
            </div>
          )}

          {/* ── Deviation Records ─── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
          }}>
            {records.length === 0 ? (
              <div style={{
                padding: '32px 24px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#64748b',
                fontWeight: 600,
              }}>
                No deviations detected — all trades compliant
              </div>
            ) : (
              records.map((record, idx) => (
                <DeviationRow key={record.id || idx} record={record} />
              )).reverse() // Show newest first
            )}
          </div>

          {/* ── Pending Footer ─── */}
          {summary && summary.pending_finalization > 0 && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#fefce8',
              borderTop: '1px solid #fef08a',
              fontSize: '10px',
              color: '#854d0e',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Clock size={12} />
              {summary.pending_finalization} deviation{summary.pending_finalization > 1 ? 's' : ''} awaiting position close for finalization
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────

function SummaryCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    }}>
      <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 900, color }}>
        {value}
      </div>
    </div>
  );
}

function DeviationRow({ record }: { record: DeviationRecord }) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = FAMILY_ICONS[record.deviation_family] || AlertTriangle;
  const severityColor = SEVERITY_COLORS[record.severity] || '#6b7280';
  const cost = record.finalized_cost ?? record.candidate_cost;
  const typeLabel = DEVIATION_TYPE_LABELS[record.deviation_type] || record.deviation_type;
  const ts = new Date(record.detected_at).toLocaleTimeString();

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        padding: '10px 16px',
        borderBottom: '1px solid #f8fafc',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        backgroundColor: expanded ? '#fafafa' : 'white',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconComponent size={14} color={severityColor} />
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: severityColor,
          }}>
            {typeLabel}
          </div>
          <div style={{
            fontSize: '9px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: severityColor + '15',
            color: severityColor,
            fontWeight: 800,
          }}>
            {record.severity}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {cost !== null && cost !== undefined && (
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: cost > 0 ? '#ef4444' : '#10b981',
            }}>
              {cost > 0 ? `-$${cost.toFixed(2)}` : '$0.00'}
            </span>
          )}
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            {ts}
          </span>
        </div>
      </div>

      {expanded && record.explainability_payload && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          fontSize: '10px',
          lineHeight: '1.5',
        }}>
          <div style={{ color: '#475569', fontWeight: 600 }}>
            {record.explainability_payload?.summary?.matched_vs_expected || 'No additional details.'}
          </div>
          {record.price_delta !== null && (
            <div style={{ marginTop: '6px', color: '#64748b' }}>
              <span style={{ fontWeight: 700 }}>Price Δ:</span> ${Math.abs(record.price_delta).toFixed(2)}
            </div>
          )}
          {record.explainability_payload?.cost_summary && (
            <div style={{ marginTop: '4px', color: '#64748b' }}>
              <span style={{ fontWeight: 700 }}>Costability:</span> {record.costability.replace(/_/g, ' ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

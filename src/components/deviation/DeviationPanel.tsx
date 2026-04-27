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
  onRecordClick?: (timestamp: number) => void;
}

// ─── Main Component ──────────────────────────────────────────────────

export function DeviationPanel({ summary, records, isActive, onRecordClick }: DeviationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isActive && records.length === 0) {
    return (
      <StatusPlaceholder 
        icon={Zap}
        title={`DEVIATION ENGINE INACTIVE`}
        subtitle={`Start a live session to begin the real-time cost-of-deviation analysis.`}
        style={{ 
          border: '1px solid var(--auth-border)', 
          borderRadius: '4px',
          padding: '40px 16px',
          minHeight: 'auto',
          backgroundColor: 'transparent'
        }}
      />
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--auth-black)',
      border: '1px solid var(--auth-border)',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1,
      minHeight: 0,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      {/* ── Header ─── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid var(--auth-border)',
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
            backgroundColor: isActive ? 'var(--auth-accent)' : 'var(--auth-text-muted)',
            animation: isActive ? 'pulse 1.5s infinite' : 'none',
            boxShadow: isActive ? '0 0 10px var(--auth-accent)' : 'none'
          }} />
          <span style={{
            fontSize: '10px',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.15em',
            fontFamily: "'Space Mono', monospace"
          }}>
            DEVIATION COST ENGINE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {summary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={12} color={summary.total_deviation_cost > 0 ? '#ef4444' : 'var(--auth-accent)'} />
              <span style={{
                fontSize: '12px',
                fontWeight: 900,
                color: summary.total_deviation_cost > 0 ? '#ef4444' : 'var(--auth-accent)',
                fontFamily: "'Space Mono', monospace"
              }}>
                {summary.total_deviation_cost > 0
                  ? `-$${summary.total_deviation_cost.toFixed(2)}`
                  : '$0.00'}
              </span>
            </div>
          )}
          {isExpanded
            ? <ChevronUp size={14} color="var(--auth-text-muted)" />
            : <ChevronDown size={14} color="var(--auth-text-muted)" />}
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
              backgroundColor: 'var(--auth-border)',
              borderBottom: '1px solid var(--auth-border)',
            }}>
              <SummaryCell
                label="COST"
                value={`$${summary.total_deviation_cost.toFixed(2)}`}
                color={summary.total_deviation_cost > 0 ? '#ef4444' : 'var(--auth-accent)'}
              />
              <SummaryCell
                label="UNAUTH GAIN"
                value={`$${summary.total_unauthorized_gain.toFixed(2)}`}
                color={summary.total_unauthorized_gain > 0 ? '#f97316' : 'var(--auth-text-muted)'}
              />
              <SummaryCell
                label="TRADES"
                value={`${summary.trade_count}`}
                color="#ffffff"
              />
              <SummaryCell
                label="DEVIATIONS"
                value={`${summary.deviation_count}`}
                color={summary.deviation_count > 0 ? '#ef4444' : 'var(--auth-accent)'}
              />
            </div>
          )}

          {/* ── Deviation Records ─── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'transparent'
          }}>
            {records.length === 0 ? (
              <div style={{
                padding: '32px 24px',
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--auth-text-muted)',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif"
              }}>
                No deviations detected — all trades compliant
              </div>
            ) : (
              records.map((record, idx) => (
                <DeviationRow 
                  key={record.id || idx} 
                  record={record} 
                  onClick={() => onRecordClick?.(new Date(record.detected_at).getTime() / 1000)}
                />
              )).reverse() // Show newest first
            )}
          </div>

          {/* ── Pending Footer ─── */}
          {summary && summary.pending_finalization > 0 && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(251, 191, 36, 0.05)',
              borderTop: '1px solid rgba(251, 191, 36, 0.1)',
              fontSize: '10px',
              color: '#fbbf24',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Space Mono', monospace"
            }}>
              <Clock size={12} />
              {summary.pending_finalization} DEVIATION{summary.pending_finalization > 1 ? 'S' : ''} AWAITING FINALIZATION
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
      backgroundColor: 'var(--auth-black)',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.05em', fontFamily: "'Space Mono', monospace" }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 900, color, fontFamily: "'Space Mono', monospace" }}>
        {value}
      </div>
    </div>
  );
}

function DeviationRow({ record, onClick }: { record: DeviationRecord; onClick: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = FAMILY_ICONS[record.deviation_family] || AlertTriangle;
  const severityColor = SEVERITY_COLORS[record.severity] || 'var(--auth-text-muted)';
  const cost = record.finalized_cost ?? record.candidate_cost;
  const typeLabel = DEVIATION_TYPE_LABELS[record.deviation_type] || record.deviation_type;
  const ts = new Date(record.detected_at).toLocaleTimeString([], { hour12: false });

  return (
    <div
      onClick={() => {
        setExpanded(!expanded);
        onClick();
      }}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--auth-border)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: expanded ? 'rgba(255,255,255,0.02)' : 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconComponent size={14} color={severityColor} />
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: "'Inter', sans-serif"
          }}>
            {typeLabel.toUpperCase()}
          </div>
          <div style={{
            fontSize: '8px',
            padding: '2px 6px',
            borderRadius: '2px',
            backgroundColor: severityColor + '20',
            color: severityColor,
            fontWeight: 900,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.05em'
          }}>
            {record.severity}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {cost !== null && cost !== undefined && (
            <span style={{
              fontSize: '11px',
              fontWeight: 900,
              color: cost > 0 ? '#ef4444' : 'var(--auth-accent)',
              fontFamily: "'Space Mono', monospace"
            }}>
              {cost > 0 ? `-$${cost.toFixed(2)}` : '$0.00'}
            </span>
          )}
          <span style={{ fontSize: '10px', color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace" }}>
            {ts}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--auth-border)',
          borderRadius: '4px',
          fontSize: '11px',
          lineHeight: '1.6',
          color: '#e2e8f0'
        }}>
          {record.ai_reasoning ? (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                 <Zap size={12} color="#818cf8" />
                 <span style={{ fontSize: '9px', fontWeight: 900, color: '#818cf8', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>AI SIGNAL REASONING</span>
              </div>
              {record.ai_reasoning === "GENERATING..." ? (
                <div style={{ 
                  color: '#818cf8', 
                  fontWeight: 700, 
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#818cf8', animation: 'pulse 1s infinite' }} />
                  Processing deviation logic...
                </div>
              ) : (
                <div style={{ color: '#ffffff', fontWeight: 500 }}>
                  {record.ai_reasoning}
                </div>
              )}
            </div>
          ) : null}

          <div style={{ color: 'var(--auth-text-muted)', fontWeight: 500 }}>
            {record.explainability_payload?.summary?.matched_vs_expected || 'No additional logic details.'}
          </div>
          {record.price_delta !== null && (
            <div style={{ marginTop: '8px', color: '#ffffff', fontSize: '10px' }}>
              <span style={{ fontWeight: 900, color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace" }}>PRICE Δ:</span> ${Math.abs(record.price_delta).toFixed(2)}
            </div>
          )}
          {record.explainability_payload?.cost_summary && (
            <div style={{ marginTop: '4px', color: '#ffffff', fontSize: '10px' }}>
              <span style={{ fontWeight: 900, color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace" }}>TYPE:</span> {record.costability.replace(/_/g, ' ').toUpperCase()}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

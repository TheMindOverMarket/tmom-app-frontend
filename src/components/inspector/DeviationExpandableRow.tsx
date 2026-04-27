import { FC, useState, memo } from 'react';
import { RuleEngineEvent } from '../../domain/ruleEngine/types';
import { sessionApi } from '../../domain/session/api';
import { Rule } from '../../domain/playbook/types';
import { RuleLogicTree } from '../playbook/RuleLogicTree';
import { Zap } from 'lucide-react';

interface DeviationExpandableRowProps {
  event: RuleEngineEvent;
  rules?: Rule[];
}

const formatDate = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatMs = (date: Date) => {
  return String(date.getMilliseconds()).padStart(3, '0');
};

export const DeviationExpandableRow: FC<DeviationExpandableRowProps> = memo(({ event, rules = [] }) => {
  const matchedRule = rules.find(r => r.name === event.rule || r.id === event.rule || r.id === (event.rawRule as any)?.rule_id || r.name === (event.rawRule as any)?.rule_name);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const date = new Date(event.msTimestamp);

  const iconColor = '#ef4444';
  const labelColor = '#ef4444';
  const tagBg = 'rgba(239, 68, 68, 0.1)';

  const handleExpand = async () => {
    if (!expanded && !reasoning && !loading) {
      setLoading(true);
      setError(null);
      try {
        const response = await sessionApi.explainDeviation(event.session_id, event);
        setReasoning(response.reasoning);
      } catch (err: any) {
        setError(err.message || 'Failed to load reasoning');
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div style={{ backgroundColor: 'transparent' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--auth-border)',
          fontSize: '12px',
          backgroundColor: expanded ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif"
        }}
        onClick={handleExpand}
      >
        {/* Time */}
        <div style={{ flex: '0 0 100px', color: 'var(--auth-text-muted)', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>
          {formatDate(date)}<span style={{ fontSize: '9px', opacity: 0.5 }}>.{formatMs(date)}</span>
        </div>

        {/* Type Icon */}
        <div style={{ flex: '0 0 30px', display: 'flex', justifyContent: 'center', fontSize: '12px' }}>
          <span title="Deviation" style={{ color: iconColor }}>{expanded ? '▼' : '▶'}</span>
        </div>

        {/* Action/Rule */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontWeight: 900,
              color: labelColor,
              backgroundColor: tagBg,
              padding: '2px 8px',
              borderRadius: '2px',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: "'Space Mono', monospace"
            }}>
              {event.deviation_type?.toUpperCase() || 'DEVIATION'}
            </span>
            <span style={{ color: 'var(--auth-text-muted)', fontSize: '9px', fontWeight: 900, fontFamily: "'Space Mono', monospace" }}>
              {event.action ? 'ORDER SENT' : 'NO-OP'}
            </span>
          </div>
          {matchedRule ? (
            <div style={{
              marginTop: '8px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              border: '1px solid var(--auth-border)',
              padding: '4px'
            }}>
              <RuleLogicTree rule={matchedRule} isDark={true} compact={true} />
            </div>
          ) : (
            <div style={{
              fontSize: '11px',
              color: '#ffffff',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '4px'
            }}>
              {typeof event.rule === 'string' ? event.rule.toUpperCase() : 'SYSTEM DEVIATION'}
            </div>
          )}
        </div>

        {/* Price */}
        <div style={{ flex: '0 0 90px', textAlign: 'right', fontWeight: 900, color: '#ffffff', fontFamily: "'Space Mono', monospace", fontSize: '13px' }}>
          ${event.price.toFixed(2)}
        </div>
      </div>

      {/* Expanded Reasoning Panel */}
      {expanded && (
        <div style={{
          padding: '16px 16px 20px 52px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          fontSize: '11px',
          color: '#e2e8f0',
          borderBottom: '1px solid var(--auth-border)',
          lineHeight: '1.6'
        }}>
          {(loading || (event.ai_reasoning === "GENERATING..." && !reasoning)) ? (
            <div style={{ color: '#fb923c', fontStyle: 'italic', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 700, fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid #f97316',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1.5s linear infinite'
              }} />
              ANALYZING DEVIATION LOGIC...
            </div>
          ) : error ? (
            <div style={{ color: '#ef4444', fontWeight: 900, fontFamily: "'Space Mono', monospace" }}>{error.toUpperCase()}</div>
          ) : (event.ai_reasoning || reasoning) ? (
            <div>
              <div style={{
                fontWeight: 900,
                marginBottom: '8px',
                color: '#818cf8',
                textTransform: 'uppercase',
                fontSize: '9px',
                letterSpacing: '0.15em',
                fontFamily: "'Space Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Zap size={12} color="#818cf8" />
                AI SIGNAL REASONING
                {event.ai_reasoning && <div style={{ fontSize: '8px', backgroundColor: '#818cf8', color: 'white', padding: '1px 6px', borderRadius: '2px', fontWeight: 900 }}>LIVE</div>}
              </div>
              <div style={{ color: '#ffffff', fontWeight: 500 }}>
                {event.ai_reasoning || reasoning}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});

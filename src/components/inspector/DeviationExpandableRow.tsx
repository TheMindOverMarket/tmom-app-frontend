import { FC, useState, memo } from 'react';
import { RuleEngineEvent } from '../../domain/ruleEngine/types';
import { sessionApi } from '../../domain/session/api';
import { Rule } from '../../domain/playbook/types';
import { RuleLogicTree } from '../playbook/RuleLogicTree';

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
  
  const bgColor = expanded ? 'rgba(234, 88, 12, 0.1)' : 'rgba(234, 88, 12, 0.05)';
  const iconColor = '#EA580C';
  const labelColor = '#fb923c';
  const tagBg = 'rgba(234, 88, 12, 0.15)';

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

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '12px',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: bgColor,
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  return (
    <div style={{ backgroundColor: 'transparent' }}>
      <div style={rowStyle} onClick={handleExpand}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ 
               fontWeight: 900, 
               color: labelColor,
               backgroundColor: tagBg,
               padding: '2px 8px',
               borderRadius: '4px',
               fontSize: '9px',
               textTransform: 'uppercase',
               letterSpacing: '0.1em',
               fontFamily: "'Space Mono', monospace"
             }}>
               {event.deviation_type || 'Deviation'}
             </span>
             <span style={{ color: 'var(--auth-text-muted)', fontSize: '10px', fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
               {event.action ? 'ACT' : 'NO-OP'}
             </span>
          </div>
        {matchedRule ? (
          <div style={{ 
            marginTop: '12px', 
            marginBottom: '4px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '4px'
          }}>
            <RuleLogicTree rule={matchedRule} isDark={true} />
          </div>
        ) : (
          <div style={{ 
            fontSize: '11px', 
            color: '#e2e8f0', 
            fontWeight: 500,
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            marginTop: '4px'
          }}>
            {typeof event.rule === 'string' ? event.rule : JSON.stringify(event.rawRule || event.rule)}
          </div>
        )}
        </div>

        {/* Price */}
        <div style={{ flex: '0 0 80px', textAlign: 'right', fontWeight: 900, color: '#ffffff', fontFamily: "'Space Mono', monospace" }}>
          ${event.price.toFixed(2)}
        </div>
      </div>

      {/* Expanded Reasoning Panel */}
      {expanded && (
        <div style={{ 
          padding: '16px 16px 20px 52px', 
          backgroundColor: 'rgba(234, 88, 12, 0.08)', 
          fontSize: '12px',
          color: '#e2e8f0',
          borderTop: '1px solid rgba(234, 88, 12, 0.2)',
          lineHeight: '1.6'
        }}>
          { (loading || event.ai_reasoning === "GENERATING...") ? (
            <div style={{ color: '#fb923c', fontStyle: 'italic', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 700, fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                border: '2px solid #EA580C', 
                borderTopColor: 'transparent', 
                borderRadius: '50%', 
                animation: 'spin 1.5s linear infinite' 
              }} />
              ANALYZING DEVIATION LOGIC...
            </div>
          ) : error ? (
            <div style={{ color: '#ef4444', fontWeight: 700 }}>{error}</div>
          ) : (event.ai_reasoning || reasoning) ? (
            <div>
              <div style={{ 
                fontWeight: 900, 
                marginBottom: '8px', 
                color: '#fb923c', 
                textTransform: 'uppercase', 
                fontSize: '9px', 
                letterSpacing: '0.15em',
                fontFamily: "'Space Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#fb923c' }} />
                AI REASONING
                {event.ai_reasoning && <div style={{ fontSize: '8px', backgroundColor: '#EA580C', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: 900 }}>LIVE</div>}
              </div>
              <div style={{ opacity: 0.9 }}>
                {event.ai_reasoning || reasoning}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});

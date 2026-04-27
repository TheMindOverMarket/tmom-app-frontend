import { FC, memo } from 'react';
import { RuleEngineEvent } from '../../domain/ruleEngine/types';
import { Rule } from '../../domain/playbook/types';
import { RuleLogicTree } from '../playbook/RuleLogicTree';

interface EventRowProps {
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

export const EventRow: FC<EventRowProps> = memo(({ event, rules = [] }) => {
  const matchedRule = rules.find(r => r.name === event.rule || r.id === event.rule || r.id === (event.rawRule as any)?.rule_id || r.name === (event.rawRule as any)?.rule_name);
  const date = new Date(event.msTimestamp);
  
  const iconColor = event.deviation ? '#ef4444' : 'var(--auth-accent)';
  const labelColor = event.deviation ? '#ef4444' : 'var(--auth-accent)';
  const tagBg = event.deviation ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid var(--auth-border)',
      fontSize: '12px',
      backgroundColor: 'transparent',
      transition: 'background-color 0.2s',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Time */}
      <div style={{ flex: '0 0 100px', color: 'var(--auth-text-muted)', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>
        {formatDate(date)}<span style={{ fontSize: '9px', opacity: 0.5 }}>.{formatMs(date)}</span>
      </div>

      {/* Type Icon */}
      <div style={{ flex: '0 0 30px', display: 'flex', justifyContent: 'center', fontSize: '12px' }}>
        {event.deviation ? (
          <span title="Deviation" style={{ color: iconColor }}>▼</span>
        ) : (
          <span title="Adherence" style={{ color: iconColor }}>▲</span>
        )}
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
             {event.deviation ? 'DEVIATION' : 'ADHERENCE'}
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
            {typeof event.rule === 'string' ? event.rule.toUpperCase() : 'SYSTEM EVENT'}
          </div>
        )}
      </div>

      {/* Price */}
      <div style={{ flex: '0 0 90px', textAlign: 'right', fontWeight: 900, color: '#ffffff', fontFamily: "'Space Mono', monospace", fontSize: '13px' }}>
        ${event.price.toFixed(2)}
      </div>
    </div>
  );
});

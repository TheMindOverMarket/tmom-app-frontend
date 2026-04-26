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
  
  const bgColor = event.deviation ? '#FFF7ED' : '#EFF6FF';
  const iconColor = event.deviation ? '#EA580C' : '#2563EB';
  const labelColor = event.deviation ? '#9A3412' : '#1E40AF';
  const tagBg = event.deviation ? '#FFEDD5' : '#DBEAFE';

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #f0f3fa',
    fontSize: '13px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    backgroundColor: bgColor,
    transition: 'background-color 0.2s',
  };

  return (
    <div style={rowStyle}>
      {/* Time */}
      <div style={{ flex: '0 0 100px', color: '#6B7280', fontSize: '12px' }}>
        {formatDate(date)}<span style={{ fontSize: '10px', opacity: 0.7 }}>.{formatMs(date)}</span>
      </div>

      {/* Type Icon */}
      <div style={{ flex: '0 0 30px', display: 'flex', justifyContent: 'center', fontSize: '14px' }}>
        {event.deviation ? (
          <span title="Deviation" style={{ color: iconColor }}>▼</span>
        ) : (
          <span title="Adherence" style={{ color: iconColor }}>▲</span>
        )}
      </div>

      {/* Action/Rule */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <span style={{ 
             fontWeight: 600, 
             color: labelColor,
             backgroundColor: tagBg,
             padding: '1px 6px',
             borderRadius: '4px',
             fontSize: '11px',
             textTransform: 'uppercase',
             letterSpacing: '0.02em'
           }}>
             {event.deviation ? 'Deviation' : 'Adherence'}
           </span>
           <span style={{ color: '#6B7280', fontSize: '12px' }}>
             {event.action ? 'ACT' : 'NO-OP'}
           </span>
        </div>
        {matchedRule ? (
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117.6%', marginTop: '4px', marginBottom: '-16px' }}>
            <RuleLogicTree rule={matchedRule} isDark={false} />
          </div>
        ) : (
          <div style={{ 
            fontSize: '11px', 
            color: '#4B5563', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}>
            {typeof event.rule === 'string' ? event.rule : JSON.stringify(event.rawRule || event.rule)}
          </div>
        )}
      </div>

      {/* Price */}
      <div style={{ flex: '0 0 80px', textAlign: 'right', fontWeight: 500, color: '#111827' }}>
        {event.price.toFixed(2)}
      </div>
    </div>
  );
});

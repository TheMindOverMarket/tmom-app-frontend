import { FC, useState, memo } from 'react';
import { RuleEngineEvent } from '../../domain/ruleEngine/types';
import { sessionApi } from '../../domain/session/api';

interface DeviationExpandableRowProps {
  event: RuleEngineEvent;
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

export const DeviationExpandableRow: FC<DeviationExpandableRowProps> = memo(({ event }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const date = new Date(event.msTimestamp);
  
  const bgColor = expanded ? '#FFEDD5' : '#FFF7ED';
  const iconColor = '#EA580C';
  const labelColor = '#9A3412';
  const tagBg = '#FFEDD5';

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
    padding: '8px 12px',
    borderBottom: expanded ? 'none' : '1px solid #f0f3fa',
    fontSize: '13px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    backgroundColor: bgColor,
    transition: 'background-color 0.2s',
    cursor: 'pointer'
  };

  return (
    <div style={{ borderBottom: '1px solid #f0f3fa', backgroundColor: '#FFF7ED' }}>
      <div style={rowStyle} onClick={handleExpand}>
        {/* Time */}
        <div style={{ flex: '0 0 100px', color: '#6B7280', fontSize: '12px' }}>
          {formatDate(date)}<span style={{ fontSize: '10px', opacity: 0.7 }}>.{formatMs(date)}</span>
        </div>

        {/* Type Icon */}
        <div style={{ flex: '0 0 30px', display: 'flex', justifyContent: 'center', fontSize: '14px' }}>
          <span title="Deviation" style={{ color: iconColor }}>{expanded ? '▼' : '▶'}</span>
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
               Deviation
             </span>
             <span style={{ color: '#6B7280', fontSize: '12px' }}>
               {event.action ? 'ACT' : 'NO-OP'}
             </span>
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#4B5563', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}>
            {typeof event.rule === 'string' ? event.rule : JSON.stringify(event.rawRule || event.rule)}
          </div>
        </div>

        {/* Price */}
        <div style={{ flex: '0 0 80px', textAlign: 'right', fontWeight: 500, color: '#111827' }}>
          {event.price.toFixed(2)}
        </div>
      </div>

      {/* Expanded Reasoning Panel */}
      {expanded && (
        <div style={{ 
          padding: '12px 12px 16px 42px', 
          backgroundColor: '#FFF7ED', 
          fontSize: '13px',
          color: '#431407',
          borderTop: '1px dashed #FDBA74'
        }}>
          {loading ? (
            <div style={{ color: '#9A3412', fontStyle: 'italic', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', border: '2px solid #EA580C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Generating reasoning...
            </div>
          ) : error ? (
            <div style={{ color: '#DC2626' }}>{error}</div>
          ) : reasoning ? (
            <div style={{ lineHeight: '1.5' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', color: '#9A3412', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>AI Reasoning</div>
              {reasoning}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});

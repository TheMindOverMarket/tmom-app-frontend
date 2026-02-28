import { FC } from 'react';
import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { EventRow } from './inspector/EventRow';
import { useRuleEventFilter } from '../hooks/useRuleEventFilter';
import { InspectorHeader } from './inspector/InspectorHeader';

interface RuleEventInspectorProps {
  events: RuleEngineEvent[];
  focusedTimestamp: number | null; 
  filterType?: 'adherence' | 'deviation' | null;
  onClearFocus: () => void;
}

const formatHeaderDate = (ts: number) => {
  return new Date(ts * 1000).toLocaleString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

export const RuleEventInspector: FC<RuleEventInspectorProps> = ({ 
  events, 
  focusedTimestamp,
  filterType,
  onClearFocus 
}) => {
  const visibleEvents = useRuleEventFilter(events, focusedTimestamp, filterType);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    }}>
      <InspectorHeader 
        focusedTimestamp={focusedTimestamp}
        filterType={filterType}
        onClearFocus={onClearFocus}
      />

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {visibleEvents.length === 0 ? (
           <div style={{ 
             padding: '32px', 
             textAlign: 'center', 
             color: '#6B7280', 
             fontSize: '13px',
             display: 'flex',
             flexDirection: 'column',
             gap: '8px'
           }}>
              {focusedTimestamp ? (
                <>
                  <span style={{ fontWeight: 500 }}>No events found for {formatHeaderDate(focusedTimestamp)}</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Try selecting a different marker.</span>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 500 }}>Waiting for rule events...</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Events will appear here in real-time.</span>
                </>
              )}
           </div>
        ) : (
           visibleEvents.map(evt => <EventRow key={evt.id} event={evt} />)
        )}
      </div>
    </div>
  );
};


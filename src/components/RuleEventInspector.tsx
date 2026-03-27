import { FC } from 'react';
import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { EventRow } from './inspector/EventRow';
import { useRuleEventFilter } from '../hooks/useRuleEventFilter';
import { InspectorHeader } from './inspector/InspectorHeader';
import { StatusPlaceholder } from './common/StatusPlaceholder';
import { Shield, Activity, Search } from 'lucide-react';

interface RuleEventInspectorProps {
  events: RuleEngineEvent[];
  focusedTimestamp: number | null; 
  isActive: boolean;
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
  isActive,
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
        isActive={isActive}
        filterType={filterType}
        onClearFocus={onClearFocus}
      />

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {visibleEvents.length === 0 ? (
          focusedTimestamp ? (
            <StatusPlaceholder 
              icon={Search}
              title={`NO EVENTS FOUND`}
              subtitle={`No events recorded for ${formatHeaderDate(focusedTimestamp)}. Try selecting a different timeframe on the chart.`}
            />
          ) : !isActive ? (
            <StatusPlaceholder 
              icon={Shield}
              title={`SUPERVISION INACTIVE`}
              subtitle={`Start a live session to begin the real-time monitoring of your playbook execution.`}
            />
          ) : (
            <StatusPlaceholder 
              icon={Activity}
              title={`WAITING FOR FEED...`}
              subtitle={`Events will appear here as they are processed by the Rule Engine in real-time.`}
            />
          )
        ) : (
           visibleEvents.map(evt => <EventRow key={evt.id} event={evt} />)
        )}
      </div>
    </div>
  );
};


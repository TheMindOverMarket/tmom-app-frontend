import { FC, useState } from 'react';
import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { EventRow } from './inspector/EventRow';
import { DeviationExpandableRow } from './inspector/DeviationExpandableRow';
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
  const [activeTab, setActiveTab] = useState<'feed' | 'deviations'>('deviations');
  const visibleEvents = useRuleEventFilter(events, focusedTimestamp, filterType);

  const renderedEvents = activeTab === 'deviations' 
    ? visibleEvents.filter(e => e.deviation) 
    : visibleEvents;

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      flex: 1.5,
      minHeight: 0,
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

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <button 
          onClick={() => setActiveTab('feed')}
          style={{ 
            flex: 1, padding: '10px 0', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'feed' ? '2px solid #2563EB' : '2px solid transparent',
            color: activeTab === 'feed' ? '#2563EB' : '#6B7280'
          }}
        >
          LIVE FEED
        </button>
        <button 
          onClick={() => setActiveTab('deviations')}
          style={{ 
            flex: 1, padding: '10px 0', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'deviations' ? '2px solid #EA580C' : '2px solid transparent',
            color: activeTab === 'deviations' ? '#EA580C' : '#6B7280'
          }}
        >
          DEVIATIONS
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {renderedEvents.length === 0 ? (
          focusedTimestamp ? (
            <StatusPlaceholder 
              icon={Search}
              title={`NO EVENTS FOUND`}
              subtitle={`No events recorded for ${formatHeaderDate(focusedTimestamp)}.`}
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
              title={activeTab === 'deviations' ? 'NO DEVIATIONS YET' : 'WAITING FOR FEED...'}
              subtitle={activeTab === 'deviations' ? 'Algorithm is perfectly tracking constraints.' : 'Events will appear here as they are processed by the Rule Engine in real-time.'}
            />
          )
        ) : (
           renderedEvents.map(evt => 
             activeTab === 'deviations' 
              ? <DeviationExpandableRow key={evt.id} event={evt} /> 
              : <EventRow key={evt.id} event={evt} />
           )
        )}
      </div>
    </div>
  );
};


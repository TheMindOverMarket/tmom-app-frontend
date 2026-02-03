import React, { FC, useRef } from 'react';
import { RuleEngineEvent } from '../domain/ruleEngine/types';

interface RuleEventInspectorProps {
  events: RuleEngineEvent[];
  focusedTimestamp: number | null; // Unix timestamp (frames/candles usually minutely)
  filterType?: 'adherence' | 'deviation' | null;
  onClearFocus: () => void;
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

const EventRow: FC<{ event: RuleEngineEvent }> = React.memo(({ event }) => {
  const date = new Date(event.msTimestamp);
  
  // Color Palette (User Req: Adherence = Blue, Deviation = Orange)
  // Adherence: Bg = Blue-50 (#EFF6FF), Text = Blue-800 (#1E40AF), Icon = Blue-600 (#2563EB)
  // Deviation: Bg = Orange-50 (#FFF7ED), Text = Orange-800 (#9A3412), Icon = Orange-600 (#EA580C)

  const bgColor = event.deviation ? '#FFF7ED' : '#EFF6FF';
  const iconColor = event.deviation ? '#EA580C' : '#2563EB';
  const labelColor = event.deviation ? '#9A3412' : '#1E40AF';
  const tagBg = event.deviation ? '#FFEDD5' : '#DBEAFE'; // Slightly darker for tag

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
          <span title="Deviation" style={{ color: iconColor }}>▼</span> // Down Arrow
        ) : (
          <span title="Adherence" style={{ color: iconColor }}>▲</span> // Up Arrow
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
  );
});

export const RuleEventInspector: FC<RuleEventInspectorProps> = ({ 
  events, 
  focusedTimestamp,
  filterType,
  onClearFocus 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter events if focused
  const visibleEvents = React.useMemo(() => {
    if (focusedTimestamp === null) {
      // Live mode: Show all, newest first
      return [...events].reverse();
    }
    
    // Filtered mode: Show events in that minute
    // Events have 'timestamp' in Unix Seconds.
    // We assume focusedTimestamp is also Unix Seconds (snapped to minute start typically)
    const start = Math.floor(focusedTimestamp / 60) * 60;
    const end = start + 60;
    
    return events.filter(e => {
        const t = e.timestamp; // unix seconds
        const inRange = t >= start && t < end;
        
        // Apply Type Filter if present
        if (!inRange) return false;
        if (filterType === 'adherence' && e.deviation) return false;
        if (filterType === 'deviation' && !e.deviation) return false;
        
        return true;
    }).sort((a, b) => b.msTimestamp - a.msTimestamp); // Newest first within the group
  }, [events, focusedTimestamp, filterType]);

  // Scroll to top on new events if in live mode (user might have scrolled down)
  // Actually, standard behavior for "log" is often stick-to-bottom or new-at-top.
  // We are doing new-at-top.
  
  // Helper for header date
  const formatHeaderDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                Rule Engine
            </span>
            
            {/* Divider */}
            <span style={{ color: '#D1D5DB' }}>|</span>

            {focusedTimestamp !== null ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 6px', 
                      backgroundColor: '#FEF3C7', 
                      color: '#92400E', 
                      borderRadius: '4px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                  }}>
                      History
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                    {formatHeaderDate(focusedTimestamp)}
                  </span>
                  
                  {/* Filter Chip */}
                  {filterType && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: filterType === 'deviation' ? '#FFF7ED' : '#EFF6FF',
                      color: filterType === 'deviation' ? '#C2410C' : '#1D4ED8',
                      border: `1px solid ${filterType === 'deviation' ? '#FDBA74' : '#93C5FD'}`,
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginLeft: '4px'
                    }}>
                      Viewing: {filterType}
                    </span>
                  )}
               </div>
            ) : (
                <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 6px', 
                    backgroundColor: '#D1FAE5', 
                    color: '#065F46', 
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textTransform: 'uppercase'
                }}>
                   <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
                   Live Stream
                </span>
            )}
        </div>

        {focusedTimestamp !== null && (
          <button 
            onClick={onClearFocus}
            style={{
                fontSize: '12px',
                color: '#2563EB',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
                fontWeight: 500
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ← Back to Live
          </button>
        )}
      </div>

      {/* List */}
      <div 
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      >
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

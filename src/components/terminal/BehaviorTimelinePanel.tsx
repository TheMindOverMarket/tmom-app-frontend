import React, { FC } from 'react';
import { useBehaviorTimeline } from '../../hooks/useBehaviorTimeline';
import { BehaviorTimelineItem, TimelineColor } from '../../domain/behavior/behaviorTimeline';

interface BehaviorTimelinePanelProps {
  symbol: string;
}

// Colors derived from PriceChart and standard "premium" palette
const timelineColors: Record<TimelineColor, string> = {
  gray: '#6B7280',    // Dim gray
  yellow: '#F59E0B',  // Amber/Yellow
  orange: '#F97316',  // Orange
  red: '#EF4444',     // Red
};

const TimelineRow: FC<{ item: BehaviorTimelineItem }> = ({ item }) => {
  const timeLabel = new Date(item.timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #f0f3fa', // Matches chart grid
    fontSize: '13px',
    fontFamily: 'monospace', // Terminal vibe
    backgroundColor: '#fff',
  };

  const iconColor = timelineColors[item.color] || timelineColors.gray;

  const iconStyle: React.CSSProperties = {
    marginRight: '12px',
    color: iconColor,
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center',
    fontSize: '14px',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    marginRight: '12px',
    color: '#111827', // Dark text
    minWidth: '140px', // Align columns somewhat
  };

  const descStyle: React.CSSProperties = {
    flex: 1,
    color: '#4B5563', // Gray-600
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginRight: '12px',
  };

  const timeStyle: React.CSSProperties = {
    color: '#9CA3AF', // Gray-400
    fontSize: '12px',
    marginLeft: 'auto',
    fontVariantNumeric: 'tabular-nums',
  };

  // Icons
  let iconChar = 'ℹ';
  if (item.icon === 'warning') iconChar = '⚠';
  if (item.icon === 'error') iconChar = '!';
  if (item.icon === 'check') iconChar = '✓';

  return (
    <div style={rowStyle}>
      <span style={iconStyle} title={item.severity}>
        {iconChar}
      </span>
      <span style={labelStyle}>{item.label}</span>
      <span style={descStyle} title={item.description}>
        {item.description}
      </span>
      <span style={timeStyle}>{timeLabel}</span>
    </div>
  );
};

export const BehaviorTimelinePanel: FC<BehaviorTimelinePanelProps> = ({ symbol }) => {
  const { timeline, adherenceScore } = useBehaviorTimeline(symbol);

  // Newest events first
  const displayTimeline = [...timeline].reverse();

  // Score color
  let scoreColor = '#EF4444'; // Red
  if (adherenceScore >= 80) scoreColor = '#10B981'; // Green
  else if (adherenceScore >= 50) scoreColor = '#F59E0B'; // Yellow

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb', // Gray-50
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '14px',
    color: '#374151',
  };

  const scoreLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B7280',
  };

  const scoreValueStyle: React.CSSProperties = {
    fontWeight: 700,
    color: scoreColor,
    marginLeft: '8px',
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const emptyStyle: React.CSSProperties = {
    padding: '24px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Behavioral Feed • {symbol}</span>
        <div style={scoreLabelStyle}>
          Adherence Score:
          <span style={scoreValueStyle}>{adherenceScore}/100</span>
        </div>
      </div>

      <div style={listStyle}>
        {displayTimeline.length === 0 ? (
          <div style={emptyStyle}>
            No behavioral events recorded yet.
          </div>
        ) : (
          displayTimeline.map((item) => (
            <TimelineRow key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

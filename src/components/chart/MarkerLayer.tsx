import { MarkerData } from './types';

interface MarkerLayerProps {
  markers: MarkerData[];
  onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
  selectedTimestamp?: number | null;
}

export function MarkerLayer({ markers, onMarkerClick, selectedTimestamp }: MarkerLayerProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      {markers.map(m => {
          const isDeviation = m.type === 'deviation';
          const color = isDeviation ? 'var(--danger)' : 'var(--auth-accent)';
          const icon = isDeviation ? '▼' : '▲';
          const isSelected = selectedTimestamp && Math.floor(m.timestamp / 60) * 60 === Math.floor(selectedTimestamp / 60) * 60;
          const yTransform = isDeviation ? 'calc(-100% - 14px)' : '14px';

          return (
              <div
                  key={m.id}
                  onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick(m.timestamp, m.type);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = `translateX(-50%) translateY(${yTransform}) scale(1.3)`}
                  onMouseLeave={(e) => e.currentTarget.style.transform = `translateX(-50%) translateY(${yTransform}) scale(${isSelected ? 1.4 : 1.0})`}
                  style={{
                      position: 'absolute',
                      left: m.x,
                      top: m.y,
                      transform: `translateX(-50%) translateY(${yTransform}) scale(${isSelected ? 1.4 : 1.0})`, // Dynamic Transform
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: isSelected ? 60 : 50,
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: 900,
                      color: color,
                      filter: isSelected 
                        ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 2px white)` 
                        : 'drop-shadow(0 0 1px white) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      transition: 'all 0.2s ease', 
                      animation: isSelected ? 'markerPulse 1.5s infinite' : 'none',
                  }}
              >
                  <style>{`
                    @keyframes markerPulse {
                      0% { filter: drop-shadow(0 0 5px ${color}) scale(1.4); }
                      50% { filter: drop-shadow(0 0 20px ${color}) drop-shadow(0 0 2px white) scale(1.6); }
                      100% { filter: drop-shadow(0 0 5px ${color}) scale(1.4); }
                    }
                  `}</style>
                  {icon}
              </div>
          );
      })}
    </div>
  );
}

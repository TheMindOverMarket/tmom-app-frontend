import { MarkerData } from './types';

interface MarkerLayerProps {
  markers: MarkerData[];
  onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
}

export function MarkerLayer({ markers, onMarkerClick }: MarkerLayerProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      {markers.map(m => {
          const isDeviation = m.type === 'deviation';
          const color = isDeviation ? 'var(--danger)' : 'var(--success)';
          const icon = isDeviation ? '▼' : '▲';
          
          const yTransform = isDeviation ? 'calc(-100% - 14px)' : '14px';

          return (
              <div
                  key={m.id}
                  onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick(m.timestamp, m.type);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = `translateX(-50%) translateY(${yTransform}) scale(1.3)`}
                  onMouseLeave={(e) => e.currentTarget.style.transform = `translateX(-50%) translateY(${yTransform}) scale(1.0)`}
                  style={{
                      position: 'absolute',
                      left: m.x,
                      top: m.y,
                      transform: `translateX(-50%) translateY(${yTransform})`, // Dynamic Transform
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: 50,
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: 900,
                      color: color,
                      filter: 'drop-shadow(0 0 1px white) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      transition: 'transform 0.1s ease', 
                  }}
              >
                  {icon}
              </div>
          );
      })}
    </div>
  );
}

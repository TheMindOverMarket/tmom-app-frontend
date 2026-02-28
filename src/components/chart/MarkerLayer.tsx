import { MarkerData } from './types';

interface MarkerLayerProps {
  markers: MarkerData[];
  onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
}

export function MarkerLayer({ markers, onMarkerClick }: MarkerLayerProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {markers.map(m => {
          const isDeviation = m.type === 'deviation';
          const color = isDeviation ? '#F97316' : '#3B82F6';
          const icon = isDeviation ? '▼' : '▲';
          
          const yTransform = isDeviation ? 'calc(-100% - 12px)' : '12px';

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
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: color,
                      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))',
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

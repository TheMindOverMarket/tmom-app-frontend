import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { usePriceChart } from '../hooks/usePriceChart';
import { MarkerLayer } from './chart/MarkerLayer';
import { ChartControls } from './chart/ChartControls';
import { ChartLegend } from './chart/ChartLegend';

interface PriceChartProps {
  events: RuleEngineEvent[];
  onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
}

export function PriceChart({ events, onMarkerClick }: PriceChartProps) {
  const {
    chartContainerRef,
    isMockData,
    deduplicateEvents,
    setDeduplicateEvents,
    markers
  } = usePriceChart('BTC/USD', 60, events);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, flex: 1 }}>
      <div 
        ref={chartContainerRef} 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
      />
      
      <MarkerLayer 
        markers={markers} 
        onMarkerClick={onMarkerClick} 
      />
     
      <ChartControls 
        deduplicateEvents={deduplicateEvents} 
        onToggle={() => setDeduplicateEvents(!deduplicateEvents)} 
      />

      <ChartLegend isMockData={isMockData} />
    </div>
  );
}


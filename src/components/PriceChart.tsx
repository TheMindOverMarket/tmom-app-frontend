import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { usePriceChart } from '../hooks/usePriceChart';
import { useMarketData } from '../hooks/useMarketData';
import { useDerivedSignals } from '../hooks/useDerivedSignals';
import { MarkerLayer } from './chart/MarkerLayer';
import { ChartControls } from './chart/ChartControls';
import { ChartLegend } from './chart/ChartLegend';

interface PriceChartProps {
  events: RuleEngineEvent[];
  symbol: string;
  onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
}

export function PriceChart({ events, symbol, onMarkerClick }: PriceChartProps) {
  const { candles, currentCandle, isMockData } = useMarketData(symbol, 60);
  const { ema9, currentEMA9 } = useDerivedSignals(candles, currentCandle);

  const {
    chartContainerRef,
    deduplicateEvents,
    setDeduplicateEvents,
    markers
  } = usePriceChart(events, candles, currentCandle, ema9, currentEMA9, isMockData);

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

      <ChartLegend isMockData={isMockData} symbol={symbol} />
    </div>
  );
}

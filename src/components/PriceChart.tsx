import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts';
import { useMarketData } from '../hooks/useMarketData';
import { useDerivedSignals } from '../hooks/useDerivedSignals';
import { RuleEngineEvent } from '../domain/ruleEngine/types';

interface MarkerData {
    id: string;
    x: number;
    y: number;
    timestamp: number;
    type: 'adherence' | 'deviation';
 }
 
 interface PriceChartProps {
   events: RuleEngineEvent[];
   onMarkerClick: (timestamp: number, type?: 'adherence' | 'deviation') => void;
 }
 
 export function PriceChart({ events, onMarkerClick }: PriceChartProps) {
   const chartContainerRef = useRef<HTMLDivElement>(null);
   const chartRef = useRef<IChartApi | null>(null);
   const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
   const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
 
   // Use Canonical Market Data Hook
   const { candles, currentCandle, isMockData } = useMarketData('BTC/USD', 60);
   
   // Use Derived Signals (EMA-9)
   const { ema9, currentEMA9 } = useDerivedSignals(candles, currentCandle);
 
   // User Toggle for Deduplication
   const [deduplicateEvents, setDeduplicateEvents] = useState(true);
 
   // Marker State for React Rendering
   const [markers, setMarkers] = useState<MarkerData[]>([]);
 
   // Data Refs to prevent Effect churn
   const dataRef = useRef({ 
     candles,
     currentCandle,
     events, 
     deduplicateEvents 
   });
 
   useEffect(() => {
     dataRef.current = { candles, currentCandle, events, deduplicateEvents };
   }, [candles, currentCandle, events, deduplicateEvents]);
 
   // Initialize Chart
   useEffect(() => {
     if (!chartContainerRef.current) return;
 
     const chart = createChart(chartContainerRef.current, {
       layout: {
         background: { color: '#ffffff' },
         textColor: '#333',
       },
       grid: {
         vertLines: { color: '#f0f3fa' },
         horzLines: { color: '#f0f3fa' },
       },
       width: chartContainerRef.current.clientWidth,
       height: chartContainerRef.current.clientHeight || 400,
       timeScale: {
         timeVisible: true,
         secondsVisible: false,
       },
     });
     chartRef.current = chart;
 
     // Candlestick Series
     const series = chart.addSeries(CandlestickSeries, {
       upColor: '#26a69a',
       downColor: '#ef5350',
       borderVisible: false,
       wickUpColor: '#26a69a',
       wickDownColor: '#ef5350',
     });
     seriesRef.current = series;
     
     // EMA-9 Series
     const emaSeries = chart.addSeries(LineSeries, {
       color: '#2962FF',
       lineWidth: 2,
       crosshairMarkerVisible: false, // Cleaner look
       lastValueVisible: false, // Don't clutter the axis
       priceLineVisible: false,
     });
     emaSeriesRef.current = emaSeries;
     
     chart.timeScale().fitContent();
 
     const handleResize = () => {
       if (chartContainerRef.current && chartRef.current) {
         chartRef.current.applyOptions({
           width: chartContainerRef.current.clientWidth,
           height: chartContainerRef.current.clientHeight || 400,
         });
       }
     };
 
     const resizeObserver = new ResizeObserver(handleResize);
     resizeObserver.observe(chartContainerRef.current);
 
     return () => {
       resizeObserver.disconnect();
       if (chartRef.current) {
         chartRef.current.remove();
         chartRef.current = null;
       }
     };
   }, []);
 
   // Update Data: Initial Load & History
   useEffect(() => {
     if (seriesRef.current && candles.length > 0) {
       seriesRef.current.setData(candles);
       chartRef.current?.timeScale().fitContent();
     }
   }, [candles]);
 
   // Update Data: Derived Signals (EMA)
   useEffect(() => {
     if (emaSeriesRef.current && ema9.length > 0) {
       emaSeriesRef.current.setData(ema9);
     }
   }, [ema9]);
 
   // Update Data: Live Updates
   useEffect(() => {
     if (seriesRef.current && currentCandle) {
       seriesRef.current.update(currentCandle);
     }
     
     if (emaSeriesRef.current && currentEMA9) {
       emaSeriesRef.current.update(currentEMA9);
     }
   }, [currentCandle, currentEMA9]);
 
   // Marker Overlay Logic (Calculates positions, updates State)
   const updateMarkersOverlay = () => {
     if (!chartRef.current || !seriesRef.current) return;
 
     const { 
         events: refEvents, 
         candles: refCandles, 
         currentCandle: refCurrentCandle, 
     } = dataRef.current;
     
     const chart = chartRef.current;
     const series = seriesRef.current;
     const timeScale = chart.timeScale();
     const width = chartContainerRef.current?.clientWidth || 0;
 
     const newMarkers: MarkerData[] = [];
 
     // 1. Group events by Snapped Timestamp (1m buckets) if deduplicating
     const groupedEvents = new Map<number, RuleEngineEvent[]>();
     
     if (dataRef.current.deduplicateEvents) {
         refEvents.forEach(event => {
            const snappedTime = Math.floor(event.timestamp / 60) * 60;
            if (!groupedEvents.has(snappedTime)) {
               groupedEvents.set(snappedTime, []);
            }
            groupedEvents.get(snappedTime)?.push(event);
         });

         // 2. Process each Group
         groupedEvents.forEach((groupEvents, snappedTime) => {
            const time = snappedTime as Time;
            const x = timeScale.timeToCoordinate(time);
            if (x === null || x < 0 || x > width) return;

            let candle = refCandles.find(c => Number(c.time) === snappedTime) || 
                         (refCurrentCandle && Number(refCurrentCandle.time) === snappedTime ? refCurrentCandle : undefined);

            const hasDeviation = groupEvents.some(e => e.deviation);
            const hasAdherence = groupEvents.some(e => !e.deviation);
            
            const getY = (isDeviation: boolean): number | null => {
                const evt = groupEvents.find(e => e.deviation === isDeviation);
                if (evt) return series.priceToCoordinate(evt.price);
                if (candle) return series.priceToCoordinate(isDeviation ? candle.high : candle.low);
                return null;
            };

            if (hasDeviation) {
                const y = getY(true);
                if (y !== null) {
                    newMarkers.push({ id: `${snappedTime}-dev`, timestamp: snappedTime, type: 'deviation', x, y });
                }
            }
            if (hasAdherence) {
                const y = getY(false);
                if (y !== null) {
                    newMarkers.push({ id: `${snappedTime}-adh`, timestamp: snappedTime, type: 'adherence', x, y });
                }
            }
         });
     } else {
         // Debug Mode: Show every individual event
         refEvents.forEach(evt => {
            // Find its X coordinate using the snapped time mapping
            const snappedTime = Math.floor(evt.timestamp / 60) * 60;
            const time = snappedTime as Time;
            const x = timeScale.timeToCoordinate(time);
            if (x === null || x < 0 || x > width) return;

            const y = series.priceToCoordinate(evt.price);
            if (y === null) return;

            newMarkers.push({ 
                id: evt.id, // Ensure unique event ID
                timestamp: evt.timestamp, 
                type: evt.deviation ? 'deviation' : 'adherence', 
                x, 
                y 
            });
         });
     }

     setMarkers(newMarkers);
   };
 
   // Subscribe to chart updates (Scrolling/Zooming)
   useEffect(() => {
     if (!chartRef.current) return;
     
     const timeScale = chartRef.current.timeScale();
     
     // Throttled update to match framerate
     const handleUpdate = () => {
        requestAnimationFrame(updateMarkersOverlay);
     };
 
     timeScale.subscribeVisibleTimeRangeChange(handleUpdate);
     timeScale.subscribeVisibleLogicalRangeChange(handleUpdate);
     
     return () => {
        timeScale.unsubscribeVisibleTimeRangeChange(handleUpdate);
        timeScale.unsubscribeVisibleLogicalRangeChange(handleUpdate);
     };
   }, []); 
 
   // Trigger update when events change
   useEffect(() => {
     updateMarkersOverlay();
   }, [events, candles, currentCandle, deduplicateEvents]);
 
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, flex: 1 }}>
      <div ref={chartContainerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      
      {/* React Rendered Markers Layer */}
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
     
     {/* Controls Overlay */}
     <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <button 
          onClick={() => setDeduplicateEvents(!deduplicateEvents)}
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
        >
          {deduplicateEvents ? 'Mode: Grouped' : 'Mode: Debug Stream'}
        </button>
        <span style={{ fontSize: '10px', color: '#6B7280', backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', padding: '0 4px', borderRadius: '4px' }}>
          {deduplicateEvents 
            ? 'Showing 1 marker per minute (clean)' 
            : 'Showing all raw events (stacked)'}
        </span>
     </div>

     <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', pointerEvents: 'none' }}>
       <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '12px', fontFamily: 'monospace', color: '#4B5563' }}>
         BTC/USD • 1m • Alpaca • EMA-9
       </div>
       
       {isMockData && (
         <div style={{ backgroundColor: 'rgba(254,243,199,0.9)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '12px', fontFamily: 'monospace', color: '#92400E', borderLeft: '4px solid #F59E0B', fontWeight: 'bold' }}>
           ⚠️ USING MOCK CANDLE DATA
         </div>
       )}
     </div>
   </div>
  );
}

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
       height: 500,
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
 
     // 1. Group events by Snapped Timestamp (1m buckets)
     const groupedEvents = new Map<number, RuleEngineEvent[]>();
     
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
 
        // Skip off-screen
        if (x === null || x < 0 || x > width) return;
 
        // Find matching candle for Y positioning
        let candle = refCandles.find(c => Number(c.time) === snappedTime);
        if (!candle && refCurrentCandle && Number(refCurrentCandle.time) === snappedTime) {
            candle = refCurrentCandle;
        }
 
        // 3. Determine Presence
        const hasDeviation = groupEvents.some(e => e.deviation);
        const hasAdherence = groupEvents.some(e => !e.deviation);
        
        // Helper to get Y coordinate
        const getY = (isDeviation: boolean): number | null => {
            if (candle) {
                return series.priceToCoordinate(isDeviation ? candle.high : candle.low);
            }
            // Fallback: use first event price
            const evt = groupEvents.find(e => e.deviation === isDeviation);
            return evt ? series.priceToCoordinate(evt.price) : null;
        };
 
        if (hasDeviation) {
            const y = getY(true);
            if (y !== null) {
                newMarkers.push({
                    id: `${snappedTime}-dev`,
                    timestamp: snappedTime,
                    type: 'deviation',
                    x: x,
                    y: y
                });
            }
        }
 
        if (hasAdherence) {
            const y = getY(false);
            if (y !== null) {
                newMarkers.push({
                    id: `${snappedTime}-adh`,
                    timestamp: snappedTime,
                    type: 'adherence',
                    x: x,
                    y: y
                });
            }
        }
     });
 
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
     <div className="relative w-full h-[500px]">
       <div ref={chartContainerRef} className="absolute inset-0" />
       
       {/* React Rendered Markers Layer */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {markers.map(m => {
             // Positioning Logic
             // Deviation = Above Candle (Translate Y -100%)
             // Adherence = Below Candle (Translate Y 0)
             // We use translateY to create the gap
             
             const isDeviation = m.type === 'deviation';
             const color = isDeviation ? '#F97316' : '#3B82F6';
             const icon = isDeviation ? '▼' : '▲';
             
             // Offset away from candle
             const yTransform = isDeviation ? '-100% - 12px' : '12px';
 
             return (
                 <div
                     key={m.id}
                     className="marker-pop"
                     onClick={(e) => {
                         e.stopPropagation(); // Stop click from hitting chart
                         onMarkerClick(m.timestamp, m.type);
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = `translateX(-50%) translate(0, ${yTransform}) scale(1.3)`}
                     onMouseLeave={(e) => e.currentTarget.style.transform = `translateX(-50%) translate(0, ${yTransform}) scale(1.0)`}
                     style={{
                         position: 'absolute',
                         left: m.x,
                         top: m.y,
                         transform: `translateX(-50%) translate(0, ${yTransform})`, // Dynamic Transform
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
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
         <button 
           onClick={() => setDeduplicateEvents(!deduplicateEvents)}
           className="bg-white/90 backdrop-blur border border-gray-200 shadow-sm px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-50 transition-colors text-gray-700"
         >
           {deduplicateEvents ? 'Mode: Grouped' : 'Mode: Debug Stream'}
         </button>
         <span className="text-[10px] text-gray-500 bg-white/50 backdrop-blur px-1 rounded">
           {deduplicateEvents 
             ? 'Showing 1 marker per minute (clean)' 
             : 'Showing all raw events (stacked)'}
         </span>
      </div>

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-mono text-gray-600">
          BTC/USD • 1m • Alpaca • EMA-9
        </div>
        
        {isMockData && (
          <div className="bg-amber-100/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-mono text-amber-800 border-l-4 border-amber-500 font-bold shadow-sm animate-pulse">
            ⚠️ USING MOCK CANDLE DATA
          </div>
        )}
      </div>
    </div>
  );
}

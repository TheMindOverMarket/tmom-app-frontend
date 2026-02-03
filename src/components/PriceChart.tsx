import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts';
import { useMarketData } from '../hooks/useMarketData';
import { useDerivedSignals } from '../hooks/useDerivedSignals';
import { RuleEngineEvent } from '../domain/ruleEngine/types';

interface PriceChartProps {
  events: RuleEngineEvent[];
  onMarkerClick: (timestamp: number) => void;
}

export function PriceChart({ events, onMarkerClick }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersContainerRef = useRef<HTMLDivElement>(null);

  // Use Canonical Market Data Hook
  const { candles, currentCandle } = useMarketData('BTC-USD', 60);
  
  // Use Derived Signals (EMA-9)
  const { ema9, currentEMA9 } = useDerivedSignals(candles, currentCandle);

  // User Toggle for Deduplication (State must be before dataRef)
  const [deduplicateEvents, setDeduplicateEvents] = useState(true);

  // Data Refs to prevent Effect churn on high-frequency updates
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

  // Marker Overlay Logic
  const updateMarkersOverlay = () => {
    if (!chartRef.current || !seriesRef.current || !markersContainerRef.current) {
       return;
    }

    // Read from REF to avoid stale closures and dependency churn
    const { candles: refCandles, currentCandle: refCurrentCandle, events: refEvents, deduplicateEvents: refDeduplicate } = dataRef.current;
    
    const chart = chartRef.current;
    const series = seriesRef.current;
    const timeScale = chart.timeScale();
    const container = markersContainerRef.current;
    
    container.innerHTML = '';

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
       // Sort by time within the group
       groupEvents.sort((a, b) => a.msTimestamp - b.msTimestamp);

       const time = snappedTime as Time;
       const x = timeScale.timeToCoordinate(time);

       // Skip off-screen
       if (x === null || x < 0 || x > container.clientWidth) return;

       // Find Candle Y-Coordinates
       let candle = refCandles.find(c => Number(c.time) === snappedTime);
       if (!candle && refCurrentCandle && Number(refCurrentCandle.time) === snappedTime) {
          candle = refCurrentCandle;
       }

       // Helper to create and append marker
       const createMarker = (y: number, isDeviation: boolean) => {
          const el = document.createElement('div');
          Object.assign(el.style, {
             position: 'absolute',
             left: `${x}px`,
             top: `${y}px`,
             transform: `translate(-50%, ${isDeviation ? '-100% - 8px' : '8px'})`,
             cursor: 'pointer',
             zIndex: '50',
             pointerEvents: 'auto',
             fontSize: '20px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             width: '20px',
             height: '20px',
             transition: 'transform 0.1s ease-in-out'
          });

          el.innerHTML = isDeviation 
             ? '<span style="color: #EF4444; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">▼</span>' 
             : '<span style="color: #10B981; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">▲</span>';

          // Click Interaction -> Call Parent
          el.onclick = (e) => {
             e.stopPropagation();
             // Pass the snapped time (candle timestamp) to filter the inspector
             onMarkerClick(snappedTime);
          };

          // Simple hover effect for feedback
          el.onmouseenter = () => { el.style.transform = `translate(-50%, ${isDeviation ? '-100% - 8px' : '8px'}) scale(1.2)`; };
          el.onmouseleave = () => { el.style.transform = `translate(-50%, ${isDeviation ? '-100% - 8px' : '8px'}) scale(1.0)`; };

          container.appendChild(el);
       };

       // 3. Render Logic
       if (refDeduplicate) {
          // --- MODE: DEDUPLICATED ---
          // One Red (if exists), One Green (if exists)
          const deviations = groupEvents.filter(e => e.deviation);
          const adherences = groupEvents.filter(e => !e.deviation);
          
          if (deviations.length > 0) {
             const y = candle ? series.priceToCoordinate(candle.high) : series.priceToCoordinate(deviations[0].price);
             if (y !== null) createMarker(y, true); 
          }
          
          if (adherences.length > 0) {
             const y = candle ? series.priceToCoordinate(candle.low) : series.priceToCoordinate(adherences[0].price);
             if (y !== null) createMarker(y, false); 
          }

       } else {
          // --- MODE: RAW (DEBUG) ---
          // Render every single event stacked
          groupEvents.forEach(evt => {
             let y = null;
             if (candle) {
                y = series.priceToCoordinate(evt.deviation ? candle.high : candle.low);
             } else {
                y = series.priceToCoordinate(evt.price);
             }
             
             if (y !== null) {
                createMarker(y, evt.deviation); 
             }
          });
       }
    });
  };

  // Subscribe to chart updates (Scrolling/Zooming)
  // This effect is now STABLE and does not re-run on data changes.
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    
    const timeScale = chartRef.current.timeScale();
    
    const handleUpdate = () => {
       requestAnimationFrame(updateMarkersOverlay);
    };

    timeScale.subscribeVisibleTimeRangeChange(handleUpdate);
    timeScale.subscribeVisibleLogicalRangeChange(handleUpdate);
    
    return () => {
       timeScale.unsubscribeVisibleTimeRangeChange(handleUpdate);
       timeScale.unsubscribeVisibleLogicalRangeChange(handleUpdate);
    };
    // No dependencies on data, only on chart instance availability
  }, []); 

  // Trigger update when events/data change (The "Render Loop")
  useEffect(() => {
    updateMarkersOverlay();
  }, [events, candles, deduplicateEvents, currentCandle]);

  return (
    <div className="relative w-full h-[500px]">
      <div ref={chartContainerRef} className="absolute inset-0" />
      {/* HTML Marker Overlay Layer */}
      <div ref={markersContainerRef} className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden' }}></div>
      
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

      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-mono text-gray-600">
        BTC-USD • 1m • Coinbase • EMA-9
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts';
import { useMarketData } from '../hooks/useMarketData';
import { useDerivedSignals } from '../hooks/useDerivedSignals';
import { useRuleEngineEvents } from '../hooks/useRuleEngineEvents';
import { RuleEngineEvent } from '../domain/ruleEngine/types';

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Use Canonical Market Data Hook
  const { candles, currentCandle } = useMarketData('BTC-USD', 60);
  
  // Use Derived Signals (EMA-9)
  const { ema9, currentEMA9 } = useDerivedSignals(candles, currentCandle);

  // Use Rule Engine Events
  const { events } = useRuleEngineEvents();
  const latestEventsRef = useRef<RuleEngineEvent[]>(events);
  
  useEffect(() => {
    latestEventsRef.current = events;
  }, [events]);

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
    
    // Markers: We now use HTML primitives, so no createSeriesMarkers logic needed.

    chart.timeScale().fitContent();

    // Tooltip / Crosshair Logic
    // Tooltip / Crosshair Logic: REMOVED (Markers handle their own tooltips now)
    // We only keep basic chart cleanup

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
      // We don't refit content here to strictly follow the candles, 
      // but usually they match.
    }
  }, [ema9]);

  // Update Data: Live Updates
  useEffect(() => {
    if (seriesRef.current && currentCandle) {
      seriesRef.current.update(currentCandle);
    }
    
    // Live EMA update (using the same 'update' pattern for efficiency if possible, 
    // but lightweight-charts LineSeries needs 'update' with a new time or same time)
    if (emaSeriesRef.current && currentEMA9) {
      emaSeriesRef.current.update(currentEMA9);
    }
  }, [currentCandle, currentEMA9]);

  // User Toggle for Deduplication
  const [deduplicateEvents, setDeduplicateEvents] = useState(true);

  // Marker Overlay Logic
  const updateMarkersOverlay = () => {
    if (!chartRef.current || !seriesRef.current || !markersContainerRef.current) {
       return;
    }

    const chart = chartRef.current;
    const series = seriesRef.current;
    const timeScale = chart.timeScale();
    const container = markersContainerRef.current;
    
    container.innerHTML = '';

    // 1. Group events by Snapped Timestamp (1m buckets)
    const groupedEvents = new Map<number, RuleEngineEvent[]>();
    
    events.forEach(event => {
       const snappedTime = Math.floor(event.timestamp / 60) * 60;
       if (!groupedEvents.has(snappedTime)) {
          groupedEvents.set(snappedTime, []);
       }
       groupedEvents.get(snappedTime)?.push(event);
    });

    // 2. Process each Group
    groupedEvents.forEach((groupEvents, snappedTime) => {
       // Sort by time within the group for the tooltip
       groupEvents.sort((a, b) => a.msTimestamp - b.msTimestamp);

       const time = snappedTime as Time;
       const x = timeScale.timeToCoordinate(time);

       // Skip off-screen
       if (x === null || x < 0 || x > container.clientWidth) return;

       // Find Candle Y-Coordinates
       let candle = candles.find(c => Number(c.time) === snappedTime);
       if (!candle && currentCandle && Number(currentCandle.time) === snappedTime) {
          candle = currentCandle;
       }

       // Helper to create and append marker
       const createMarker = (y: number, isDeviation: boolean, eventsForTooltip: RuleEngineEvent[]) => {
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
             height: '20px'
          });

          el.innerHTML = isDeviation 
             ? '<span style="color: #EF4444; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">▼</span>' 
             : '<span style="color: #10B981; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">▲</span>';

          // Tooltip showing ALL events in this bundle (sorted)
          el.onmouseenter = () => {
             if (tooltipRef.current) {
                tooltipRef.current.style.display = 'block';
                tooltipRef.current.style.left = `${x + 10}px`;
                tooltipRef.current.style.top = `${y}px`;
                
                // Build list of events
                const content = eventsForTooltip.map((evt, i) => {
                   const date = new Date(evt.msTimestamp);
                   const timeStr = date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                   const msStr = String(date.getMilliseconds()).padStart(3, '0');
                   const isLast = i === eventsForTooltip.length - 1;

                   return `
                     <div style="margin-bottom: ${isLast ? '0' : '8px'}; padding-bottom: ${isLast ? '0' : '8px'}; border-bottom: ${isLast ? 'none' : '1px solid #f3f4f6'};">
                       <div style="font-weight: bold; margin-bottom: 2px; color: ${evt.deviation ? '#EF4444' : '#10B981'}; display: flex; align-items: center; gap: 4px;">
                         <span>${evt.deviation ? '⚠' : '✓'}</span>
                         <span>${evt.deviation ? 'DEVIATION' : 'ADHERENCE'}</span>
                       </div>
                       <div style="font-size: 11px; margin-bottom: 1px;">
                         <span style="color: #9CA3AF">Rule:</span> 
                         <span style="font-family: monospace;">${typeof evt.rule === 'string' ? evt.rule : JSON.stringify(evt.rawRule || evt.rule)}</span>
                       </div>
                        <div style="font-size: 11px; margin-bottom: 1px;"><span style="color: #9CA3AF">Price:</span> ${evt.price.toFixed(2)}</div>
                       <div style="font-size: 11px; margin-bottom: 1px;"><span style="color: #9CA3AF">Action:</span> ${evt.action}</div>
                       <div style="font-size: 10px; color: #9CA3AF; margin-top: 2px; font-family: monospace;">
                         ${timeStr}.${msStr}
                       </div>
                     </div>
                   `;
                }).join('');

                tooltipRef.current.innerHTML = content;
             }
          };

          el.onmouseleave = () => {
             if (tooltipRef.current) tooltipRef.current.style.display = 'none';
          };

          container.appendChild(el);
       };

       // 3. Render Logic
       if (deduplicateEvents) {
          // --- MODE: DEDUPLICATED ---
          // One Red (if exists), One Green (if exists)
          const deviations = groupEvents.filter(e => e.deviation);
          const adherences = groupEvents.filter(e => !e.deviation);
          
          if (deviations.length > 0) {
             const y = candle ? series.priceToCoordinate(candle.high) : series.priceToCoordinate(deviations[0].price);
             if (y !== null) createMarker(y, true, groupEvents); // Show ALL events in tooltip regardless of marker color
          }
          
          if (adherences.length > 0) {
             const y = candle ? series.priceToCoordinate(candle.low) : series.priceToCoordinate(adherences[0].price);
             if (y !== null) createMarker(y, false, groupEvents); // Show ALL events in tooltip
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
                // For debug mode, we can show just this event or all?
                // User asked to "see every time that get streamed".
                // Let's bind just THIS event to the tooltip for specific inspection, 
                // OR show group. Standard is "hovering this marker shows this marker's data".
                createMarker(y, evt.deviation, [evt]); 
             }
          });
       }
    });
  };

  // Subscribe to chart updates to move overlay
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    
    const timeScale = chartRef.current.timeScale();
    
    const handleUpdate = () => {
       // Using requestAnimationFrame to debounce and sync with repaint
       requestAnimationFrame(updateMarkersOverlay);
    };

    timeScale.subscribeVisibleTimeRangeChange(handleUpdate);
    timeScale.subscribeVisibleLogicalRangeChange(handleUpdate);
    
    return () => {
       timeScale.unsubscribeVisibleTimeRangeChange(handleUpdate);
       timeScale.unsubscribeVisibleLogicalRangeChange(handleUpdate);
    };
  }, [deduplicateEvents, events, candles, currentCandle]); // Add dependencies to closure

  // Trigger update when events/data change
  useEffect(() => {
    updateMarkersOverlay();
  }, [events, candles, deduplicateEvents]); // Re-run when toggle changes

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

      {/* Tooltip for Markers */}
      <div 
        ref={tooltipRef}
        style={{
          display: 'none',
          position: 'absolute',
          zIndex: 100,
          pointerEvents: 'auto', // Allow scrolling/interaction
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          color: '#374151',
          fontSize: '12px',
          fontFamily: 'sans-serif',
          minWidth: '220px',
          maxWidth: '320px',
          maxHeight: '400px', // Increased height
          overflowY: 'auto'
        }}
      />

      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-mono text-gray-600">
        BTC-USD • 1m • Coinbase • EMA-9
      </div>
    </div>
  );
}

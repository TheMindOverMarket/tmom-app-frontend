import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries, createSeriesMarkers, type IChartApi, type ISeriesApi, type SeriesMarker, type Time } from 'lightweight-charts';
import { useMarketData } from '../hooks/useMarketData';
import { useDerivedSignals } from '../hooks/useDerivedSignals';
import { useRuleEngineEvents } from '../hooks/useRuleEngineEvents';
import { RuleEngineEvent } from '../domain/ruleEngine/types';

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersRef = useRef<any>(null); // To store the result of createSeriesMarkers
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
    
    // Series Markers Primitive (Required in v5.1.0+)
    const markersPlugin = createSeriesMarkers(series);
    markersRef.current = markersPlugin;

    chart.timeScale().fitContent();

    // Tooltip / Crosshair Logic
    chart.subscribeCrosshairMove((param) => {
      if (
        !tooltipRef.current ||
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > (chartContainerRef.current?.clientWidth || 0) ||
        param.point.y < 0 ||
        param.point.y > 500
      ) {
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        return;
      }

      // Check if we are hovering over a marker
      // Note: lightweight-charts doesn't give marker hit-testing directly in param.
      // We check for events at this timestamp using a ref to avoid stale closures.
      const hoveredEvents = latestEventsRef.current.filter(e => e.timestamp === (param.time as number));
      
      if (hoveredEvents.length > 0) {
        const event = hoveredEvents[0]; // Just show the first one for now
        tooltipRef.current.style.display = 'block';
        tooltipRef.current.style.left = `${param.point.x + 15}px`;
        tooltipRef.current.style.top = `${param.point.y + 15}px`;
        
        const ruleName = typeof event.rule === 'string' ? event.rule : JSON.stringify(event.rule);
        
        tooltipRef.current.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 4px; color: ${event.deviation ? '#EF4444' : '#10B981'}">
            ${event.deviation ? '⚠ DEVIATION' : '✓ ADHERENCE'}
          </div>
          <div style="font-size: 11px; margin-bottom: 2px;">Rule: ${ruleName}</div>
          <div style="font-size: 11px; margin-bottom: 2px;">Price: ${event.price.toFixed(2)}</div>
          <div style="font-size: 11px; margin-bottom: 2px;">Action: ${event.action}</div>
          <div style="font-size: 10px; color: #9CA3AF;">${new Date(event.originalTimestamp).toLocaleTimeString()}</div>
        `;
      } else {
        tooltipRef.current.style.display = 'none';
      }
    });

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

  // Update Data: Rule Engine Markers
  useEffect(() => {
    if (seriesRef.current && events.length > 0) {
      const markers: SeriesMarker<Time>[] = events.map((event) => ({
        time: event.timestamp as Time,
        position: event.deviation ? 'aboveBar' : 'belowBar',
        color: event.deviation ? '#EF4444' : '#10B981',
        shape: event.deviation ? 'arrowDown' : 'arrowUp',
        text: typeof event.rule === 'string' ? event.rule : 'Rule',
      }));
      
      if (markersRef.current) {
        markersRef.current.setMarkers(markers);
      }
    }
  }, [events]);

  return (
    <div className="relative w-full h-[500px]">
      <div ref={chartContainerRef} className="absolute inset-0" />
      
      {/* Tooltip for Markers */}
      <div 
        ref={tooltipRef}
        style={{
          display: 'none',
          position: 'absolute',
          zIndex: 100,
          pointerEvents: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: '#374151',
          fontSize: '12px',
          fontFamily: 'sans-serif',
          minWidth: '160px'
        }}
      />

      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-mono text-gray-600">
        BTC-USD • 1m • Coinbase • EMA-9
      </div>
    </div>
  );
}

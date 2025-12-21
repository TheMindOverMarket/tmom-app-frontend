import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import { useMarketData } from '../hooks/useMarketData';
import { useDerivedSignals } from '../hooks/useDerivedSignals';

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Use Canonical Market Data Hook
  const { candles, currentCandle } = useMarketData('BTC-USD', 60);
  
  // Use Derived Signals (EMA-9)
  const { ema9, currentEMA9 } = useDerivedSignals(candles, currentCandle);

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

  return (
    <div className="relative w-full h-[500px]">
      <div ref={chartContainerRef} className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-mono text-gray-600">
        BTC-USD • 1m • Coinbase • EMA-9
      </div>
    </div>
  );
}

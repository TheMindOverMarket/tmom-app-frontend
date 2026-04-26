import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  Time, 
  UTCTimestamp,
  ColorType,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  LineSeries
} from 'lightweight-charts';
import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { Candle } from '../marketdata/types';

export interface MarkerData {
  id: string;
  timestamp: number;
  type: 'adherence' | 'deviation';
  x: number;
  y: number;
}

/**
 * usePriceChart
 * 
 * Logic to manage a Lightweight Charts instance, sync historical candles,
 * handle live updates, and manage marker coordinate calculations.
 */
export function usePriceChart(
  events: RuleEngineEvent[],
  candles: Candle[],
  currentCandle: Candle | null,
  ema9: { time: Time; value: number }[],
  currentEMA9: { time: Time; value: number } | null,
  isMockData: boolean = false,
  isDark: boolean = true
) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [deduplicateEvents, setDeduplicateEvents] = useState(true);
  
  const initialRangeSetRef = useRef(false);

  // Store data in refs for coordinate calculations without re-triggering effects
  const dataRef = useRef({ events, candles, currentCandle, deduplicateEvents });
  useEffect(() => {
    dataRef.current = { events, candles, currentCandle, deduplicateEvents };
  }, [events, candles, currentCandle, deduplicateEvents]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: IChartApi | null = null;
    let series: any = null;
    let emaSeries: any = null;

    const init = () => {
      if (!chartContainerRef.current || chartRef.current) return;
      
      if (chartContainerRef.current.clientWidth === 0 || chartContainerRef.current.clientHeight === 0) {
        setTimeout(init, 100);
        return;
      }

      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: isDark ? '#94a3b8' : '#64748b',
          fontSize: 10,
          fontFamily: "'Inter', sans-serif",
        },
        grid: {
          vertLines: { color: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)', style: LineStyle.Dotted },
          horzLines: { color: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)', style: LineStyle.Dotted },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { labelBackgroundColor: isDark ? 'var(--auth-black)' : '#0f172a' },
          horzLine: { labelBackgroundColor: isDark ? 'var(--auth-black)' : '#0f172a' },
        },
        timeScale: {
          borderColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)',
          autoScale: true,
          scaleMargins: {
            top: 0.15, // Give 15% space at top
            bottom: 0.15, // Give 15% space at bottom
          },
        },
        handleScale: true,
        handleScroll: true,
      });

      series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      emaSeries = chart.addSeries(LineSeries, {
          color: '#6366f1',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
      });

      chartRef.current = chart;
      seriesRef.current = series;
      emaSeriesRef.current = emaSeries;

      // Force immediate update if data is already available
      if (dataRef.current.candles.length > 0) {
        series.setData(dataRef.current.candles);
      }
    };

    init();

    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chart) {
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
        emaSeriesRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      seriesRef.current.setData(candles);
      
      // On initial history load, zoom into the last 60 bars for a better focused view
      if (!initialRangeSetRef.current && chartRef.current) {
        const timeScale = chartRef.current.timeScale();
        const DEFAULT_BARS = 60;
        const width = chartContainerRef.current?.clientWidth || 800;
        const barsToDisplay = Math.min(candles.length, Math.floor(width / 15), DEFAULT_BARS);
        
        timeScale.setVisibleLogicalRange({
          from: candles.length - barsToDisplay,
          to: candles.length,
        });
        
        initialRangeSetRef.current = true;
      }
    }
  }, [candles]);

  useEffect(() => {
    if (emaSeriesRef.current && ema9.length > 0) emaSeriesRef.current.setData(ema9);
  }, [ema9]);

  useEffect(() => {
    if (seriesRef.current && currentCandle) {
        seriesRef.current.update(currentCandle);
        // Auto-scroll to latest if we are already near the end
        if (chartRef.current) {
            chartRef.current.timeScale().scrollToPosition(0, true);
        }
    }
    if (emaSeriesRef.current && currentEMA9) emaSeriesRef.current.update(currentEMA9);
  }, [currentCandle, currentEMA9]);

  const updateMarkersOverlay = () => {
    if (!chartRef.current || !seriesRef.current) return;

    const { events: refEvents, candles: refCandles, currentCandle: refCurrentCandle } = dataRef.current;
    const chart = chartRef.current;
    const series = seriesRef.current;
    const timeScale = chart.timeScale();
    const width = chartContainerRef.current?.clientWidth || 0;

    const newMarkers: MarkerData[] = [];
    const groupedEvents = new Map<number, RuleEngineEvent[]>();

    if (dataRef.current.deduplicateEvents) {
      refEvents.forEach(event => {
        const snappedTime = Math.floor(event.timestamp / 60) * 60;
        if (!groupedEvents.has(snappedTime)) groupedEvents.set(snappedTime, []);
        groupedEvents.get(snappedTime)?.push(event);
      });

      groupedEvents.forEach((groupEvents, snappedTime) => {
        const time = snappedTime as Time;
        const x = timeScale.timeToCoordinate(time);
        if (x === null || x < 0 || x > width) return;

        const candle = refCandles.find(c => Number(c.time) === snappedTime) || 
                     (refCurrentCandle && Number(refCurrentCandle.time) === snappedTime ? refCurrentCandle : undefined);

        const hasDeviation = groupEvents.some(e => e.deviation);
        const hasAdherence = groupEvents.some(e => !e.deviation);
        
        const getY = (isDeviation: boolean): number | null => {
            const evt = groupEvents.find(e => e.deviation === isDeviation);
            if (evt && evt.price && evt.price > 0) return series.priceToCoordinate(evt.price);
            if (candle) return series.priceToCoordinate(isDeviation ? candle.high : candle.low);
            return null;
        };

        if (hasDeviation) {
            const y = getY(true);
            if (y !== null) {
                newMarkers.push({ 
                    id: `${snappedTime}-dev`, 
                    timestamp: snappedTime, 
                    type: 'deviation', 
                    x: Math.min(x, width - 4), 
                    y 
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
                    x: Math.min(x, width - 4), 
                    y 
                });
            }
        }
      });
    } else {
      refEvents.forEach(evt => {
        const snappedTime = Math.floor(evt.timestamp / 60) * 60;
        const time = snappedTime as Time;
        const x = timeScale.timeToCoordinate(time);
        const finalX = x !== null ? x : (width - 4);
        if (finalX < 0 || finalX > width + 50) return;

        const candle = refCandles.find(c => Number(c.time) === snappedTime) || 
                     (refCurrentCandle && Number(refCurrentCandle.time) === snappedTime ? refCurrentCandle : undefined);

        let y: number | null = null;
        if (evt.price && evt.price > 0) {
            y = series.priceToCoordinate(evt.price);
        } else if (candle) {
            y = series.priceToCoordinate(evt.deviation ? candle.high : candle.low);
        }
        if (y === null) return;

        newMarkers.push({ 
            id: evt.id, 
            timestamp: evt.timestamp, 
            type: evt.deviation ? 'deviation' : 'adherence', 
            x: finalX, 
            y 
        });
      });
    }
    setMarkers(newMarkers);
  };

  useEffect(() => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const handleUpdate = () => requestAnimationFrame(updateMarkersOverlay);
    timeScale.subscribeVisibleTimeRangeChange(handleUpdate);
    timeScale.subscribeVisibleLogicalRangeChange(handleUpdate);
    return () => {
      timeScale.unsubscribeVisibleTimeRangeChange(handleUpdate);
      timeScale.unsubscribeVisibleLogicalRangeChange(handleUpdate);
    };
  }, []);

  useEffect(() => {
    updateMarkersOverlay();
  }, [events, candles, currentCandle, deduplicateEvents]);

  const scrollToTime = useCallback((timestamp: number) => {
    if (!chartRef.current || candles.length === 0) return;
    
    const timeScale = chartRef.current.timeScale();
    const candleTimes = candles.map(c => Number(c.time));
    const minTime = Math.min(...candleTimes);
    const maxTime = Math.max(...candleTimes);

    // Safety Clamp: Reject scroll if time is wildly outside the loaded history
    if (timestamp < minTime - 3600 || timestamp > maxTime + 3600) {
      console.warn(`[usePriceChart] Rejecting scroll to ${timestamp} as it is outside candle range [${minTime}, ${maxTime}]`);
      return;
    }

    const coordinate = timeScale.timeToCoordinate(timestamp as UTCTimestamp);
    if (coordinate !== null) {
      const barsToDisplay = 100;
      const candleIndex = candles.findIndex(c => Number(c.time) >= timestamp);
      if (candleIndex !== -1) {
        timeScale.setVisibleLogicalRange({
          from: candleIndex - Math.floor(barsToDisplay / 2),
          to: candleIndex + Math.floor(barsToDisplay / 2),
        });
      }
    }
  }, [candles]);

  return {
    chartContainerRef,
    isMockData,
    deduplicateEvents,
    setDeduplicateEvents,
    markers,
    scrollToTime
  };
}

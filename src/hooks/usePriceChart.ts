import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts';
import { RuleEngineEvent } from '../domain/ruleEngine/types';
import { MarkerData } from '../components/chart/types';
import { Candle } from '../marketdata/types';

export function usePriceChart(
  events: RuleEngineEvent[],
  candles: Candle[],
  currentCandle: Candle | null,
  ema9: any[],
  currentEMA9: any | null,
  isMockData: boolean = false
) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [deduplicateEvents, setDeduplicateEvents] = useState(true);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const dataRef = useRef({ candles, currentCandle, events, deduplicateEvents });

  useEffect(() => {
    dataRef.current = { candles, currentCandle, events, deduplicateEvents };
  }, [candles, currentCandle, events, deduplicateEvents]);

  // Chart Init
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#ffffff' }, textColor: '#333' },
      grid: { vertLines: { color: '#f0f3fa' }, horzLines: { color: '#f0f3fa' } },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    seriesRef.current = series;

    const emaSeries = chart.addSeries(LineSeries, {
      color: '#2962FF', lineWidth: 2, crosshairMarkerVisible: false,
      lastValueVisible: false, priceLineVisible: false,
    });
    emaSeriesRef.current = emaSeries;

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
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  const initialRangeSetRef = useRef(false);

  // Data Updates
  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      seriesRef.current.setData(candles);
      
      // On initial history load, zoom into the last 60 bars for a better focused view
      // This also ensures the Y-axis auto-scales to the recent relevant prices.
      if (!initialRangeSetRef.current && chartRef.current) {
        const timeScale = chartRef.current.timeScale();
        const DEFAULT_BARS = 60;
        const width = chartContainerRef.current?.clientWidth || 800;
        
        // Match standard trading platforms: roughly show last 60 bars or fill 75% of container width
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
    if (seriesRef.current && currentCandle) seriesRef.current.update(currentCandle);
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
            if (evt) return series.priceToCoordinate(evt.price);
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
        
        // Use right-most edge for live updates if coordinate is not yet cached but the event is at the current minute
        const finalX = x !== null ? x : (width - 4);
        if (finalX < 0 || finalX > width + 50) return;

        const y = series.priceToCoordinate(evt.price);
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

  const scrollToTime = (timestamp: number) => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const width = chartContainerRef.current?.clientWidth || 800;
    const barsToDisplay = Math.floor(width / 15);
    
    // Convert timestamp to coordinate to check if it's already visible
    const x = timeScale.timeToCoordinate(timestamp as Time);
    
    if (x === null || x < 20 || x > width - 20) {
      // Not visible or too close to edges, center it
      // We use setVisibleRange if we want exact bounds, but setVisibleLogicalRange is more stable with bars
      // Finding the index of the candle with this timestamp
      const candleIndex = dataRef.current.candles.findIndex(c => Number(c.time) === timestamp);
      if (candleIndex !== -1) {
        timeScale.setVisibleLogicalRange({
          from: candleIndex - Math.floor(barsToDisplay / 2),
          to: candleIndex + Math.floor(barsToDisplay / 2),
        });
      }
    }
  };

  return {
    chartContainerRef,
    isMockData,
    deduplicateEvents,
    setDeduplicateEvents,
    markers,
    scrollToTime
  };
}

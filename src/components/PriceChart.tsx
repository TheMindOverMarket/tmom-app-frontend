import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, type Time } from 'lightweight-charts';

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

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
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries);
    series.setData([
      {
        time: '2018-12-22' as Time,
        open: 75.16,
        high: 82.84,
        low: 36.16,
        close: 45.72,
      },
      {
        time: '2018-12-23' as Time,
        open: 45.12,
        high: 53.90,
        low: 45.12,
        close: 48.09,
      },
      {
        time: '2018-12-24' as Time,
        open: 60.71,
        high: 60.71,
        low: 53.39,
        close: 59.29,
      },
      {
        time: '2018-12-25' as Time,
        open: 68.26,
        high: 68.26,
        low: 59.04,
        close: 60.50,
      },
      {
        time: '2018-12-26' as Time,
        open: 67.71,
        high: 105.85,
        low: 66.67,
        close: 91.04,
      },
      {
        time: '2018-12-27' as Time,
        open: 91.04,
        high: 121.40,
        low: 82.70,
        close: 111.40,
      },
      {
        time: '2018-12-28' as Time,
        open: 111.51,
        high: 142.83,
        low: 103.34,
        close: 131.25,
      },
      {
        time: '2018-12-29' as Time,
        open: 131.33,
        high: 151.17,
        low: 77.68,
        close: 96.43,
      },
      {
        time: '2018-12-30' as Time,
        open: 106.33,
        high: 110.20,
        low: 90.39,
        close: 98.10,
      },
      {
        time: '2018-12-31' as Time,
        open: 109.87,
        high: 114.69,
        low: 85.66, close: 111.26 },
    ]);

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

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '500px' }} />
  );
}

import { useEffect, useRef, useState } from 'react';
import { type Candle } from '../marketdata/types';
import { BackendMarketDataProvider } from '../marketdata/providers/backend';
import { type Time } from 'lightweight-charts';

export function useMarketData(symbol: string = 'BTC/USD', interval: number = 60) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentCandle, setCurrentCandle] = useState<Candle | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  
  // Guard to ensure single listener setup
  const isSubscribedRef = useRef(false);
  // Monotonic-time guard for live updates
  const lastAcceptedTimeRef = useRef<number>(0);

  useEffect(() => {
    // Reset state on symbol change
    setCandles([]);
    setCurrentCandle(null);
    setIsMockData(false);
    isSubscribedRef.current = false;

    let unsubscribe: (() => void) | undefined;

    const loadData = async () => {
      // 1. Fetch History
      let history: Candle[] = [];
      try {
        history = await BackendMarketDataProvider.getHistory(symbol, interval);
        setIsMockData(false);
      } catch (err) {
        console.warn('[useMarketData] Backend failed, generating mock data.', err);
        history = generateRealisticMockHistory(symbol, interval);
        setIsMockData(true);
      }
      
      setCandles(history);

      if (history.length > 0) {
        lastAcceptedTimeRef.current = Number(history[history.length - 1].time);
      }

      // Pre-seed the live candle ref if possible to avoid gaps
      if (history.length > 0) {
        setCurrentCandle(history[history.length - 1]);
      }

      // 2. Subscribe Live
      if (isSubscribedRef.current) return;
      
      unsubscribe = BackendMarketDataProvider.subscribeLive(symbol, interval, (updatedCandle) => {
        if (Number(updatedCandle.time) < lastAcceptedTimeRef.current) {
          return;
        }
        lastAcceptedTimeRef.current = Number(updatedCandle.time);
        setCurrentCandle(updatedCandle);
      });
      isSubscribedRef.current = true;
    };

    loadData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      isSubscribedRef.current = false;
    };
  }, [symbol, interval]);

  return { candles, currentCandle, isMockData };
}

function getMockBaselinePrice(symbol: string): number {
  const baseAsset = symbol.split('/')[0]?.toUpperCase();
  switch (baseAsset) {
    case 'ETH':
      return 3600;
    case 'SOL':
      return 180;
    case 'DOGE':
      return 0.18;
    case 'LTC':
      return 95;
    case 'AVAX':
      return 42;
    case 'BTC':
    default:
      return 71500;
  }
}

function generateRealisticMockHistory(symbol: string, interval: number): Candle[] {
  const data: Candle[] = [];
  const now = Math.floor(Date.now() / 1000 / 60) * 60;
  let price = getMockBaselinePrice(symbol);

  for (let i = 100; i >= 0; i--) {
    const time = (now - i * interval) as Time;
    const change = (Math.random() - 0.5) * 100; // random walk
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;
    
    data.push({ time, open, high, low, close });
    price = close;
  }
  return data;
}

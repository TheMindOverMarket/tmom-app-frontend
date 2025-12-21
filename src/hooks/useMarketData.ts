import { useEffect, useRef, useState } from 'react';
import { type Candle } from '../marketdata/types';
import { CoinbaseProvider } from '../marketdata/providers/coinbase';

// TODO(MARKETDATA_CANONICAL): In Option B, we might inject different providers or use a generic client.
// For now, this hook is hardwired to our Coinbase adapter/provider.

export function useMarketData(symbol: string = 'BTC-USD', interval: number = 60) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentCandle, setCurrentCandle] = useState<Candle | null>(null);
  
  // Guard to ensure single listener setup
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // Reset state on symbol change
    setCandles([]);
    setCurrentCandle(null);
    isSubscribedRef.current = false;

    let unsubscribe: (() => void) | undefined;

    const loadData = async () => {
      // 1. Fetch History
      const history = await CoinbaseProvider.getHistory(symbol, interval);
      setCandles(history);

      // Pre-seed the live candle ref if possible to avoid gaps
      // TODO(MARKETDATA_CANONICAL): Better gap handling (merging history end with live start)
      if (history.length > 0) {
        setCurrentCandle(history[history.length - 1]);
      }

      // 2. Subscribe Live
      if (isSubscribedRef.current) return; // Prevent double subscription
      
      unsubscribe = CoinbaseProvider.subscribeLive(symbol, interval, (updatedCandle) => {
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

  return { candles, currentCandle };
}

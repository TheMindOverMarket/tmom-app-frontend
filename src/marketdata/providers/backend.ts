import { type Time } from 'lightweight-charts';
import { type Candle, type MarketDataProvider } from '../types';

/**
 * BackendMarketDataProvider
 * 
 * Canonical provider that fetches historical and live market data from the TMOM Backend.
 */
export const BackendMarketDataProvider: MarketDataProvider = {
  getHistory: async (symbol: string, interval: number): Promise<Candle[]> => {
    // interval mapped to timeframe. Frontend interval is seconds (e.g. 60). Backend might want '1Min'.
    // Let's pass what backend expects based on spec (timeframe=1Min)
    let timeframe = '1Min';
    if (interval === 60) timeframe = '1Min';
    else if (interval === 3600) timeframe = '1Hour';
    else if (interval === 86400) timeframe = '1Day';

    const response = await fetch(`https://tmom-app-backend.onrender.com/market-data/history?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=100`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history from backend: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  subscribeLive: (_symbol: string, _interval: number, onCandleUpdate: (candle: Candle) => void): () => void => {
    // TODO: Connect to the backend Market Data WebSocket once available.
    // For now, we simulate live updates locally with random noise around 65000.
    const intervalId = setInterval(() => {
      const lastPrice = 65000 + (Math.random() - 0.5) * 50;
      onCandleUpdate({
        time: (Math.floor(Date.now() / 1000 / 60) * 60) as Time,
        open: lastPrice,
        high: lastPrice + 10,
        low: lastPrice - 10,
        close: lastPrice + (Math.random() - 0.5) * 10,
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }
};

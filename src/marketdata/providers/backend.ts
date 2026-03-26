import { type Time } from 'lightweight-charts';
import { type Candle, type MarketDataProvider } from '../types';
import { CONFIG } from '../../config/constants';

let lastKnownPrice = 71500;

/**
 * BackendMarketDataProvider
 * 
 * Canonical provider that fetches historical and live market data from the TMOM Backend.
 */
export const BackendMarketDataProvider: MarketDataProvider = {
  getHistory: async (symbol: string, interval: number): Promise<Candle[]> => {
    let timeframe = '1Min';
    if (interval === 60) timeframe = '1Min';
    else if (interval === 3600) timeframe = '1Hour';
    else if (interval === 86400) timeframe = '1Day';

    const response = await fetch(`${CONFIG.BACKEND_BASE_URL}/market-data/history?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=100`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history from backend: ${response.status}`);
    }

    const data: Candle[] = await response.json();
    
    // Update our baseline for the live simulator to ensure continuity
    if (data.length > 0) {
      lastKnownPrice = data[data.length - 1].close;
    }
    
    return data;
  },

  subscribeLive: (_symbol: string, _interval: number, onCandleUpdate: (candle: Candle) => void): () => void => {
    // TODO: Connect to the backend Market Data WebSocket once available.
    // For now, we simulate live updates locally with random noise around the last known price.
    const intervalId = setInterval(() => {
      // Walk the price logically from where we left off
      const change = (Math.random() - 0.5) * 50;
      const open = lastKnownPrice;
      const close = lastKnownPrice + change;
      const high = Math.max(open, close) + Math.random() * 10;
      const low = Math.min(open, close) - Math.random() * 10;
      
      onCandleUpdate({
        time: (Math.floor(Date.now() / 1000 / 60) * 60) as Time,
        open,
        high,
        low,
        close,
      });

      // Update baseline for next tick
      lastKnownPrice = close;
    }, 5000);

    return () => clearInterval(intervalId);
  }
};

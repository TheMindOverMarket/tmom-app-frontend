import { type Time } from 'lightweight-charts';
import { type Candle, type MarketDataProvider } from '../types';
import { CONFIG } from '../../config/constants';

let lastKnownPrice = 71500;
let lastHistoricalCandle: Candle | null = null;

/**
 * BackendMarketDataProvider
 * 
 * Canonical provider that fetches historical and live market data from the TMOM Backend.
 */
export const BackendMarketDataProvider: MarketDataProvider = {
  getHistory: async (symbol: string, interval: number, options?: { start_time?: string, end_time?: string }): Promise<Candle[]> => {
    let timeframe = '1Min';
    if (interval === 60) timeframe = '1Min';
    else if (interval === 300) timeframe = '5Min';
    else if (interval === 600) timeframe = '10Min';
    else if (interval === 900) timeframe = '15Min';
    else if (interval === 1200) timeframe = '20Min';
    else if (interval === 3600) timeframe = '1Hour';
    else if (interval === 86400) timeframe = '1Day';

    let url = `${CONFIG.BACKEND_BASE_URL}/market-data/history?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`;
    
    let start = options?.start_time;
    let end = options?.end_time;

    // Alpaca defaults to midnight UTC if start is omitted, causing the data to stick at 21:39 EST.
    // To fix this, we ALWAYS provide a rolling start and end time.
    if (!end) end = new Date().toISOString();
    if (!start) start = new Date(Date.now() - (interval * 100 * 1000)).toISOString();

    url += `&start_time=${encodeURIComponent(start)}&end_time=${encodeURIComponent(end)}&limit=100`;

    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history from backend: ${response.status}`);
    }

    const data: Candle[] = await response.json();
    
    // Update our baseline for the live simulator/websocket to ensure continuity
    if (data.length > 0) {
      lastHistoricalCandle = data[data.length - 1];
      lastKnownPrice = lastHistoricalCandle.close;
    }
    
    return data;
  },

  subscribeLive: (symbol: string, interval: number, onCandleUpdate: (candle: Candle) => void): () => void => {
    let currentBarTime: Time | null = null;
    let currentBarOpen: number | null = null;
    let currentBarHigh: number | null = null;
    let currentBarLow: number | null = null;

    const wsUrl = CONFIG.WS_BACKEND_URL;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.symbol !== symbol) return;

        const dt = new Date(data.timestamp || data.current_time);
        if (isNaN(dt.getTime())) return;
        
        const time = (Math.floor(dt.getTime() / 1000 / interval) * interval) as Time;
        
        if (currentBarTime !== time) {
           if (lastHistoricalCandle && lastHistoricalCandle.time === time) {
               currentBarOpen = lastHistoricalCandle.open;
               currentBarHigh = lastHistoricalCandle.high;
               currentBarLow = lastHistoricalCandle.low;
           } else {
               currentBarOpen = currentBarOpen === null ? (lastKnownPrice || data.price) : data.price;
               currentBarHigh = data.price;
               currentBarLow = data.price;
           }
           currentBarTime = time;
        }

        const close = data.price;
        currentBarHigh = Math.max(currentBarHigh!, data.high ?? close, close);
        currentBarLow = Math.min(currentBarLow!, data.low ?? close, close);

        onCandleUpdate({
          time,
          open: currentBarOpen!,
          high: currentBarHigh,
          low: currentBarLow,
          close,
        });

        lastKnownPrice = close;

      } catch (err) {
        console.warn('[BackendMarketDataProvider] WS Parse Error:', err);
      }
    };

    return () => ws.close();
  }
};

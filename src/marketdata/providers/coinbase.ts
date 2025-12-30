import { type Time } from 'lightweight-charts';
import { type Candle, type MarketDataProvider } from '../types';

// TODO(MARKETDATA_CANONICAL): This entire client-side provider is a temporary POC solution.
// In Option B, the browser will connect to our own backend Market Data Service,
// which will handle exchange connectivity, normalization, and aggregation.

export const CoinbaseProvider: MarketDataProvider = {
  getHistory: async (symbol: string, interval: number): Promise<Candle[]> => {
    // TODO(MARKETDATA_CANONICAL): Replace direct exchange REST call with internal API call.
    // Currently using a Vite proxy to bypass CORS.
    const product = symbol; // e.g., 'BTC-USD'
    const granularity = interval; // 60 for 1m

    // ticker messages are not true OHLC candles
    // timestamps are approximate / derived from local clock
    // provider emits tick-derived snapshots / aggregated approximations
    // true aggregation is out of scope for this POC provider and belongs elsewhere

    try {
      const response = await fetch(
        `/api/coinbase/products/${product}/candles?granularity=${granularity}`
      );

      if (!response.ok) {
        throw new Error(`Coinbase REST error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Coinbase REST error: unexpected response format');
      }

      // Coinbase returns [time, low, high, open, close, volume]
      // We need to sort because Coinbase usually returns newest first, but chart wants oldest first
      return data
        .map((d: number[]) => ({
          time: d[0] as Time,
          low: d[1],
          high: d[2],
          open: d[3],
          close: d[4],
        }))
        .reverse();

    } catch (error) {
      console.error('CoinbaseProvider: getHistory failed', error);
      // Return empty array to keep UI alive
      return [];
    }
  },

  subscribeLive: (symbol: string, _interval: number, onCandleUpdate: (candle: Candle) => void): () => void => {
    // TODO(MARKETDATA_CANONICAL): Replace direct exchange WS connection with internal WS subscription.
    // Currently connecting directly to Coinbase Pro WebSocket.
    
    // TODO(MARKETDATA_CANONICAL): Move client-side candle aggregation to the backend.
    
    let ws: WebSocket | null = new WebSocket('wss://ws-feed.exchange.coinbase.com');
    let messageCount = 0;
    
    // State for client-side aggregation
    let currentCandle: Candle | null = null;
    
    ws.onopen = () => {
      console.log('[CoinbaseProvider] WS open');
      // Subscribing to "ticker" channel to get real-time trade data for aggregation
      ws?.send(JSON.stringify({
        type: 'subscribe',
        product_ids: [symbol],
        channels: ['ticker']
      }));
    };

    ws.onclose = (event) => {
      console.log('[CoinbaseProvider] WS close', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      ws = null;
    };

    ws.onerror = (err) => {
      console.error('[CoinbaseProvider] WS error', err);
    };

    ws.onmessage = (event) => {
      messageCount++;
      if (messageCount % 50 === 0) {
        console.log(`[CoinbaseProvider] Processed ${messageCount} messages`);
      }

      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ticker' && message.price) {
          const price = parseFloat(message.price);
          
          if (!Number.isFinite(price)) {
            return;
          }

          const rawTime = new Date(message.time).getTime();
          if (!Number.isFinite(rawTime) || rawTime < 0) {
             return; 
          }

          const timestamp = rawTime / 1000;
          
          // Bucket timestamp to the nearest minute (start of the minute)
          const candleTimestamp = Math.floor(timestamp / 60) * 60;
          const candleTime = candleTimestamp as Time;

          if (!currentCandle) {
             // Initialize fresh state if needed
             // NOTE: We might want to pass in the last known candle from history to link up better,
             // but for now we start fresh from the first tick seen.
            currentCandle = {
              time: candleTime,
              open: price,
              high: price,
              low: price,
              close: price
            };
          } else if ((currentCandle.time as number) === candleTimestamp) {
            // Update existing candle in-place
            currentCandle = {
              ...currentCandle,
              high: Math.max(currentCandle.high, price),
              low: Math.min(currentCandle.low, price),
              close: price
            };
          } else if (candleTimestamp > (currentCandle.time as number)) {
             // New candle boundary crossed
            currentCandle = {
              time: candleTime,
              open: price, // Open is the first price we see in this new minute
              high: price,
              low: price,
              close: price
            };
          }

          if (currentCandle) {
            onCandleUpdate(currentCandle);
          }
        }
      } catch (e) {
        console.error('[CoinbaseProvider] Message parsing error', e);
      }
    };

    // Return unsubscribe function
    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }
};

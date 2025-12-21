import { type Time } from 'lightweight-charts';

export interface Candle {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketDataProvider {
  getHistory(symbol: string, interval: number): Promise<Candle[]>;
  subscribeLive(symbol: string, interval: number, onCandleUpdate: (candle: Candle) => void): () => void;
}

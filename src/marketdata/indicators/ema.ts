import { type Time } from 'lightweight-charts';
import { type Candle } from '../types';

// TODO(MARKETDATA_CANONICAL): EMA-9 is computed client-side for POC.
// Move this computation to backend market-data service when switching to Option B.

export interface EMAValue {
  time: Time;
  value: number;
}

/**
 * Calculates the Exponential Moving Average (EMA) for a series of candles.
 * Formula:
 * α = 2 / (N + 1)
 * EMA_t = α * close_t + (1 − α) * EMA_{t−1}
 * 
 * @param candles The historical candles to calculate EMA for.
 * @param period The period N (e.g., 9).
 * @returns An array of EMA values corresponding to the candles.
 */
export function calculateEMA(candles: Candle[], period: number): EMAValue[] {
  // TODO(MARKETDATA_CANONICAL): EMA-9 is computed client-side for POC.
  // Move this computation to backend market-data service when switching to Option B.
  
  if (candles.length < period) {
    return [];
  }

  const alpha = 2 / (period + 1);
  const emaValues: EMAValue[] = [];

  // Step 1: Initialize with SMA of the first 'period' candles
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEMA = sum / period;
  
  // The first EMA point corresponds to the time of the period-th candle (index period - 1)
  emaValues.push({
    time: candles[period - 1].time,
    value: prevEMA,
  });

  // Step 2: Calculate EMA for the rest of the series
  for (let i = period; i < candles.length; i++) {
    const currentClose = candles[i].close;
    const currentEMA = alpha * currentClose + (1 - alpha) * prevEMA;
    
    emaValues.push({
      time: candles[i].time,
      value: currentEMA,
    });
    
    prevEMA = currentEMA;
  }

  return emaValues;
}

/**
 * Updates the EMA with a new price point (incremental update).
 * 
 * @param prevEMA The previous EMA value.
 * @param currentClose The current close price.
 * @param period The period N.
 * @returns The new EMA value.
 */
export function updateEMA(prevEMA: number, currentClose: number, period: number): number {
  // TODO(MARKETDATA_CANONICAL): EMA-9 is computed client-side for POC.
  // Move this computation to backend market-data service when switching to Option B.

  const alpha = 2 / (period + 1);
  return alpha * currentClose + (1 - alpha) * prevEMA;
}

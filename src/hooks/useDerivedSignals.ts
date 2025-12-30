import { useMemo } from 'react';
import { type Candle } from '../marketdata/types';
import { calculateEMA, updateEMA, type EMAValue } from '../marketdata/indicators/ema';

// TODO(MARKETDATA_CANONICAL): EMA-9 is computed client-side for POC.
// Move this computation to backend market-data service when switching to Option B.

export function useDerivedSignals(candles: Candle[], currentCandle: Candle | null) {
  const EMA_PERIOD = 9;

  // 1. Calculate History EMA
  const historyEMA = useMemo(() => {
    // TODO(MARKETDATA_CANONICAL): EMA-9 is computed client-side for POC.
    // This heavy calculation runs once on history load.
    // EMA assumes monotonically increasing candle times
    return calculateEMA(candles, EMA_PERIOD);
  }, [candles]);

  // 2. Calculate Live EMA
  // Derived strictly from the last known EMA point + current live candle.
  // Derived strictly from the last known EMA point + current live candle.
  // Note: This approach assumes 'currentCandle' is the immediate successor to 'candles'.
  // live EMA depends on ordering
  // overlap handling is conservative
  // acceptable for POC, not production-grade market data
  // If there is a massive gap or 'candles' is empty, this logic naturally yields generic results (null).
  
  let liveEMA: EMAValue | null = null;
  
  if (currentCandle && historyEMA.length > 0) {
    // TODO(MARKETDATA_CANONICAL): EMA-9 is computed client-side for POC.
    // Ensure we are linking to the correct previous value.
    const lastHistoryEMA = historyEMA[historyEMA.length - 1];
    
    // Check if the current candle is actually new or just an update to the last history candle.
    // In our current 'CoinbaseProvider', 'candles' is static history, and 'currentCandle' is the moving tip.
    // So 'currentCandle.time' should be > 'lastHistoryEMA.time'.
    
    if (currentCandle.time > lastHistoryEMA.time) {
       // Standard case: New bar ticking.
       // We calculate the EMA for this new bar using the LAST FINALIZED EMA.
       const newValue = updateEMA(lastHistoryEMA.value, currentCandle.close, EMA_PERIOD);
       liveEMA = {
         time: currentCandle.time,
         value: newValue
       };
    } else if (currentCandle.time === lastHistoryEMA.time) {
       // Overlap case: The "live" candle is actually updating the last history bar (rare but possible with race conditions).
       // In this case, we'd need the *previous* previous EMA to correct it.
       // For POC, we skip this complexity and just assume the history is authoritative.
       liveEMA = null; 
    }
  }

  // Combine for Chart Consumption
  // The chart wants a single array or a base array + an update.
  // We'll return the full series array for simplicity in the hook interface, 
  // but optimized for the consumer (chart) to split if needed.
  
  const fullEMASeries = useMemo(() => {
    if (!liveEMA) return historyEMA;
    return [...historyEMA, liveEMA];
  }, [historyEMA, liveEMA]);

  const currentEMAValue = liveEMA || (historyEMA.length > 0 ? historyEMA[historyEMA.length - 1] : null);

  return {
    ema9: fullEMASeries,
    currentEMA9: currentEMAValue
  };
}

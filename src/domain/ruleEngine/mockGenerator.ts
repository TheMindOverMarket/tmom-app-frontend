import { RuleEngineEvent } from './types';

const MOCK_RULES = [
    'Momentum Breakout Strategy', 
    'Mean Reversion Guard', 
    'Volume Spike Detector', 
    'RSI Divergence Check'
];

/**
 * Generates a single mock RuleEngineEvent.
 * @param basePrice The current price to walk from
 * @param forceDeviation Optional boolean to force the type (true = deviation, false = adherence)
 */
export function generateMockEvent(basePrice: number = 50000, forceDeviation?: boolean): RuleEngineEvent {
    // 1. Determine Type
    // If forceDeviation is provided, use it. Otherwise default to deviation (high noise)
    const isDeviation = forceDeviation !== undefined ? forceDeviation : Math.random() < 0.8;

    // 2. Random Price Walk ( +/- 0.05% )
    const volatility = basePrice * 0.0005; 
    const priceChange = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice + priceChange;

    // 3. Timestamps
    const now = new Date();
    const msTimestamp = now.getTime();
    const timestamp = Math.floor(msTimestamp / 1000);

    return {
        id: crypto.randomUUID(),
        timestamp: timestamp, // Unix Seconds
        msTimestamp: msTimestamp,
        originalTimestamp: now.toISOString(),
        price: price,
        rule: MOCK_RULES[Math.floor(Math.random() * MOCK_RULES.length)],
        rawRule: {}, // Empty for mock
        action: !isDeviation, // Typically adherence = action, deviation = no-op/alert
        deviation: isDeviation
    };
}

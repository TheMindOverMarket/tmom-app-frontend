import { RuleEngineEvent } from './types';


/**
 * Generates a single mock RuleEngineEvent.
 * @param basePrice The current price to walk from
 * @param forceDeviation Optional boolean to force the type (true = deviation, false = adherence)
 */
export function generateMockEvent(basePrice: number = 71500, forceDeviation?: boolean): RuleEngineEvent {
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

    const ruleId = crypto.randomUUID();

    return {
        id: crypto.randomUUID(),
        timestamp: timestamp, 
        msTimestamp: msTimestamp,
        originalTimestamp: now.toISOString(),
        price: price,
        playbook_id: crypto.randomUUID(),
        session_id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        rule: ruleId,
        rule_triggered: !isDeviation,
        triggered_entries: isDeviation ? [] : [ruleId],
        rule_evaluations: {
            [ruleId]: !isDeviation,
            [crypto.randomUUID()]: false
        },
        rawRule: {}, 
        action: !isDeviation, 
        deviation: isDeviation,
        deviation_true: isDeviation ? [ruleId] : [],
        deviation_false: isDeviation ? [] : [ruleId],
        rule_status: {
            [ruleId]: !isDeviation,
        }
    };
}

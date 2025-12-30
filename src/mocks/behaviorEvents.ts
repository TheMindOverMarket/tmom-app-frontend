import { BehaviorEvent } from '../domain/behavior/events';

/**
 * Generates deterministic mock behavioral events for the POC.
 * These simulate a trading session with a mix of entries, exits, warnings, and violations.
 */
export function generateMockBehaviorEvents(symbol: string): BehaviorEvent[] {
  const now = Math.floor(Date.now() / 1000);
  const hour = 3600;

  // Timestamps are offset from "now" to simulate recent history
  // Ordered ascending
  const events: BehaviorEvent[] = [
    // 1. Initial Plan
    {
      id: 'evt_001',
      timestamp: now - 4 * hour,
      symbol,
      type: 'WARNING',
      severity: 'info',
      ruleId: 'plan_check',
      ruleName: 'Pre-Trade Plan',
      ruleCategory: 'strategy',
      message: 'Daily plan established. Key levels marked.',
      meta: { source: 'mock' },
    },
    // 2. Early entry attempt (Warning - rushing)
    {
      id: 'evt_002',
      timestamp: now - 3.5 * hour,
      symbol,
      type: 'WARNING',
      severity: 'low',
      ruleId: 'patience_01',
      ruleName: 'Wait for Candle Close',
      ruleCategory: 'timing',
      message: 'Potential entry signal forming. Wait for confirmation.',
      meta: { source: 'mock' },
    },
    // 3. Valid Entry
    {
      id: 'evt_003',
      timestamp: now - 3.4 * hour,
      symbol,
      type: 'ENTRY',
      severity: 'info',
      ruleId: 'entry_signal',
      ruleName: 'Trend Following Entry',
      ruleCategory: 'strategy',
      message: 'Long entry executed on confirmed breakout.',
      context: {
        side: 'long',
        price: 1542.50,
      },
      meta: { source: 'mock' },
    },
    // 4. Adding to loser (Risk Violation)
    {
      id: 'evt_004',
      timestamp: now - 2.8 * hour,
      symbol,
      type: 'VIOLATION',
      severity: 'high',
      ruleId: 'risk_avg_down',
      ruleName: 'Never Average Down',
      ruleCategory: 'risk',
      message: 'Adding to a losing position is prohibited.',
      context: {
        price: 1538.00,
        reason: 'Price dropped below entry',
      },
      meta: { source: 'mock' },
    },
    // 5. Emotional volatility check (Psychology Warning)
    {
      id: 'evt_005',
      timestamp: now - 2.5 * hour,
      symbol,
      type: 'WARNING',
      severity: 'medium',
      ruleId: 'tilt_check',
      ruleName: 'Monitor Emotional State',
      ruleCategory: 'psychology',
      message: 'Rapid clicking detected. Take a breath.',
      meta: { source: 'mock' },
    },
    // 6. Oversizing (Size Violation)
    {
      id: 'evt_006',
      timestamp: now - 2.4 * hour,
      symbol,
      type: 'VIOLATION',
      severity: 'critical',
      ruleId: 'size_limit',
      ruleName: 'Max Position Size',
      ruleCategory: 'size',
      message: 'Position size exceeds daily limit of 2.0 lots.',
      context: {
        currentSize: 2.5,
        limit: 2.0,
      },
      meta: { source: 'mock' },
    },
    // 7. Partial Exit (Good discipline)
    {
      id: 'evt_007',
      timestamp: now - 1.5 * hour,
      symbol,
      type: 'EXIT',
      severity: 'info',
      ruleId: 'take_profit',
      ruleName: 'Partial Take Profit',
      ruleCategory: 'strategy',
      message: 'Partial exit at 1.5R.',
      context: {
        price: 1550.00,
        pnl: 150.00,
      },
      meta: { source: 'mock' },
    },
    // 8. Revenge trade attempt (Psychology Violation)
    {
      id: 'evt_008',
      timestamp: now - 1.0 * hour,
      symbol,
      type: 'VIOLATION',
      severity: 'high',
      ruleId: 'revenge_prevention',
      ruleName: 'No Revenge Trading',
      ruleCategory: 'psychology',
      message: 'Re-entry immediately after stop out is flagged as revenge.',
      meta: { source: 'mock' },
    },
    // 9. Final Exit
    {
      id: 'evt_009',
      timestamp: now - 0.5 * hour,
      symbol,
      type: 'EXIT',
      severity: 'info',
      ruleId: 'stop_loss',
      ruleName: 'Trailing Stop Hit',
      ruleCategory: 'risk',
      message: 'Position closed on trailing stop.',
      context: {
        price: 1545.00,
        pnl: 75.00,
      },
      meta: { source: 'mock' },
    },
  ];

  return events;
}

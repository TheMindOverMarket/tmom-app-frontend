import { useState } from 'react';
import { playbookApi } from '../domain/playbook/api';
import { sessionApi } from '../domain/session/api';
import { Session, SessionStatus } from '../domain/session/types';
import { CONFIG } from '../config/constants';

const SAMPLE_STRATEGY = `I’m using BTC.
1. Setup Logic (Deterministic Inputs)

Derived State:
	•	Session VWAP (UTC daily reset)
	•	20-period EMA
	•	14-period ATR
	•	Rolling volatility regime
	•	Daily realized PnL

⸻

Long Setup

Conditions must ALL be true:
	1.	Price < VWAP − 1.5 × ATR
	2.	EMA slope > 0
	3.	5-min close back above prior candle high
	4.	Not within 10 minutes of previous stop

⸻

Short Setup
	1.	Price > VWAP + 1.5 × ATR
	2.	EMA slope < 0
	3.	5-min close below prior candle low
	4.	Not within 10 minutes of previous stop

⸻

2. Entry Rules
	•	Market order at next candle open.
	•	Max 1 position at a time.
	•	No pyramiding.
	•	No flipping within 5 minutes.

⸻

3. Risk Model

Stop: 1 ATR
Target: 2 ATR
Trailing stop activates at +1R
Max daily loss: 3R
Max 5 trades per UTC day
Position size: 1% account risk per trade

⸻

4. Meta Discipline Rules (Where TMOM Shines)

Hard Constraints:
	•	Block trade if daily loss ≥ 3R
	•	Block if > 5 trades
	•	Block if position size > 1% risk

Soft Guardrails:
	•	Warn if trade taken within 3 minutes of prior close
	•	Warn if volatility > 95th percentile
	•	Require justification if third consecutive loss

Cooldown:
	•	10 minutes after stop loss
	•	30 minutes after 2 consecutive losses`;

export function usePlaybook() {
  const [ruleInput, setRuleInput] = useState(SAMPLE_STRATEGY);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastPlaybookId, setLastPlaybookId] = useState<string | null>(null);

  const startStream = async (playbookId: string) => {
    try {
      const session = await sessionApi.startSession({
        user_id: CONFIG.USER_ID,
        playbook_id: playbookId
      });
      setActiveSession(session);
      setIsStreaming(true);
      setNotification({ type: 'success', message: 'Session started. Recording events...' });
      return session;
    } catch (error: unknown) {
      console.error('Failed to start session:', error);
      setNotification({ type: 'error', message: `Failed to start session: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const stopStream = async () => {
    if (!activeSession) return;
    try {
      await sessionApi.endSession(activeSession.id, { status: SessionStatus.COMPLETED });
      setActiveSession(null);
      setIsStreaming(false);
      setNotification({ type: 'success', message: 'Session completed and saved.' });
    } catch (error: unknown) {
      setNotification({ type: 'error', message: `Failed to stop session: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const submitStrategy = async () => {
    if (!ruleInput.trim()) return;
    
    setIsSubmitting(true);
    setNotification(null);

    try {
        const playbook = await playbookApi.createPlaybook({
          name: `Playbook ${new Date().toLocaleTimeString()}`,
          user_id: CONFIG.USER_ID,
          original_nl_input: ruleInput
        });

        // Final step: trigger the newly created playbook in the rule engine
        await playbookApi.triggerPlaybook(CONFIG.USER_ID, playbook.id);
        
        setLastPlaybookId(playbook.id);
        setRuleInput(''); // Clear on success
        setNotification({ type: 'success', message: 'Strategy playbook successfully created and triggered!' });
        
        // Auto-dismiss success notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
    } catch (error: unknown) {
        console.error('Failed to create playbook:', error);
        setNotification({ type: 'error', message: `Failed to deploy strategy: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
        setIsSubmitting(false);
    }
  };

  return {
    ruleInput,
    setRuleInput,
    isSubmitting,
    notification,
    setNotification,
    submitStrategy,
    activeSession,
    isStreaming,
    startStream,
    stopStream,
    lastPlaybookId
  };
}

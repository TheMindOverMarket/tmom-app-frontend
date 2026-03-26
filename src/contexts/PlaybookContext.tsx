import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { playbookApi } from '../domain/playbook/api';
import { Playbook } from '../domain/playbook/types';
import { sessionApi } from '../domain/session/api';
import { Session, SessionStatus } from '../domain/session/types';
import { CONFIG } from '../config/constants';

interface PlaybookContextType {
  strategyInput: string;
  setStrategyInput: (val: string) => void;
  isSubmitting: boolean;
  notification: { type: 'success' | 'error'; message: string } | null;
  setNotification: (val: { type: 'success' | 'error'; message: string } | null) => void;
  submitStrategy: () => Promise<Playbook | undefined>;
  playbooks: Playbook[];
  selectedPlaybook: Playbook | null;
  isLoadingPlaybooks: boolean;
  fetchPlaybooks: () => Promise<void>;
  activatePlaybook: (pb: Playbook) => Promise<void>;
  activeSession: Session | null;
  isStreaming: boolean;
  startStream: (playbookId: string) => Promise<Session | undefined>;
  stopStream: () => Promise<void>;
}

const PlaybookContext = createContext<PlaybookContextType | undefined>(undefined);

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

export function PlaybookProvider({ children }: { children: ReactNode }) {
  const [strategyInput, setStrategyInput] = useState(SAMPLE_STRATEGY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isLoadingPlaybooks, setIsLoadingPlaybooks] = useState(false);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Fetch Playbooks
  const fetchPlaybooks = useCallback(async () => {
    setIsLoadingPlaybooks(true);
    try {
      console.log(`Fetching playbooks for user: ${CONFIG.USER_ID}`);
      const data = await playbookApi.listUserPlaybooks(CONFIG.USER_ID);
      console.log(`Fetched ${data.length} playbooks:`, data);
      setPlaybooks(data);
      
      // Auto-select the one active in the DB on initial load
      const activeInDb = data.find(pb => pb.is_active);
      if (activeInDb) {
        setSelectedPlaybook(activeInDb);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch playbooks:', error);
    } finally {
      setIsLoadingPlaybooks(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaybooks();
  }, [fetchPlaybooks]);

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
    if (!strategyInput.trim()) return;
    
    setIsSubmitting(true);
    setNotification(null);

    try {
        const playbook = await playbookApi.createPlaybook({
          name: `Playbook ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          user_id: CONFIG.USER_ID,
          original_nl_input: strategyInput
        });

        await playbookApi.triggerPlaybook(CONFIG.USER_ID, playbook.id);
        
        await fetchPlaybooks();
        await activatePlaybook(playbook);
        setStrategyInput(''); 
        setNotification({ type: 'success', message: 'Strategy playbook successfully created and activated!' });
        
        setTimeout(() => setNotification(null), 5000);
        return playbook;
    } catch (error: unknown) {
        console.error('Failed to create playbook:', error);
        setNotification({ type: 'error', message: `Failed to deploy strategy: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
        setIsSubmitting(false);
    }
  };

  const activatePlaybook = async (pb: Playbook) => {
    try {
      // 1. Deactivate current active playbook in DB if it exists
      if (selectedPlaybook && selectedPlaybook.id !== pb.id) {
        await playbookApi.updatePlaybook(selectedPlaybook.id, { is_active: false });
      }
      
      // 2. Activate new one in DB
      await playbookApi.updatePlaybook(pb.id, { is_active: true });
      
      // 3. Update local state and refresh list
      setSelectedPlaybook(pb);
      await fetchPlaybooks();
      setNotification({ type: 'success', message: `Playbook "${pb.name}" is now active.` });
    } catch (error: unknown) {
      console.error('Failed to activate playbook:', error);
      setNotification({ type: 'error', message: `Failed to sync active state: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const value = {
    strategyInput, setStrategyInput,
    isSubmitting, notification, setNotification,
    submitStrategy, playbooks, selectedPlaybook,
    isLoadingPlaybooks, fetchPlaybooks, activatePlaybook,
    activeSession, isStreaming, startStream, stopStream
  };

  return <PlaybookContext.Provider value={value}>{children}</PlaybookContext.Provider>;
}

export function usePlaybookContext() {
  const context = useContext(PlaybookContext);
  if (context === undefined) {
    throw new Error('usePlaybookContext must be used within a PlaybookProvider');
  }
  return context;
}

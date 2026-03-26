import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { playbookApi } from '../domain/playbook/api';
import { Playbook } from '../domain/playbook/types';
import { sessionApi } from '../domain/session/api';
import { Session, SessionStatus } from '../domain/session/types';
import { CONFIG } from '../config/constants';

interface PlaybookContextType {
  playbookInput: string;
  setPlaybookInput: (val: string) => void;
  isSubmitting: boolean;
  notification: { type: 'success' | 'error'; message: string } | null;
  setNotification: (val: { type: 'success' | 'error'; message: string } | null) => void;
  createPlaybookFromNL: () => Promise<Playbook | undefined>;
  playbooks: Playbook[];
  selectedPlaybook: Playbook | null;
  setSelectedPlaybook: (pb: Playbook | null) => void;
  isLoadingPlaybooks: boolean;
  fetchPlaybooks: () => Promise<void>;
  activatePlaybook: (pb: Playbook) => Promise<void>;
  activeSession: Session | null;
  isStreaming: boolean;
  isStartingStream: boolean;
  isStoppingStream: boolean;
  startStream: (playbookId: string) => Promise<Session | undefined>;
  stopStream: () => Promise<void>;
  rules: any[]; 
}

const PlaybookContext = createContext<PlaybookContextType | undefined>(undefined);

const SAMPLE_PLAYBOOK = `I’m using BTC.
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
  const [playbookInput, setPlaybookInput] = useState(SAMPLE_PLAYBOOK);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [rules, setRules] = useState<any[]>([]); // Added rule state
  const [isLoadingPlaybooks, setIsLoadingPlaybooks] = useState(false);

  // Polling logic for pending playbooks
  useEffect(() => {
    let pollInterval: number | null = null;

    const poll = async () => {
      if (!selectedPlaybook) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

      // If we don't even have the field in our domain yet (legacy backend), 
      // we should eventually stop polling to avoid infinite loops.
      if (selectedPlaybook.generation_status === undefined) {
          if (pollInterval) clearInterval(pollInterval);
          return;
      }

      if (selectedPlaybook.generation_status !== 'PENDING') {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

      try {
        const updated = await playbookApi.getPlaybook(selectedPlaybook.id);
        
        // Resilience: If backend hasn't deployed the field yet, but we are in a pending state locally
        const status = updated.generation_status || 'COMPLETED'; 

        if (status === 'COMPLETED') {
          setSelectedPlaybook(updated);
          const newRules = await playbookApi.listPlaybookRules(updated.id);
          setRules(newRules);
          
          const data = await playbookApi.listUserPlaybooks(CONFIG.USER_ID);
          setPlaybooks(data);
          
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (e) {
        console.error('Polling failed:', e);
      }
    };

    if (selectedPlaybook?.generation_status === 'PENDING') {
      pollInterval = window.setInterval(poll, 3000); 
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [selectedPlaybook]);

  // Load rules when selected playbook changes and is already completed
  useEffect(() => {
    if (selectedPlaybook && selectedPlaybook.generation_status === 'COMPLETED') {
      playbookApi.listPlaybookRules(selectedPlaybook.id)
        .then(setRules)
        .catch(console.error);
    } else if (selectedPlaybook?.generation_status !== 'PENDING') {
      setRules([]);
    }
  }, [selectedPlaybook]);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isStartingStream, setIsStartingStream] = useState(false);
  const [isStoppingStream, setIsStoppingStream] = useState(false);

  // Fetch Playbooks
  const fetchPlaybooks = useCallback(async () => {
    setIsLoadingPlaybooks(true);
    try {
      const data = await playbookApi.listUserPlaybooks(CONFIG.USER_ID);
      
      // Sort: Active first, then by date descending
      const sorted = [...data].sort((a, b) => {
        if (a.is_active) return -1;
        if (b.is_active) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log(`Fetched and sorted ${sorted.length} playbooks.`);
      setPlaybooks(sorted);
      
      // Only auto-select the one active in the DB if we don't have a selection yet
      const activeInDb = sorted.find(pb => pb.is_active);
      if (activeInDb && !selectedPlaybook) {
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
    setIsStartingStream(true);
    setNotification(null);
    try {
      // 1. Hard Guard: Integrity Check
      const data = await playbookApi.getPlaybook(playbookId);
      if (data.generation_status !== 'COMPLETED') {
        throw new Error('This strategy is still being analyzed by the AI. Please wait for the analysis to complete (Approx 30s) before starting a live session.');
      }

      // 2. Safety Cleanup
      if (activeSession) {
        console.warn(`[PlaybookContext] Terminating existing session ${activeSession.id} before starting new one.`);
        await stopStream();
      }

      const session = await sessionApi.startSession({
        user_id: CONFIG.USER_ID,
        playbook_id: playbookId
      });
      
      setActiveSession(session);
      setIsStreaming(true);
      setNotification({ type: 'success', message: 'New session started. Previous session (if any) has been finalized.' });
      return session;
    } catch (error: unknown) {
      console.error('Failed to start session:', error);
      setNotification({ type: 'error', message: `Failed to start session: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsStartingStream(false);
    }
  };

  const stopStream = async () => {
    if (!activeSession) return;
    setIsStoppingStream(true);
    try {
      // Update session status in the DB
      await sessionApi.endSession(activeSession.id, { status: SessionStatus.COMPLETED });
      
      setActiveSession(null);
      setIsStreaming(false);
      setNotification({ type: 'success', message: 'Session completed and saved.' });
    } catch (error: unknown) {
      setNotification({ type: 'error', message: `Failed to stop session: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsStoppingStream(false);
    }
  };

  const createPlaybookFromNL = async () => {
    if (!playbookInput.trim()) return;
    
    setIsSubmitting(true);
    setNotification(null);

    try {
        const playbook = await playbookApi.createPlaybook({
          name: `Playbook ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          user_id: CONFIG.USER_ID,
          original_nl_input: playbookInput,
          is_active: true
        });

        await fetchPlaybooks();
        setSelectedPlaybook(playbook);
        
        setPlaybookInput(''); 
        setNotification({ type: 'success', message: 'Playbook successfully created and activated!' });
        
        setTimeout(() => setNotification(null), 5000);
        return playbook;
    } catch (error: unknown) {
        console.error('Failed to create playbook:', error);
        setNotification({ type: 'error', message: `Failed to deploy playbook: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
        setIsSubmitting(false);
    }
  };

  const activatePlaybook = async (pb: Playbook) => {
    try {
      // The backend now handles atomic deactivation of other playbooks 
      // when a new one is set to active. We only need one single call.
      await playbookApi.updatePlaybook(pb.id, { is_active: true });
      
      // Update local state and refresh the library list to sync with backend
      setSelectedPlaybook(pb);
      await fetchPlaybooks();
      
      setNotification({ type: 'success', message: `Playbook "${pb.name}" is now the active strategy.` });
    } catch (error: unknown) {
      console.error('Failed to activate playbook:', error);
      setNotification({ type: 'error', message: `Failed to activate strategy: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const value = {
    playbookInput, setPlaybookInput,
    isSubmitting, notification, setNotification,
    createPlaybookFromNL, playbooks, selectedPlaybook, setSelectedPlaybook,
    isLoadingPlaybooks, fetchPlaybooks, activatePlaybook,
    activeSession, isStreaming, isStartingStream, isStoppingStream, startStream, stopStream,
    rules
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

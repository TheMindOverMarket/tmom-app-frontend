import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { playbookApi } from '../domain/playbook/api';
import { MarketOption, Playbook } from '../domain/playbook/types';
import { sessionApi } from '../domain/session/api';
import { Session, SessionStatus } from '../domain/session/types';
import { useUserSession } from './UserSessionContext';
import { CONFIG } from '../config/constants';

interface PlaybookContextType {
  playbookInput: string;
  setPlaybookInput: (val: string) => void;
  selectedMarket: string;
  setSelectedMarket: (val: string) => void;
  availableMarkets: MarketOption[];
  isLoadingMarkets: boolean;
  isSubmitting: boolean;
  notification: { type: 'success' | 'error'; message: string } | null;
  setNotification: (val: { type: 'success' | 'error'; message: string } | null) => void;
  createPlaybookFromNL: () => Promise<Playbook | undefined>;
  chatWithSystem: (message: string) => Promise<Playbook | undefined>;
  playbooks: Playbook[];
  selectedPlaybook: Playbook | null;
  setSelectedPlaybook: (pb: Playbook | null) => void;
  isLoadingPlaybooks: boolean;
  fetchPlaybooks: () => Promise<void>;
  activatePlaybook: (pb: Playbook) => Promise<void>;
  activeSession: Session | null;
  isStreaming: boolean;
  streamingMessage: string;
  isStartingStream: boolean;
  isStoppingStream: boolean;
  startStream: (playbookId: string) => Promise<Session | undefined>;
  stopStream: () => Promise<void>;
  deletePlaybook: (id: string) => Promise<void>;
  deleteAllPlaybooks: () => Promise<void>;
  setIsSubmitting: (val: boolean) => void;
  
  // Draft / Stateless Management
  draftChatHistory: any[];
  currentDraft: any | null;
  setDraftChatHistory: (val: any[]) => void;
  setCurrentDraft: (val: any | null) => void;
  resetDraft: () => void;
  finalizePlaybook: () => Promise<Playbook | undefined>;
  playbookName: string;
  setPlaybookName: (val: string) => void;
  renamePlaybook: (id: string, name: string) => Promise<void>;
}

const PlaybookContext = createContext<PlaybookContextType | undefined>(undefined);

export function PlaybookProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUserSession();
  const [selectedMarket, setSelectedMarket] = useState('');
  const [availableMarkets, setAvailableMarkets] = useState<MarketOption[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [playbookInput, setPlaybookInput] = useState('');
  const [playbookName, setPlaybookName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isLoadingPlaybooks, setIsLoadingPlaybooks] = useState(false);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isStartingStream, setIsStartingStream] = useState(false);
  const [isStoppingStream, setIsStoppingStream] = useState(false);

  // Draft State
  const [draftChatHistory, setDraftChatHistory] = useState<any[]>([]);
  const [currentDraft, setCurrentDraft] = useState<any | null>(null);

  const buildSamplePlaybook = useCallback((market: string) => `I’m using ${market.split('/')[0]}.
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
	•	30 minutes after 2 consecutive losses`, []);

  const fetchPlaybooks = useCallback(async () => {
    if (!currentUser) {
      setPlaybooks([]);
      setSelectedPlaybook(null);
      setIsLoadingPlaybooks(false);
      return;
    }

    setIsLoadingPlaybooks(true);
    try {
      const data = await playbookApi.listUserPlaybooks(currentUser.id);
      const sorted = [...data].sort((a, b) => {
        if (a.is_active) return -1;
        if (b.is_active) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const filtered = sorted.filter(pb => pb.generation_status !== 'INITIALIZING');
      setPlaybooks(filtered);
      
      const activeInDb = sorted.find(pb => pb.is_active);
      setSelectedPlaybook(prev => {
        if (!prev) {
          return activeInDb ?? null;
        }

        const updatedSelection = filtered.find((pb) => pb.id === prev.id);
        return updatedSelection ?? activeInDb ?? null;
      });
    } catch (error: unknown) {
      console.error('Failed to fetch playbooks:', error);
      setNotification({
        type: 'error',
        message: `Failed to load playbooks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoadingPlaybooks(false);
    }
  }, [currentUser]);

  const handleStream = useCallback(async (playbookId: string) => {
    setStreamingMessage('');
    try {
      const response = await fetch(`${CONFIG.BACKEND_BASE_URL}/playbooks/${playbookId}/stream`);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Stream start failed:', errData);
        return;
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulated += chunk;
        setStreamingMessage(accumulated);
      }
      
      await fetchPlaybooks();
      const updated = await playbookApi.getPlaybook(playbookId);
      setSelectedPlaybook(updated);
    } catch (e) {
      console.error('Streaming failed:', e);
    } finally {
      setStreamingMessage('');
    }
  }, [fetchPlaybooks]);

  useEffect(() => {
    let cancelled = false;

    const loadMarkets = async () => {
      setIsLoadingMarkets(true);
      try {
        const markets = await playbookApi.listMarkets();
        if (!cancelled && markets.length > 0) {
          setAvailableMarkets(markets);
          if (!selectedMarket || !markets.some((market) => market.symbol === selectedMarket)) {
            setSelectedMarket(markets[0].symbol);
          }
        }
      } catch (error) {
        console.error('Failed to fetch markets:', error);
        if (!cancelled) {
          setAvailableMarkets([]);
          setSelectedMarket('');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMarkets(false);
        }
      }
    };

    void loadMarkets();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedMarket) {
      return;
    }
    const nextTemplate = buildSamplePlaybook(selectedMarket);
    setPlaybookInput((current) => {
      const matchesExistingTemplate =
        !current.trim() || availableMarkets.some((market) => current === buildSamplePlaybook(market.symbol));
      return matchesExistingTemplate ? nextTemplate : current;
    });

    setPlaybookName((current) => {
      const defaultName = `${selectedMarket.split('/')[0]} Playbook`;
      return !current || current.includes('Playbook') ? defaultName : current;
    });
  }, [selectedMarket, availableMarkets, buildSamplePlaybook]);

  useEffect(() => {
    let pollInterval: number | null = null;

    const poll = async () => {
      if (!selectedPlaybook) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

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
        const status = updated.generation_status || 'COMPLETED'; 

        if (status === 'COMPLETED' || status === 'FAILED' || status === 'INCOMPLETE' || status === 'INITIALIZING') {
          setSelectedPlaybook(updated);
          
          await fetchPlaybooks();
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
  }, [selectedPlaybook, fetchPlaybooks]);

  useEffect(() => {
    void fetchPlaybooks();
  }, [fetchPlaybooks]);

  useEffect(() => {
    let cancelled = false;

    const restoreActiveSession = async () => {
      if (!currentUser) {
        return;
      }

      try {
        const sessions = await sessionApi.listSessions(currentUser.id);
        if (cancelled) {
          return;
        }

        const liveSession = sessions
          .filter((session) => session.status === SessionStatus.STARTED)
          .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())[0];

        setActiveSession(liveSession ?? null);
        setIsStreaming(Boolean(liveSession));
      } catch (error) {
        console.error('Failed to restore active session:', error);
      }
    };

    void restoreActiveSession();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    setSelectedPlaybook(null);
    setActiveSession(null);
    setIsStreaming(false);
    setDraftChatHistory([]);
    setCurrentDraft(null);
  }, [currentUser?.id]);

  // LocalStorage Sync
  useEffect(() => {
    if (!currentUser) return;
    const key = `tmom_strategy_draft_${currentUser.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const { chatHistory, draft, market } = JSON.parse(saved);
        if (chatHistory) setDraftChatHistory(chatHistory);
        if (draft) setCurrentDraft(draft);
        if (market) setSelectedMarket(market);
      } catch (e) {
        console.error('Failed to restore draft from localStorage:', e);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = `tmom_strategy_draft_${currentUser.id}`;
    if (draftChatHistory.length > 0 || currentDraft || selectedMarket) {
      localStorage.setItem(key, JSON.stringify({
        chatHistory: draftChatHistory,
        draft: currentDraft,
        market: selectedMarket
      }));
    } else {
      localStorage.removeItem(key);
    }
  }, [draftChatHistory, currentDraft, selectedMarket, currentUser]);



  const resetDraft = useCallback(() => {
    setDraftChatHistory([]);
    setCurrentDraft(null);
    setStreamingMessage('');
    setIsSubmitting(false);
  }, []);

  const startStream = async (playbookId: string) => {
    if (!currentUser) return;

    setIsStartingStream(true);
    setNotification(null);
    try {
      const session = await sessionApi.startSession({
        user_id: currentUser.id,
        playbook_id: playbookId
      });
      
      setActiveSession(session);
      setIsStreaming(true);
      setNotification({ type: 'success', message: 'New session started.' });
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
      await sessionApi.endSession(activeSession.id, { status: SessionStatus.COMPLETED });
      setActiveSession(null);
      setIsStreaming(false);
      setNotification({ type: 'success', message: 'Session completed.' });
    } catch (error: unknown) {
      setNotification({ type: 'error', message: `Failed to stop session: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsStoppingStream(false);
    }
  };

  const createPlaybookFromNL = async () => {
    if (!playbookInput.trim() || !currentUser || !selectedMarket) return;
    
    setIsSubmitting(true);
    setNotification(null);

    try {
        const defaultName = `${selectedMarket.split('/')[0]} Playbook ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const playbook = await playbookApi.ingestPlaybook({
          name: playbookName || defaultName,
          user_id: currentUser.id,
          symbol: selectedMarket,
          market: selectedMarket,
          original_nl_input: playbookInput,
          is_active: true
        });

        await fetchPlaybooks();
        setSelectedPlaybook(playbook);
        setPlaybookInput('');
        setPlaybookName('');
        void handleStream(playbook.id);
        return playbook;
    } catch (error: unknown) {
        console.error('Failed to create playbook:', error);
        setNotification({ type: 'error', message: `Failed to deploy playbook: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
        setIsSubmitting(false);
    }
  };

  const chatWithSystem = async (message: string) => {
    if (!message.trim() || (!selectedPlaybook && draftChatHistory.length === 0 && !playbookInput)) return;
    
    setIsSubmitting(true);
    setNotification(null);
    setStreamingMessage('');

    try {
        let finalMessage = message;
        if (draftChatHistory.length === 0 && selectedMarket && !selectedPlaybook) {
            finalMessage = `I want to trade ${selectedMarket}.\n\nMy playbook:\n${message}`;
        }
        const history = [...draftChatHistory, { role: 'user', content: finalMessage }];
        setDraftChatHistory(history);

        if (selectedPlaybook) {
            // Archived/Existing playbook chat
            const updated = await playbookApi.chatPlaybook(selectedPlaybook.id, message);
            setSelectedPlaybook(updated);
            await fetchPlaybooks();
            void handleStream(selectedPlaybook.id);
            return updated;
        } else {
            // New strategy draft chat (Stateless)
            // Get the full parsed playbook preview immediately (bypassing JSON-based stream tokenization)
            const preview = await fetch(`${CONFIG.BACKEND_BASE_URL}/playbooks/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_history: history })
            }).then(res => res.json());

            setCurrentDraft(preview);
            if (preview.dialogue) {
               setDraftChatHistory([...history, { role: 'assistant', content: preview.dialogue }]);
            }
        }
    } catch (error: unknown) {
        console.error('Failed to send message:', error);
        setNotification({ type: 'error', message: `Failed to communicate: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
        setIsSubmitting(false);
        setStreamingMessage('');
    }
  };

  const finalizePlaybook = async () => {
    if (!currentUser || !currentDraft || !selectedMarket) return;
    
    setIsSubmitting(true);
    try {
        const defaultName = `${selectedMarket.split('/')[0]} Playbook ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const playbook = await playbookApi.ingestPlaybook({
          name: playbookName || defaultName,
          user_id: currentUser.id,
          symbol: selectedMarket,
          market: selectedMarket,
          original_nl_input: draftChatHistory[0]?.content || '',
          chat_history: draftChatHistory,
          is_active: true
        });

        await fetchPlaybooks();
        setSelectedPlaybook(playbook);
        resetDraft();
        setPlaybookName('');
        setNotification({ type: 'success', message: 'Playbook deployed and archived.' });
        return playbook;
    } catch (error: unknown) {
        console.error('Failed to finalize playbook:', error);
        setNotification({ type: 'error', message: 'Failed to deploy playbook.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const activatePlaybook = async (pb: Playbook) => {
    try {
      await playbookApi.updatePlaybook(pb.id, { is_active: true });
      setSelectedPlaybook(pb);
      await fetchPlaybooks();
      setNotification({ type: 'success', message: `Playbook "${pb.name}" is now active.` });
    } catch (error: unknown) {
      console.error('Failed to activate playbook:', error);
      setNotification({ type: 'error', message: `Failed to activate: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const deletePlaybook = async (id: string) => {
    try {
      await playbookApi.deletePlaybook(id);
      if (selectedPlaybook?.id === id) setSelectedPlaybook(null);
      await fetchPlaybooks();
      setNotification({ type: 'success', message: 'Playbook deleted.' });
    } catch (error: unknown) {
      console.error('Failed to delete playbook:', error);
      setNotification({ type: 'error', message: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const deleteAllPlaybooks = async () => {
    if (!currentUser) return;

    try {
      await playbookApi.deleteAllPlaybooks(currentUser.id);
      setSelectedPlaybook(null);
      await fetchPlaybooks();
      setNotification({ type: 'success', message: 'All playbooks deleted.' });
    } catch (error: unknown) {
      console.error('Failed to delete all playbooks:', error);
      setNotification({ type: 'error', message: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const renamePlaybook = async (id: string, name: string) => {
    try {
      await playbookApi.updatePlaybook(id, { name });
      await fetchPlaybooks();
      setNotification({ type: 'success', message: `Playbook renamed to "${name}".` });
    } catch (error: unknown) {
      console.error('Failed to rename playbook:', error);
      setNotification({ type: 'error', message: `Failed to rename: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const value = {
    playbookInput, setPlaybookInput,
    selectedMarket, setSelectedMarket,
    availableMarkets, isLoadingMarkets,
    isSubmitting, notification, setNotification,
    createPlaybookFromNL, chatWithSystem, playbooks, selectedPlaybook, setSelectedPlaybook,
    isLoadingPlaybooks, fetchPlaybooks, activatePlaybook,
    activeSession, isStreaming, streamingMessage, isStartingStream, isStoppingStream, startStream, stopStream,
    deletePlaybook,
    deleteAllPlaybooks,
    setIsSubmitting,
    draftChatHistory,
    currentDraft,
    setDraftChatHistory,
    setCurrentDraft,
    resetDraft,
    finalizePlaybook,
    playbookName,
    setPlaybookName,
    renamePlaybook
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

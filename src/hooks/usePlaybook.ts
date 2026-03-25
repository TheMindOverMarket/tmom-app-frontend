import { useState } from 'react';
import { playbookApi } from '../domain/playbook/api';
import { sessionApi } from '../domain/session/api';
import { Session, SessionStatus } from '../domain/session/types';
import { CONFIG } from '../config/constants';

export function usePlaybook() {
  const [ruleInput, setRuleInput] = useState('');
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

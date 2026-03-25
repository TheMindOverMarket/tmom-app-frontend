import { useState } from 'react';
import { playbookApi } from '../domain/playbook/api';
import { CONFIG } from '../config/constants';

export function usePlaybook() {
  const [ruleInput, setRuleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

        setRuleInput(''); // Clear on success
        setNotification({ type: 'success', message: 'Strategy playbook successfully created and triggered!' });
        
        // Auto-dismiss success notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
        console.error('Failed to create playbook:', error);
        setNotification({ type: 'error', message: `Failed to deploy strategy: ${error.message || 'Unknown error'}` });
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
    submitStrategy
  };
}

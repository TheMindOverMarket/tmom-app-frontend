import { Playbook, PlaybookCreate } from './types';

const API_BASE = 'https://tmom-app-backend.onrender.com';

export const playbookApi = {
  createPlaybook: async (data: PlaybookCreate): Promise<Playbook> => {
    const response = await fetch(`${API_BASE}/playbooks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to create playbook';
      try {
        const err = await response.json();
        errorMessage = err.detail?.[0]?.msg || err.detail || 'Failed to create playbook';
      } catch (e) {
        // Fallback if response is not JSON
        const text = await response.text();
        errorMessage = text || 'Internal Server Error';
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  listUserPlaybooks: async (userId: string): Promise<Playbook[]> => {
    const response = await fetch(`${API_BASE}/users/${userId}/playbooks`);
    if (!response.ok) throw new Error('Failed to list playbooks');
    return response.json();
  },

  getPlaybook: async (id: string): Promise<Playbook> => {
    const response = await fetch(`${API_BASE}/playbooks/${id}`);
    if (!response.ok) throw new Error('Failed to get playbook');
    return response.json();
  },

  triggerPlaybook: async (userId: string, playbookId: string): Promise<void> => {
    const response = await fetch(`https://rule-engine-rcg9.onrender.com/api/rules/trigger?user_id=${userId}&playbook_id=${playbookId}`);
    if (!response.ok) {
      let errorMessage = 'Failed to trigger playbook in rule engine';
      try {
        const err = await response.json();
        errorMessage = err.detail?.[0]?.msg || err.detail || 'Failed to trigger playbook in rule engine';
      } catch (e) {
        const text = await response.text();
        errorMessage = text || 'Internal Server Error';
      }
      throw new Error(errorMessage);
    }
  }
};

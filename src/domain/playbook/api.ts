import { CONFIG } from '../../config/constants';
import { Playbook, PlaybookCreate } from './types';

const API_BASE = CONFIG.BACKEND_BASE_URL;

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

  ingestPlaybook: async (data: PlaybookCreate): Promise<Playbook> => {
    const response = await fetch(`${API_BASE}/playbooks/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to ingest playbook';
      try {
        const err = await response.json();
        errorMessage = err.detail?.[0]?.msg || err.detail || 'Failed to ingest playbook';
      } catch (e) {
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

  updatePlaybook: async (id: string, data: Partial<Playbook>): Promise<Playbook> => {
    const response = await fetch(`${API_BASE}/playbooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to update playbook';
      try {
        const err = await response.json();
        errorMessage = err.detail?.[0]?.msg || err.detail || 'Failed to update playbook';
      } catch (e) {
        const text = await response.text();
        errorMessage = text || 'Internal Server Error';
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  compilePlaybook: async (playbookId: string): Promise<void> => {
    const response = await fetch(`${CONFIG.ENGINE_BASE_URL}/api/rules/compile?playbook_id=${playbookId}`, {
      method: 'POST'
    });
    if (!response.ok) {
      let errorMessage = 'Failed to compile playbook in rule engine';
      try {
        const err = await response.json();
        errorMessage = err.detail?.[0]?.msg || err.detail || errorMessage;
      } catch (e) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  executePlaybook: async (playbookId: string): Promise<void> => {
    const response = await fetch(`${CONFIG.ENGINE_BASE_URL}/api/rules/execute?playbook_id=${playbookId}`, {
      method: 'POST'
    });
    if (!response.ok) {
      let errorMessage = 'Failed to execute playbook in rule engine';
      try {
        const err = await response.json();
        errorMessage = err.detail?.[0]?.msg || err.detail || errorMessage;
      } catch (e) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  stopPlaybook: async (playbookId: string): Promise<void> => {
    const response = await fetch(`${CONFIG.ENGINE_BASE_URL}/api/rules/stop?playbook_id=${playbookId}`);
    if (!response.ok) {
      let errorMessage = 'Failed to stop playbook in rule engine';
      try {
        const err = await response.json();
        errorMessage = err.detail?.[0]?.msg || err.detail || errorMessage;
      } catch (e) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }
};

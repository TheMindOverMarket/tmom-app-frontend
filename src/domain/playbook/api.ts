import { CONFIG } from '../../config/constants';
import { Playbook, PlaybookCreate } from './types';

const API_BASE = CONFIG.BACKEND_BASE_URL;

const parsePlaybookError = async (response: Response, fallbackMessage: string): Promise<string> => {
  try {
    const err = await response.json();
    return err.detail?.[0]?.msg || err.detail || fallbackMessage;
  } catch (e) {
    const text = await response.text();
    return text || 'Internal Server Error';
  }
};

const postPlaybook = async (path: string, data: PlaybookCreate, fallbackMessage: string): Promise<Response> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await parsePlaybookError(response, fallbackMessage);
    throw new Error(errorMessage);
  }

  return response;
};

export const playbookApi = {
  createPlaybook: async (data: PlaybookCreate): Promise<Playbook> => {
    const response = await postPlaybook('/playbooks/', data, 'Failed to create playbook');
    return response.json();
  },

  ingestPlaybook: async (data: PlaybookCreate): Promise<Playbook> => {
    try {
      const response = await postPlaybook('/playbooks/ingest', data, 'Failed to ingest playbook');
      return response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const shouldFallback =
        message === 'Method Not Allowed' ||
        message === 'Not Found' ||
        message.includes('405') ||
        message.includes('404');

      if (!shouldFallback) {
        throw error;
      }

      const response = await postPlaybook('/playbooks/', data, 'Failed to create playbook');
      return response.json();
    }
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

  listPlaybookRules: async (playbookId: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/playbooks/${playbookId}/rules`);
    if (!response.ok) throw new Error('Failed to list playbook rules');
    return response.json();
  },

  deletePlaybook: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/playbooks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete playbook');
  }
};

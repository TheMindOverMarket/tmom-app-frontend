import { CONFIG } from '../../config/constants';
import { safeFetch } from '../../utils/apiUtils';
import { 
  Session, 
  SessionCreate, 
  SessionUpdate, 
  SessionEvent, 
  SessionEventCreate 
} from './types';

const API_BASE = CONFIG.BACKEND_BASE_URL;

export const sessionApi = {
  startSession: async (data: SessionCreate): Promise<Session> => {
    const response = await safeFetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to start session');
    }
    return response.json();
  },

  endSession: async (sessionId: string, data: SessionUpdate): Promise<Session> => {
    const response = await safeFetch(`${API_BASE}/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to end session');
    }
    return response.json();
  },

  listSessions: async (userId?: string): Promise<Session[]> => {
    // Note: check the backend router for 'sessions' (plural) and trailing slashes
    const url = userId ? `${API_BASE}/sessions/?user_id=${userId}` : `${API_BASE}/sessions/`;
    const response = await safeFetch(url);
    if (!response.ok) throw new Error('Failed to list sessions');
    return response.json();
  },

  getSessionReplay: async (sessionId: string): Promise<SessionEvent[]> => {
    const response = await safeFetch(`${API_BASE}/sessions/${sessionId}/replay`);
    if (!response.ok) throw new Error('Failed to get session replay');
    return response.json();
  },

  addSessionEvent: async (sessionId: string, data: SessionEventCreate): Promise<SessionEvent> => {
    const response = await safeFetch(`${API_BASE}/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to add session event');
    }
    return response.json();
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    const response = await safeFetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let detail = 'Failed to delete session';
      try {
        const err = await response.json();
        detail = err.detail || detail;
      } catch (e) {
        // Fallback to generic if not JSON
      }
      throw new Error(detail);
    }
  }
};

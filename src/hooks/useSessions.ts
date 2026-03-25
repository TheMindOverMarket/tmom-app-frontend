import { useState, useEffect, useCallback } from 'react';
import { Session, SessionEvent } from '../domain/session/types';
import { sessionApi } from '../domain/session/api';
import { CONFIG } from '../config/constants';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replayEvents, setReplayEvents] = useState<SessionEvent[]>([]);
  const [loadingReplay, setLoadingReplay] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionApi.listSessions(CONFIG.USER_ID);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReplay = useCallback(async (sessionId: string) => {
    setLoadingReplay(true);
    setError(null);
    try {
      const events = await sessionApi.getSessionReplay(sessionId);
      setReplayEvents(events);
    } catch (err: any) {
      setError(err.message || 'Failed to load replay');
    } finally {
      setLoadingReplay(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    replayEvents,
    loadingReplay,
    fetchSessions,
    loadReplay
  };
}

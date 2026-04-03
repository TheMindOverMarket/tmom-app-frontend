import { useState, useEffect, useCallback } from 'react';
import { Session, SessionEvent } from '../domain/session/types';
import { sessionApi } from '../domain/session/api';
import { useUserSession } from '../contexts/UserSessionContext';

export function useSessions() {
  const { currentUser } = useUserSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [replayEvents, setReplayEvents] = useState<SessionEvent[]>([]);
  const [loadingReplay, setLoadingReplay] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setError(null);
      setSessions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await sessionApi.listSessions(currentUser.id);
      setSessions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const loadReplay = useCallback(async (sessionId: string) => {
    setLoadingReplay(true);
    setError(null);
    try {
      const events = await sessionApi.getSessionReplay(sessionId);
      setReplayEvents(events);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load replay');
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
    loadReplay,
    deleteSession: async (id: string) => {
      setDeleteError(null);
      try {
        await sessionApi.deleteSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
      } catch (err: unknown) {
        setDeleteError(err instanceof Error ? err.message : 'Failed to delete session');
      }
    },
    deleteError,
    clearDeleteError: () => setDeleteError(null)
  };
}

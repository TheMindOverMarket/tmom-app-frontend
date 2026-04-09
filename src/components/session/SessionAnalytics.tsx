import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSessions } from '../../hooks/useSessions';
import { Session, SessionStatus } from '../../domain/session/types';
import { SessionList } from './SessionList';
import { ReplayPlayer } from './ReplayPlayer';
import { RefreshButton } from '../common/RefreshButton';

export function SessionAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('user_id');
  const sessionIdParam = searchParams.get('session_id');
  const initialTab = searchParams.get('tab') === 'completed' ? 'completed' : 'all';

  const { 
    sessions, 
    loading, 
    error, 
    loadReplay, 
    replayEvents, 
    loadingReplay,
    fetchSessions,
    deleteSession,
    deleteError,
    clearDeleteError
  } = useSessions(userIdParam || undefined);
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState(sessionIdParam || '');
  const [activeTab, setActiveTab] = useState<'all' | 'completed'>(initialTab);
  const lastProcessedSessionId = useRef<string | null>(null);

  // Auto-select session if sessionIdParam is present and sessions are loaded
  useEffect(() => {
    if (sessionIdParam && sessions.length > 0 && sessionIdParam !== lastProcessedSessionId.current) {
      const session = sessions.find(s => s.id === sessionIdParam);
      if (session) {
        setSelectedSession(session);
        loadReplay(session.id);
        lastProcessedSessionId.current = sessionIdParam;
      }
    } else if (!sessionIdParam) {
      lastProcessedSessionId.current = null;
    }
  }, [sessionIdParam, sessions, loadReplay]);

  const stats = useMemo(() => ({
    total: sessions.length,
    completed: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
    recent: sessions.filter(s => {
      const start = new Date(s.start_time).getTime();
      return (Date.now() - start) < 24 * 60 * 60 * 1000;
    }).length
  }), [sessions]);

  const filteredSessions = useMemo(() => {
    let list = sessions;
    if (activeTab === 'completed') {
      list = list.filter(s => s.status === SessionStatus.COMPLETED);
    }
    return list.filter(s => s.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sessions, searchQuery, activeTab]);

  const handleSelectSession = async (session: Session) => {
    setSelectedSession(session);
    if (session.id) {
      await loadReplay(session.id);
    }
  };

  const closeModal = () => {
    setSelectedSession(null);
    lastProcessedSessionId.current = null; // Reset so it can be re-opened if the URL changes back/to something else
    // Clear the search params to prevent the auto-open effect from re-triggering
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('session_id');
    setSearchParams(newParams);
  };

  return (
    <div style={{
      padding: '32px',
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h2 style={{ 
            fontSize: '28px', 
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: '400', 
            margin: 0, 
            color: '#ffffff', 
            letterSpacing: '0.02em' 
          }}>
            Session Analytics
          </h2>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: 'var(--auth-text-muted)', 
            fontSize: '13px',
            fontFamily: "'Space Mono', monospace"
          }}>
            Quantify cost of deviation, evaluate playbook performance, and audit execution consistency.
          </p>
        </div>
        
        <RefreshButton 
          onRefresh={fetchSessions}
          isLoading={loading}
          isDark={true}
        />
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px', flexShrink: 0 }}>
        {[
          { label: 'Total Sessions', value: stats.total, color: 'var(--brand)' },
          { label: 'Completed Audit', value: stats.completed, color: 'var(--auth-accent)' },
          { label: 'Last 24 Hours', value: stats.recent, color: '#f59e0b' }
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px solid var(--auth-border)',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--auth-text-muted)', 
              marginBottom: '8px', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              fontFamily: "'Space Mono', monospace"
            }}>{stat.label}</div>
            {loading && sessions.length === 0 ? (
              <div style={{ fontSize: '32px', fontWeight: '400', color: 'rgba(255, 255, 255, 0.05)', animation: 'pulse 1.5s infinite', fontFamily: "'Space Mono', monospace" }}>...</div>
            ) : (
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '400', 
                color: '#ffffff',
                fontFamily: "'Space Mono', monospace"
              }}>{stat.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '40px', borderBottom: '1px solid var(--auth-border)', marginBottom: '32px', flexShrink: 0 }}>
        {[
          { id: 'all', label: 'All Sessions' },
          { id: 'completed', label: 'Completed Audit' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 0',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: "'Space Mono', monospace",
              color: activeTab === tab.id ? 'var(--auth-accent)' : 'var(--auth-text-muted)',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--auth-accent)' : 'transparent'}`,
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '32px', flexShrink: 0 }}>
        <input 
          type="text" 
          placeholder="FILTER BY SESSION ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: "'Space Mono', monospace",
            borderRadius: '4px',
            border: '1px solid var(--auth-border)',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            color: '#ffffff',
            outline: 'none',
            letterSpacing: '0.05em',
            transition: 'all 0.2s'
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--auth-border)'}
        />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
        {error && (
          <div style={{ padding: '24px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', marginBottom: '24px' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#ef4444', marginBottom: '6px', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>NETWORKING ERROR</div>
            <div style={{ fontSize: '14px', fontWeight: '800' }}>{error}</div>
          </div>
        )}

        {deleteError && (
          <div style={{ padding: '24px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', marginBottom: '24px', position: 'relative' }}>
            <button 
              onClick={clearDeleteError}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}
            >
              ×
            </button>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#ef4444', marginBottom: '6px', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>PURGE ERROR</div>
            <div style={{ fontSize: '14px', fontWeight: '800' }}>{deleteError}</div>
          </div>
        )}

        {!error && (
          <SessionList 
            sessions={filteredSessions} 
            onSelect={handleSelectSession} 
            onDelete={deleteSession}
            selectedId={selectedSession?.id} 
            isDark={true}
          />
        )}
      </div>

      {selectedSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }} onClick={closeModal}>
          <div style={{
            backgroundColor: 'var(--auth-black)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '1400px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 40px 120px -20px rgba(0, 0, 0, 0.8)',
            border: '1px solid var(--auth-border)'
          }} onClick={e => e.stopPropagation()}>
            <ReplayPlayer 
              session={selectedSession} 
              events={replayEvents} 
              loading={loadingReplay} 
              onClose={closeModal} 
              isDark={true}
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.7; } 100% { opacity: 0.3; } }
      ` }} />
    </div>
  );
}

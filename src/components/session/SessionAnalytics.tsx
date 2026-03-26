import { useState, useMemo } from 'react';
import { useSessions } from '../../hooks/useSessions';
import { Session, SessionStatus } from '../../domain/session/types';
import { SessionList } from './SessionList';
import { ReplayPlayer } from './ReplayPlayer';
import { RefreshButton } from '../common/RefreshButton';

export function SessionAnalytics() {
  const { 
    sessions, 
    loading, 
    error, 
    loadReplay, 
    replayEvents, 
    loadingReplay,
    fetchSessions
  } = useSessions();
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => ({
    total: sessions.length,
    completed: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
    recent: sessions.filter(s => {
      const start = new Date(s.start_time).getTime();
      return (Date.now() - start) < 24 * 60 * 60 * 1000;
    }).length
  }), [sessions]);

  const filteredSessions = useMemo(() => 
    sessions.filter(s => s.id.toLowerCase().includes(searchQuery.toLowerCase())),
    [sessions, searchQuery]
  );

  const handleSelectSession = async (session: Session) => {
    setSelectedSession(session);
    if (session.id) {
      await loadReplay(session.id);
    }
  };

  const closeModal = () => setSelectedSession(null);

  return (
    <div style={{
      padding: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      border: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Session Analytics
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1rem' }}>
            Quantify cost of deviation, evaluate playbook performance, and audit strategy consistency.
          </p>
        </div>
        
        <RefreshButton 
          onRefresh={fetchSessions}
          isLoading={loading}
        />
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px', flexShrink: 0 }}>
        {[
          { label: 'Total Sessions', value: stats.total, color: '#6366f1' },
          { label: 'Completed Audit', value: stats.completed, color: '#10b981' },
          { label: 'Last 24 Hours', value: stats.recent, color: '#f59e0b' }
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>{stat.label}</div>
            {loading && sessions.length === 0 ? (
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#e2e8f0', animation: 'pulse 1.5s infinite' }}>...</div>
            ) : (
              <div style={{ fontSize: '32px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', flexShrink: 0 }}>
        <input 
          type="text" 
          placeholder="Filter by Session ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 20px',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#fcfdfe',
            outline: 'none',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
        {error ? (
          <div style={{ padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: '#b91c1c' }}>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Connection Error</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>{error}</div>
          </div>
        ) : (
          <SessionList 
            sessions={filteredSessions} 
            onSelect={handleSelectSession} 
            selectedId={selectedSession?.id} 
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
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }} onClick={closeModal}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '1200px',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.3)',
            border: '1px solid #e2e8f0'
          }} onClick={e => e.stopPropagation()}>
            <ReplayPlayer 
              session={selectedSession} 
              events={replayEvents} 
              loading={loadingReplay} 
              onClose={closeModal} 
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
}

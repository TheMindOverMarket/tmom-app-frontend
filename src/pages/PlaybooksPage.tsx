import { useNavigate } from 'react-router-dom';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { PlaybookIngestion } from '../components/playbook/PlaybookIngestion';
import { RefreshButton } from '../components/common/RefreshButton';
import { CONFIG } from '../config/constants';

export function PlaybooksPage() {
  const { 
    playbookInput, 
    setPlaybookInput, 
    createPlaybookFromNL, 
    isSubmitting,
    playbooks,
    selectedPlaybook,
    activatePlaybook,
    isLoadingPlaybooks,
    fetchPlaybooks
  } = usePlaybookContext();

  const navigate = useNavigate();

  const handleSelect = async (pb: any) => {
    await activatePlaybook(pb);
    navigate('/supervision');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1, minHeight: 0 }}>
      {/* Ingestion Section */}
      <section style={{ 
        padding: '24px', 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9',
        flexShrink: 0
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>INGEST NEW PLAYBOOK</h3>
        <PlaybookIngestion 
          value={playbookInput}
          onChange={setPlaybookInput}
          onSubmit={createPlaybookFromNL}
          isSubmitting={isSubmitting}
        />
      </section>

      {/* Library Section */}
      <section style={{ 
        flex: 1, 
        minHeight: 0, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden' // Root section doesn't scroll
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>YOUR PLAYBOOKS</h3>
          <RefreshButton 
            onRefresh={fetchPlaybooks}
            isLoading={isLoadingPlaybooks}
          />
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '16px', 
          overflowY: 'auto', // Inner grid scrolls
          paddingBottom: '24px',
          flex: 1,
          minHeight: 0
        }}>
          {isLoadingPlaybooks && playbooks.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
              <div style={{ marginBottom: '12px', fontSize: '24px' }}>⚡️</div>
              Waking up the Playbook Service...
            </div>
          ) : (
            playbooks.map(pb => (
              <div 
                key={pb.id} 
                style={{ 
                  padding: '24px', 
                  backgroundColor: 'white', 
                  borderRadius: 'var(--radius-xl)', 
                  border: selectedPlaybook?.id === pb.id ? '2px solid var(--brand)' : '1px solid var(--slate-200)',
                  boxShadow: selectedPlaybook?.id === pb.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'var(--transition)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--slate-900)' }}>{pb.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '4px' }}>Created {new Date(pb.created_at).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => handleSelect(pb)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: selectedPlaybook?.id === pb.id ? 'var(--brand)' : 'var(--slate-100)',
                      color: selectedPlaybook?.id === pb.id ? 'white' : 'var(--slate-600)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    {selectedPlaybook?.id === pb.id ? 'ACTIVE' : 'SELECT'}
                  </button>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.6',
                  color: 'var(--slate-600)', 
                  backgroundColor: 'var(--slate-50)', 
                  padding: '14px', 
                  borderRadius: 'var(--radius-lg)',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  border: '1px solid var(--slate-100)'
                }}>
                  {pb.original_nl_input}
                </div>
              </div>
            ))
          )}
          {!isLoadingPlaybooks && playbooks.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px' }}>
              No playbooks yet for User ID: {CONFIG.USER_ID.slice(0,8)}... Ingest your first playbook above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

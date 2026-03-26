import { useNavigate } from 'react-router-dom';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { PlaybookIngestion } from '../components/playbook/PlaybookIngestion';
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
    navigate('/monitor');
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
      <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>YOUR PLAYBOOKS</h3>
          <button 
            onClick={fetchPlaybooks}
            disabled={isLoadingPlaybooks}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              color: '#64748b',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            {isLoadingPlaybooks ? 'REFRESHING...' : 'REFRESH'}
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '16px', 
          overflowY: 'auto',
          paddingBottom: '24px'
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
                  padding: '20px', 
                  backgroundColor: 'white', 
                  borderRadius: '16px', 
                  border: selectedPlaybook?.id === pb.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{pb.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Created {new Date(pb.created_at).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => handleSelect(pb)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: selectedPlaybook?.id === pb.id ? '#6366f1' : '#f1f5f9',
                      color: selectedPlaybook?.id === pb.id ? 'white' : '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedPlaybook?.id === pb.id ? 'ACTIVE' : 'SELECT'}
                  </button>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#475569', 
                  backgroundColor: '#f8fafc', 
                  padding: '10px', 
                  borderRadius: '8px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
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

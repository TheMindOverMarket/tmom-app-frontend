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
    rules,
    isLoadingPlaybooks,
    fetchPlaybooks
  } = usePlaybookContext();

  const navigate = useNavigate();

  const handleSelect = async (pb: any) => {
    await activatePlaybook(pb);
    if (pb.generation_status === 'COMPLETED') {
      navigate('/supervision');
    }
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

      {/* Main Library & Analysis Area */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPlaybook ? '1fr 380px' : '1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Library Section */}
        <section style={{ 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '16px', 
            overflowY: 'auto',
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
                    padding: '20px', 
                    backgroundColor: 'white', 
                    borderRadius: 'var(--radius-xl)', 
                    border: selectedPlaybook?.id === pb.id ? '2px solid var(--brand)' : '1px solid var(--slate-200)',
                    boxShadow: selectedPlaybook?.id === pb.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => activatePlaybook(pb)}
                >
                  {pb.generation_status === 'PENDING' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      backgroundColor: 'var(--brand)', 
                      color: 'white', 
                      padding: '2px 8px', 
                      fontSize: '9px', 
                      fontWeight: 900,
                      borderBottomLeftRadius: '8px'
                    }}>
                      GENERATING...
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--slate-900)' }}>{pb.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--slate-400)', marginTop: '2px' }}>Created {new Date(pb.created_at).toLocaleDateString()}</div>
                    </div>
                    {selectedPlaybook?.id === pb.id && (
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--brand)', 
                        boxShadow: '0 0 0 4px var(--brand-alpha)' 
                      }} />
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: '11px', 
                    lineHeight: '1.5',
                    color: 'var(--slate-500)', 
                    backgroundColor: 'var(--slate-50)', 
                    padding: '10px', 
                    borderRadius: 'var(--radius-md)',
                    maxHeight: '80px',
                    overflowY: 'hidden',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    border: '1px solid var(--slate-100)',
                    maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
                  }}>
                    {pb.original_nl_input}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSelect(pb); }}
                      disabled={pb.generation_status !== 'COMPLETED'}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: selectedPlaybook?.id === pb.id ? 'var(--brand)' : 'var(--slate-100)',
                        color: selectedPlaybook?.id === pb.id ? 'white' : 'var(--slate-600)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '10px',
                        fontWeight: '800',
                        cursor: pb.generation_status === 'COMPLETED' ? 'pointer' : 'not-allowed',
                        flex: 1,
                        opacity: pb.generation_status === 'COMPLETED' ? 1 : 0.5
                      }}
                    >
                      {selectedPlaybook?.id === pb.id ? 'GO TO SUPERVISION' : 'VIEW ANALYSIS'}
                    </button>
                  </div>
                </div>
              ))
            )}
            {!isLoadingPlaybooks && playbooks.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px' }}>
                No playbooks yet. Ingest your first strategy above!
              </div>
            )}
          </div>
        </section>

        {/* Selected Playbook Analysis Sidebar */}
        {selectedPlaybook && (
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--slate-200)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            minHeight: 0
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--slate-50)', flexShrink: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--slate-400)', letterSpacing: '0.05em' }}>STRATEGY ANALYSIS</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--slate-900)', marginTop: '4px' }}>{selectedPlaybook.name}</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedPlaybook.generation_status === 'PENDING' ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate-400)' }}>
                   <div style={{ 
                     width: '40px', 
                     height: '40px', 
                     borderRadius: '50%', 
                     border: '3px solid var(--slate-100)', 
                     borderTopColor: 'var(--brand)', 
                     margin: '0 auto 16px auto',
                     animation: 'spin 1s linear infinite'
                   }} />
                   <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--slate-600)' }}>Running AI Extraction...</div>
                   <div style={{ fontSize: '11px', marginTop: '4px' }}>Derived logic will appear here shortly.</div>
                </div>
              ) : rules.length > 0 ? (
                rules.map((rule, idx) => (
                  <div key={rule.id || idx} style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--slate-100)',
                    backgroundColor: 'white',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ 
                        fontSize: '9px', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        backgroundColor: 'var(--slate-100)', 
                        color: 'var(--slate-600)',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>
                        {rule.category || 'Logic'}
                      </span>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: rule.is_active ? 'var(--success)' : 'var(--slate-300)' }} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '4px' }}>{rule.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-500)', lineHeight: '1.4' }}>{rule.description}</div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-400)', fontSize: '12px' }}>
                   No specific rules extracted for this strategy.
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

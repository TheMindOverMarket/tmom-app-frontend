import { useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { PlaybookIngestion } from '../components/playbook/PlaybookIngestion';
import { RefreshButton } from '../components/common/RefreshButton';
import { RuleCondition, ConditionEdge, Playbook } from '../domain/playbook/types';

export function PlaybooksPage() {
  const { 
    playbookInput, 
    setPlaybookInput, 
    createPlaybookFromNL, 
    isSubmitting,
    playbooks,
    selectedPlaybook,
    setSelectedPlaybook,
    activatePlaybook,
    rules,
    isLoadingPlaybooks,
    fetchPlaybooks
  } = usePlaybookContext();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAnalysis = (pb: Playbook) => {
    setSelectedPlaybook(pb);
    setIsModalOpen(true);
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

      {/* Main Library Area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        
        <section style={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>STRATEGY LIBRARY</h3>
            <RefreshButton 
              onRefresh={fetchPlaybooks}
              isLoading={isLoadingPlaybooks}
            />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '20px', 
            overflowY: 'auto',
            paddingBottom: '24px',
            flex: 1,
            minHeight: 0
          }}>
            {isLoadingPlaybooks && playbooks.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <div style={{ marginBottom: '12px', fontSize: '24px' }}>✨</div>
                Waking up the Playbook Service...
              </div>
            ) : (
              playbooks.map(pb => (
                <div 
                  key={pb.id} 
                  onClick={() => handleOpenAnalysis(pb)}
                  style={{ 
                    padding: '24px', 
                    backgroundColor: 'white', 
                    borderRadius: '24px', 
                    border: '1.5px solid var(--slate-100)',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--brand)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px var(--brand-alpha), 0 10px 10px -5px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--slate-100)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)';
                  }}
                >
                  {pb.generation_status === 'PENDING' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      backgroundColor: 'var(--brand)', 
                      color: 'white', 
                      padding: '4px 12px', 
                      fontSize: '10px', 
                      fontWeight: 900,
                      borderBottomLeftRadius: '12px',
                      zIndex: 1
                    }}>
                      GENERATING...
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--slate-900)' }}>{pb.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--slate-400)', marginTop: '4px', fontWeight: 600 }}>CREATED {new Date(pb.created_at).toLocaleDateString().toUpperCase()}</div>
                    </div>
                    
                    {pb.is_active ? (
                      <div style={{ 
                        fontSize: '9px', 
                        padding: '3px 10px', 
                        backgroundColor: 'var(--success-alpha)', 
                        color: 'var(--success)', 
                        borderRadius: '12px',
                        fontWeight: 900,
                        letterSpacing: '0.05em'
                      }}>ACTIVE</div>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pb.generation_status === 'COMPLETED') activatePlaybook(pb);
                        }}
                        disabled={pb.generation_status !== 'COMPLETED'}
                        style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          backgroundColor: 'var(--slate-50)',
                          color: 'var(--slate-500)',
                          border: '1.5px solid var(--slate-200)',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = 'var(--brand)';
                          e.currentTarget.style.borderColor = 'var(--brand)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'var(--slate-50)';
                          e.currentTarget.style.borderColor = 'var(--slate-200)';
                          e.currentTarget.style.color = 'var(--slate-500)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        ACTIVATE
                      </button>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: '11px', 
                    lineHeight: '1.7',
                    color: 'var(--slate-500)', 
                    backgroundColor: 'var(--slate-50)', 
                    padding: '12px',
                    borderRadius: '16px',
                    maxHeight: '100px',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                    border: '1px solid var(--slate-100)'
                  }}>
                    {pb.original_nl_input}
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

        {/* Strategy Audit Modal */}
        {isModalOpen && selectedPlaybook && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '40px'
          }} onClick={() => setIsModalOpen(false)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '32px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
              border: '1px solid var(--slate-200)'
            }} onClick={e => e.stopPropagation()}>
              
              <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--slate-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand)', boxShadow: '0 0 0 4px var(--brand-alpha)' }} />
                      <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--brand)', letterSpacing: '0.15em' }}>STRATEGY INSPECTOR</div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>{selectedPlaybook.name}</div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: 'var(--slate-100)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', color: 'var(--slate-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--slate-200)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--slate-100)'}
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                {selectedPlaybook.generation_status === 'PENDING' ? (
                  <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '50%', 
                      border: '5px solid var(--slate-100)', 
                      borderTopColor: 'var(--brand)', 
                      margin: '0 auto 24px auto',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <div style={{ fontWeight: 900, fontSize: '20px', color: 'var(--slate-900)' }}>AI Extraction in Progress</div>
                    <div style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '12px', maxWidth: '300px', margin: '12px auto 0 auto', lineHeight: '1.6' }}>We're deriving fine-grained logic from your natural language input.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--slate-400)', letterSpacing: '0.05em', marginBottom: '16px' }}>ORIGINAL INPUT</div>
                      <div style={{ 
                        padding: '24px', 
                        backgroundColor: 'var(--slate-900)', 
                        borderRadius: '20px', 
                        fontSize: '14px',
                        color: 'var(--slate-300)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        lineHeight: '1.8',
                        border: '1px solid var(--slate-800)'
                      }}>
                        {selectedPlaybook.original_nl_input}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--slate-400)', letterSpacing: '0.05em' }}>DERIVED RULESET</div>
                      {rules.length > 0 ? (
                        rules.map((rule, idx) => (
                          <div key={rule.id || idx} style={{
                            padding: '28px',
                            borderRadius: '24px',
                            border: '1.5px solid var(--slate-100)',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <span style={{ 
                                fontSize: '10px', 
                                padding: '4px 12px', 
                                borderRadius: '12px', 
                                backgroundColor: 'var(--slate-50)', 
                                color: 'var(--slate-500)',
                                border: '1px solid var(--slate-200)',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                {rule.category || 'Logic'}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: rule.is_active ? 'var(--success)' : 'var(--slate-400)' }}>
                                  {rule.is_active ? 'ENABLED' : 'DISABLED'}
                                </div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: rule.is_active ? 'var(--success)' : 'var(--slate-300)', boxShadow: rule.is_active ? '0 0 0 4px var(--success-alpha)' : 'none' }} />
                              </div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--slate-900)', marginBottom: '10px' }}>{rule.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--slate-500)', lineHeight: '1.6', marginBottom: (rule.conditions && rule.conditions.length > 0) ? '24px' : '0' }}>{rule.description}</div>
                            
                            {rule.conditions && rule.conditions.length > 0 && (
                              <div style={{ 
                                marginTop: '20px', 
                                padding: '24px', 
                                backgroundColor: 'var(--slate-50)', 
                                borderRadius: '20px',
                                border: '1px solid var(--slate-100)'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                  {rule.conditions.map((cond: RuleCondition, cIdx: number) => (
                                    <div key={cond.id || cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '14px', 
                                        backgroundColor: 'white', 
                                        padding: '12px 20px', 
                                        borderRadius: '12px',
                                        border: '1px solid var(--slate-100)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                                      }}>
                                        <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--brand)' }}>{cond.metric}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--slate-400)', fontWeight: 800 }}>{cond.comparator}</span>
                                        <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--slate-800)' }}>{cond.value}</span>
                                      </div>
                                      
                                      {rule.edges && rule.edges.some((e: ConditionEdge) => e.parent_condition_id === cond.id) && (
                                        <div style={{ 
                                          marginLeft: '32px', 
                                          fontSize: '11px', 
                                          fontWeight: 900, 
                                          color: 'var(--brand)',
                                          padding: '4px 10px',
                                          backgroundColor: 'var(--brand-alpha)',
                                          borderRadius: '8px',
                                          width: 'fit-content',
                                          letterSpacing: '0.05em'
                                        }}>
                                          {rule.edges.find((e: ConditionEdge) => e.parent_condition_id === cond.id)?.logical_operator}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--slate-50)', borderRadius: '24px', border: '1.5px dashed var(--slate-200)' }}>
                          <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>🔎</span>
                          <span style={{ fontSize: '14px', color: 'var(--slate-400)', fontWeight: 600 }}>No deterministic rules derived for this strategy.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '32px 40px', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'flex-end', gap: '16px', backgroundColor: 'white' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '14px 28px',
                    borderRadius: '14px',
                    border: '1.5px solid var(--slate-200)',
                    backgroundColor: 'white',
                    color: 'var(--slate-600)',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--slate-50)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                >
                  DISMISS
                </button>
                {!selectedPlaybook.is_active && (
                  <button 
                    onClick={() => {
                      activatePlaybook(selectedPlaybook);
                      setIsModalOpen(false);
                    }}
                    disabled={selectedPlaybook.generation_status !== 'COMPLETED'}
                    style={{
                      padding: '14px 40px',
                      borderRadius: '14px',
                      border: 'none',
                      backgroundColor: 'var(--brand)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 12px 20px -5px var(--brand-alpha)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    ACTIVATE STRATEGY
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes modalSlideUp {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        ` }} />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { PlaybookIngestion } from '../components/playbook/PlaybookIngestion';
import { RefreshButton } from '../components/common/RefreshButton';
import { RuleCondition, ConditionEdge, Playbook } from '../domain/playbook/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showOriginal, setShowOriginal] = useState(false);

  const handleOpenAnalysis = (pb: Playbook) => {
    setSelectedPlaybook(pb);
    setIsModalOpen(true);
    setShowOriginal(false);
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
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>PLAYBOOK LIBRARY</h3>
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
                    border: '2px solid var(--slate-100)',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--brand)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px var(--brand-alpha), 0 10px 10px -5px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--slate-100)';
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
                No playbooks yet. Ingest your first playbook above!
              </div>
            )}
          </div>
        </section>

        {/* Playbook Audit Modal */}
        {isModalOpen && selectedPlaybook && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 15, 25, 0.5)',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }} onClick={() => setIsModalOpen(false)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '40px',
              width: '100%',
              maxWidth: '1000px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }} onClick={e => e.stopPropagation()}>
              
              <div style={{ padding: '40px 60px', borderBottom: '1px solid var(--slate-100)', backgroundColor: 'var(--slate-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand)', boxShadow: '0 0 0 4px var(--brand-alpha)' }} />
                      <div style={{ fontSize: '12px', fontWeight: 950, color: 'var(--brand)', letterSpacing: '0.2em' }}>PLAYBOOK INSPECTOR</div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 950, color: 'var(--slate-900)', letterSpacing: '-0.04em' }}>{selectedPlaybook.name}</div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ 
                      background: 'rgba(0,0,0,0.05)', 
                      border: 'none', 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      fontSize: '24px', 
                      color: 'var(--slate-500)', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      transition: 'all 0.3s' 
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px' }}>
                {selectedPlaybook.generation_status === 'PENDING' ? (
                  <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <div style={{ 
                      width: '72px', 
                      height: '72px', 
                      borderRadius: '50%', 
                      border: '6px solid var(--slate-100)', 
                      borderTopColor: 'var(--brand)', 
                      margin: '0 auto 32px auto',
                      animation: 'spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                    }} />
                    <div style={{ fontWeight: 950, fontSize: '24px', color: 'var(--slate-900)' }}>Extracting Intelligence...</div>
                    <div style={{ fontSize: '15px', color: 'var(--slate-500)', marginTop: '16px', maxWidth: '360px', margin: '16px auto 0 auto', lineHeight: '1.7' }}>Analyzing natural language signals to generate deterministic execution rules.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    
                    {/* Collapsible Original Input */}
                    <div style={{ 
                      borderRadius: '24px', 
                      overflow: 'hidden', 
                      border: '1px solid var(--slate-200)',
                      backgroundColor: 'var(--slate-50)'
                    }}>
                      <div 
                        onClick={() => setShowOriginal(!showOriginal)}
                        style={{ 
                          padding: '16px 24px', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          backgroundColor: 'white'
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--slate-400)', letterSpacing: '0.1em' }}>PROMPT SOURCE (ORIGINAL NL) {showOriginal ? '(CLICK TO HIDE)' : '(CLICK TO VIEW)'}</div>
                        {showOriginal ? <ChevronUp size={16} color="var(--slate-400)" /> : <ChevronDown size={16} color="var(--slate-400)" />}
                      </div>
                      {showOriginal && (
                        <div style={{ 
                          padding: '24px', 
                          fontSize: '13px',
                          backgroundColor: '#0f172a',
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                          lineHeight: '1.8',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          borderTop: '1px solid var(--slate-200)'
                        }}>
                          {selectedPlaybook.original_nl_input}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--slate-400)', letterSpacing: '0.1em' }}>DERIVED EXECUTION RULESET</div>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--success)', backgroundColor: 'var(--success-alpha)', padding: '4px 12px', borderRadius: '12px' }}>AI VERIFIED</div>
                      </div>
                      
                      {rules.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                          {rules.map((rule, idx) => (
                            <div key={rule.id || idx} style={{
                              padding: '32px',
                              borderRadius: '32px',
                              border: '1.5px solid var(--slate-100)',
                              backgroundColor: 'white',
                              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-alpha)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--slate-100)'}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <span style={{ 
                                  fontSize: '10px', 
                                  padding: '5px 14px', 
                                  borderRadius: '14px', 
                                  backgroundColor: 'var(--slate-900)', 
                                  color: 'white',
                                  fontWeight: 900,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em'
                                }}>
                                  {rule.category || 'Logic'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: 900, color: rule.is_active ? 'var(--success)' : 'var(--slate-400)' }}>
                                    {rule.is_active ? 'ACTIVE' : 'DISABLED'}
                                  </div>
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: rule.is_active ? 'var(--success)' : 'var(--slate-300)', boxShadow: rule.is_active ? '0 0 0 5px var(--success-alpha)' : 'none' }} />
                                </div>
                              </div>
                              <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--slate-900)', marginBottom: '12px' }}>{rule.name}</div>
                              <div style={{ fontSize: '14px', color: 'var(--slate-500)', lineHeight: '1.7', marginBottom: (rule.conditions && rule.conditions.length > 0) ? '32px' : '0' }}>{rule.description}</div>
                              
                              {rule.conditions && rule.conditions.length > 0 && (
                                <div style={{ 
                                  padding: '32px', 
                                  backgroundColor: 'var(--slate-50)', 
                                  borderRadius: '24px',
                                  border: '1px solid var(--slate-100)'
                                }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {rule.conditions.map((cond: RuleCondition, cIdx: number) => (
                                      <div key={cond.id || cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: '20px', 
                                          backgroundColor: 'white', 
                                          padding: '16px 24px', 
                                          borderRadius: '16px',
                                          border: '1px solid var(--slate-100)',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                        }}>
                                          <span style={{ fontSize: '15px', fontWeight: 950, color: 'var(--brand)' }}>{cond.metric}</span>
                                          <span style={{ fontSize: '13px', color: 'var(--slate-400)', fontWeight: 900, fontFamily: 'monospace' }}>{cond.comparator}</span>
                                          <span style={{ fontSize: '15px', fontWeight: 950, color: 'var(--slate-900)' }}>{cond.value}</span>
                                        </div>
                                        
                                        {rule.edges && rule.edges.some((e: ConditionEdge) => e.parent_condition_id === cond.id) && (
                                          <div style={{ 
                                            marginLeft: '40px', 
                                            fontSize: '11px', 
                                            fontWeight: 950, 
                                            color: 'white',
                                            padding: '5px 14px',
                                            backgroundColor: 'var(--brand)',
                                            borderRadius: '10px',
                                            width: 'fit-content',
                                            letterSpacing: '0.1em',
                                            boxShadow: '0 4px 10px var(--brand-alpha)'
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
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'var(--slate-50)', borderRadius: '32px', border: '1.5px dashed var(--slate-200)' }}>
                          <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>🧩</span>
                          <span style={{ fontSize: '15px', color: 'var(--slate-400)', fontWeight: 700 }}>No deterministic rules derived for this playbook.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '40px 60px', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'white' }}>
                {!selectedPlaybook.is_active && (
                  <button 
                    onClick={() => {
                      activatePlaybook(selectedPlaybook);
                      setIsModalOpen(false);
                    }}
                    disabled={selectedPlaybook.generation_status !== 'COMPLETED'}
                    style={{
                      padding: '18px 60px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: 'var(--brand)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 950,
                      cursor: 'pointer',
                      boxShadow: '0 20px 40px -10px var(--brand-alpha)',
                      transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 30px 60px -12px var(--brand-alpha)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 20px 40px -10px var(--brand-alpha)';
                    }}
                  >
                    ACTIVATE PLAYBOOK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes modalSlideUp {
            from { transform: translateY(60px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        ` }} />
      </div>
    </div>
  );
}

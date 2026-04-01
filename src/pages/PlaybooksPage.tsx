import { useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { PlaybookIngestion } from '../components/playbook/PlaybookIngestion';
import { RefreshButton } from '../components/common/RefreshButton';
import { RuleCondition, Playbook } from '../domain/playbook/types';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

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
    deletePlaybook,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 0 }}>
      {/* Ingestion Section */}
      <section style={{ 
        padding: '16px', 
        backgroundColor: 'white', 
        borderRadius: '6px', 
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '0.05em' }}>NEW STRATEGY INGESTION</h3>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '0.05em' }}>STRATEGY LIBRARY</h3>
            <RefreshButton 
              onRefresh={fetchPlaybooks}
              isLoading={isLoadingPlaybooks}
            />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '12px', 
            overflowY: 'auto',
            paddingBottom: '20px',
            flex: 1,
            minHeight: 0
          }}>
            {isLoadingPlaybooks && playbooks.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                Waking up the Playbook Service...
              </div>
            ) : (
              playbooks.map(pb => (
                <div 
                  key={pb.id} 
                  onClick={() => handleOpenAnalysis(pb)}
                  style={{ 
                    padding: '16px', 
                    backgroundColor: 'white', 
                    borderRadius: '4px', 
                    border: '1px solid var(--slate-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--brand)';
                    e.currentTarget.style.backgroundColor = '#fcfdfe';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--slate-200)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  {(pb.generation_status === 'PENDING' || pb.generation_status === 'FAILED') && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      backgroundColor: pb.generation_status === 'FAILED' ? 'var(--danger)' : 'var(--brand)', 
                      color: 'white', 
                      padding: '2px 8px', 
                      fontSize: '9px', 
                      fontWeight: 900,
                      borderBottomLeftRadius: '4px',
                      zIndex: 1
                    }}>
                      {pb.generation_status === 'PENDING' ? 'EXTRACTING...' : 'FAILED'}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{pb.name}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Permanently delete playbook "${pb.name}"?`)) {
                              deletePlaybook(pb.id);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          title="Purge Playbook from Library"
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>{new Date(pb.created_at).toLocaleDateString().toUpperCase()}</div>
                    </div>
                    
                    {pb.is_active ? (
                      <div style={{ 
                        fontSize: '9px', 
                        padding: '2px 6px', 
                        backgroundColor: '#f0fdf4', 
                        color: '#16a34a', 
                        borderRadius: '2px',
                        border: '1px solid #bbf7d0',
                        fontWeight: 900
                      }}>ACTIVE</div>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pb.generation_status === 'COMPLETED') activatePlaybook(pb);
                        }}
                        disabled={pb.generation_status !== 'COMPLETED'}
                        title={pb.generation_status === 'PENDING' ? "Orchestrating background extraction task. Activation pending..." : (pb.generation_status === 'FAILED' ? "Extraction failed. Re-ingest with clearer logic." : "Deploy strategy to live supervision feed")}
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          backgroundColor: 'white',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: pb.generation_status === 'COMPLETED' ? 'pointer' : 'not-allowed',
                          opacity: pb.generation_status === 'COMPLETED' ? 1 : 0.6,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                          if (pb.generation_status === 'COMPLETED') {
                            e.currentTarget.style.backgroundColor = '#0f172a';
                            e.currentTarget.style.borderColor = '#0f172a';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#64748b';
                        }}
                      >
                        ACTIVATE
                      </button>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: '11px', 
                    lineHeight: '1.5',
                    color: '#64748b', 
                    backgroundColor: '#f8fafc', 
                    padding: '8px',
                    borderRadius: '4px',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                    border: '1px solid #f1f5f9'
                  }}>
                    {pb.original_nl_input}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Modal sharpened */}
        {isModalOpen && selectedPlaybook && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }} onClick={() => setIsModalOpen(false)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid var(--slate-200)'
            }} onClick={e => e.stopPropagation()}>
              
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand)' }} />
                      <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--brand)', letterSpacing: '0.1em' }}>STRATEGY INSPECTOR</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>{selectedPlaybook.name}</div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}
                  >&times;</button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                {selectedPlaybook.generation_status === 'PENDING' ? (
                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>Analyzing Strategy Logic...</div>
                  </div>
                ) : selectedPlaybook.generation_status === 'FAILED' ? (
                  <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--danger)', marginBottom: '8px' }}>Extraction Failed</div>
                    {selectedPlaybook.failure_reason && (
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#64748b', 
                        backgroundColor: '#fef2f2', 
                        padding: '12px 16px', 
                        borderRadius: '4px',
                        border: '1px solid #fee2e2',
                        maxWidth: '500px',
                        margin: '0 auto',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace'
                      }}>
                        {selectedPlaybook.failure_reason}
                      </div>
                    )}
                    <button onClick={() => setIsModalOpen(false)} style={{ marginTop: '24px', padding: '8px 24px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, color: '#475569' }}>Dismiss</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <div onClick={() => setShowOriginal(!showOriginal)} style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'white' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em' }}>SOURCE NATURAL LANGUAGE [CLICK TO TOGGLE]</span>
                        {showOriginal ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </div>
                      {showOriginal && (
                        <div style={{ padding: '16px', fontSize: '12px', backgroundColor: '#f8fafc', color: '#334155', fontFamily: 'monospace', whiteSpace: 'pre-wrap', borderTop: '1px solid #f1f5f9' }}>
                          {selectedPlaybook.original_nl_input}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em' }}>DETERMINISTIC RULESET</div>
                      {rules.map((rule, idx) => (
                        <div key={rule.id || idx} style={{
                          padding: '20px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: 'white'
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>{rule.name}</div>
                          <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>{rule.description}</div>
                          {rule.conditions?.map((cond: RuleCondition, cIdx: number) => (
                            <div key={cond.id || cIdx} style={{ fontSize: '13px', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '4px', marginBottom: '4px', display: 'flex', gap: '12px' }}>
                              <span style={{ fontWeight: 800, color: 'var(--brand)' }}>{cond.metric}</span>
                              <span style={{ color: '#94a3b8', fontWeight: 700 }}>{cond.comparator}</span>
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>{cond.value}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                {!selectedPlaybook.is_active && (
                  <button 
                    onClick={() => { activatePlaybook(selectedPlaybook); setIsModalOpen(false); }}
                    disabled={selectedPlaybook.generation_status !== 'COMPLETED'}
                    title={selectedPlaybook.generation_status !== 'COMPLETED' ? "Extraction incomplete. Deployment restricted." : "Deploy strategy to live supervision feed"}
                    style={{
                      padding: '10px 32px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#0f172a',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: selectedPlaybook.generation_status === 'COMPLETED' ? 'pointer' : 'not-allowed',
                      opacity: selectedPlaybook.generation_status === 'COMPLETED' ? 1 : 0.6,
                      transition: 'all 0.2s ease'
                    }}
                  >ACTIVATE PLAYBOOK</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

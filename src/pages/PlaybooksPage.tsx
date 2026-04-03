import { useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { PlaybookIngestion } from '../components/playbook/PlaybookIngestion';
import { RuleCondition, Playbook } from '../domain/playbook/types';
import { ChevronDown, ChevronUp, Trash2, Copy, Check, Info } from 'lucide-react';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { RefreshButton } from '../components/common/RefreshButton';

export function PlaybooksPage() {
  const { 
    playbookInput, 
    setPlaybookInput, 
    selectedMarket,
    setSelectedMarket,
    availableMarkets,
    isLoadingMarkets,
    createPlaybookFromNL, 
    isSubmitting,
    playbooks,
    selectedPlaybook,
    setSelectedPlaybook,
    activatePlaybook,
    deletePlaybook,
    rules,
    isLoadingPlaybooks,
    fetchPlaybooks,
    deleteAllPlaybooks
  } = usePlaybookContext();

  const handleConfirmDelete = async () => {
    if (confirmConfig.id === 'all') {
      await deleteAllPlaybooks();
    } else {
      await deletePlaybook(confirmConfig.id);
    }
    setIsConfirmOpen(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Deletion Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    id: string | 'all';
    name: string;
  }>({ id: '', name: '' });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

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
          selectedMarket={selectedMarket}
          onMarketChange={setSelectedMarket}
          availableMarkets={availableMarkets}
          isLoadingMarkets={isLoadingMarkets}
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {playbooks.length > 0 && (
                <button
                  onClick={() => {
                    setConfirmConfig({ id: 'all', name: 'all playbooks' });
                    setIsConfirmOpen(true);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid #fee2e2',
                    backgroundColor: '#fff5f5',
                    color: '#dc2626',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Trash2 size={12} />
                  DELETE ALL
                </button>
              )}
              <RefreshButton 
                onRefresh={fetchPlaybooks}
                isLoading={isLoadingPlaybooks}
              />
            </div>
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
                  aria-label={`Open ${pb.name}`}
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
                        <div style={{ 
                          fontSize: '9px', 
                          padding: '2px 6px', 
                          backgroundColor: '#eff6ff', 
                          color: '#1d4ed8', 
                          borderRadius: '999px',
                          border: '1px solid #bfdbfe',
                          fontWeight: 900
                        }}>{pb.market}</div>
                        {pb.is_active && (
                          <div style={{ 
                            fontSize: '9px', 
                            padding: '2px 6px', 
                            backgroundColor: '#f0fdf4', 
                            color: '#16a34a', 
                            borderRadius: '2px',
                            border: '1px solid #bbf7d0',
                            fontWeight: 900
                          }}>ACTIVE</div>
                        )}
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>{new Date(pb.created_at).toLocaleDateString().toUpperCase()}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: '600' }}>
                        {new Date(pb.created_at).toLocaleDateString()}
                      </div>

                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAnalysis(pb);
                        }}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          color: '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: '#f8fafc'
                        }}
                        title="View details"
                      >
                        <Info size={16} />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmConfig({ id: pb.id, name: pb.name });
                          setIsConfirmOpen(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px',
                          cursor: 'pointer',
                          color: '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        title="Delete playbook"
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      {!pb.is_active && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (pb.generation_status === 'COMPLETED') activatePlaybook(pb);
                          }}
                          disabled={pb.generation_status !== 'COMPLETED'}
                          title={pb.generation_status === 'PENDING' ? "Extraction pending..." : (pb.generation_status === 'FAILED' ? "Extraction failed." : "Activate strategy")}
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
                        >
                          ACTIVATE
                        </button>
                      )}
                    </div>
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
                    border: '1px solid #f1f5f9',
                    flex: 1
                  }}>
                    {pb.original_nl_input}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                      Open to inspect the extracted rules.
                    </div>
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
                    <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '6px 10px' }}>
                      {selectedPlaybook.market}
                    </div>
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
                      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                        <div 
                          onClick={() => setShowOriginal(!showOriginal)} 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                        >
                          <span style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em' }}>SOURCE NATURAL LANGUAGE [CLICK TO TOGGLE]</span>
                          {showOriginal ? <ChevronUp size={10} color="#94a3b8" /> : <ChevronDown size={10} color="#94a3b8" />}
                        </div>
                        
                        <button
                          onClick={() => handleCopy(selectedPlaybook.original_nl_input)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: copySuccess ? '#16a34a' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '9px',
                            fontWeight: 800,
                            transition: 'all 0.2s ease'
                          }}
                          title="Copy prompt to clipboard"
                        >
                          {copySuccess ? <Check size={12} /> : <Copy size={12} />}
                          {copySuccess ? 'COPIED' : 'COPY'}
                        </button>
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

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={confirmConfig.id === 'all' ? 'Delete All Playbooks' : 'Delete Playbook'}
        message={confirmConfig.id === 'all' 
          ? 'Are you absolutely sure you want to delete ALL playbooks? This action is permanent and will remove all associated rules and trading history.' 
          : `Are you sure you want to delete "${confirmConfig.name}"? This will permanently remove the playbook and its compiled logic.`
        }
        confirmText={confirmConfig.id === 'all' ? 'Delete All' : 'Delete Playbook'}
      />
    </div>
  );
}

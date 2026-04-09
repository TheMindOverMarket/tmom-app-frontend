import { useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { Playbook } from '../domain/playbook/types';
import { Trash2, Copy, Check, ArrowLeft } from 'lucide-react';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { RefreshButton } from '../components/common/RefreshButton';
import { resolvePlaybookSymbol } from '../domain/playbook/utils';
import { RuleLogicTree } from '../components/playbook/RuleLogicTree';

export function PlaybooksPage() {
  const { 
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
    if (showDetailView && confirmConfig.id === selectedPlaybook?.id) {
      setShowDetailView(false);
      setSelectedPlaybook(null);
    }
  };

  const [showDetailView, setShowDetailView] = useState(false);
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
    setShowDetailView(true);
  };

  const handleBackToLibrary = () => {
    setShowDetailView(false);
    // Setting selectedPlaybook to null might clear the active feed if one exists, 
    // so we only close the view, keeping context attached.
  };

  if (showDetailView && selectedPlaybook) {
    // Render the Expanded Detail View
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Header Ribbon */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px', 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e2e8f0',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={handleBackToLibrary}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', fontSize: '11px', fontWeight: 800,
                padding: '4px 8px', borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowLeft size={14} />
              BACK TO LIBRARY
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand)' }} />
                <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--brand)', letterSpacing: '0.1em' }}>STRATEGY INSPECTOR</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedPlaybook.name}
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '2px 8px' }}>
                  {resolvePlaybookSymbol(selectedPlaybook)}
                </span>
                {selectedPlaybook.is_active && (
                  <span style={{ fontSize: '10px', fontWeight: 900, padding: '2px 8px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
                    ACTIVE
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             {!selectedPlaybook.is_active && (
                <button 
                  onClick={() => activatePlaybook(selectedPlaybook)}
                  disabled={selectedPlaybook.generation_status !== 'COMPLETED'}
                  title={selectedPlaybook.generation_status !== 'COMPLETED' ? "Extraction incomplete. Deployment restricted." : "Deploy strategy to live supervision feed"}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: selectedPlaybook.generation_status === 'COMPLETED' ? 'pointer' : 'not-allowed',
                    opacity: selectedPlaybook.generation_status === 'COMPLETED' ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  ACTIVATE PLAYBOOK
                </button>
              )}
             <button
                onClick={() => {
                  setConfirmConfig({ id: selectedPlaybook.id, name: selectedPlaybook.name });
                  setIsConfirmOpen(true);
                }}
                style={{
                  background: 'none',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fef2f2',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Delete playbook"
              >
                <Trash2 size={14} />
              </button>
          </div>
        </div>

        {/* Playbook Detailed Content */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          
          {/* Left Pane: Original Context */}
          <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', letterSpacing: '0.1em' }}>NATURAL LANGUAGE SOURCE</span>
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
                  >
                    {copySuccess ? <Check size={12} /> : <Copy size={12} />}
                    {copySuccess ? 'COPIED' : 'COPY'}
                  </button>
                </div>
                <div style={{ padding: '16px', fontSize: '12px', color: '#334155', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {selectedPlaybook.original_nl_input}
                </div>
             </div>
          </div>

          {/* Right Pane: Extracted Rules Explorer */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              DETERMINISTIC EVALUATION ENGINE
              <div style={{ height: '1px', flex: 1, backgroundColor: '#e2e8f0' }} />
            </div>

            {selectedPlaybook.generation_status === 'PENDING' ? (
                <div style={{ padding: '60px 0', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    border: '3px solid #e2e8f0', 
                    borderTopColor: 'var(--brand)', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px' 
                  }} />
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Analyzing Logic & Validating Primitives...</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>The Rule Engine is translating natural language dependencies into strict execution graphs.</div>
                </div>
              ) : selectedPlaybook.generation_status === 'FAILED' ? (
                <div style={{ padding: '40px 32px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                  <div style={{ fontWeight: 900, fontSize: '16px', color: 'var(--danger)', marginBottom: '8px' }}>Extraction Failed</div>
                  <div style={{ fontSize: '13px', color: '#7f1d1d', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {selectedPlaybook.failure_reason || "Unknown compiler error."}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {rules.length === 0 ? (
                     <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        No extractable rules found in the strategy context.
                     </div>
                  ) : (
                     <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
                       {rules.map((rule) => Object.keys(rule).length > 0 && (
                          <RuleLogicTree key={rule.id} rule={rule} />
                       ))}
                     </div>
                  )}
                </div>
              )}
          </div>
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

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        ` }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 0 }}>
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
                (() => {
                  const playbookSymbol = resolvePlaybookSymbol(pb);
                  return (
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
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--slate-200)';
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
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
                        }}>{playbookSymbol}</div>
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
                  );
                })()
              ))
            )}
          </div>
        </section>
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

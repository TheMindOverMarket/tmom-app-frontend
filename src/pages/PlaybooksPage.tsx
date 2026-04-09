import { useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { Playbook } from '../domain/playbook/types';
import { Trash2, Copy, Check, ArrowLeft, RefreshCw, Layers, Zap, Clock } from 'lucide-react';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
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

  const [showDetailView, setShowDetailView] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    id: string | 'all';
    name: string;
  }>({ id: '', name: '' });

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
  };

  const glassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--auth-border)',
    borderRadius: '4px',
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--auth-text-muted)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Space Mono', monospace",
  };

  if (showDetailView && selectedPlaybook) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 0, color: '#ffffff' }}>
        {/* Detail Header */}
        <div style={{ 
          ...glassStyle,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 24px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button 
              onClick={handleBackToLibrary}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: '1px solid var(--auth-border)', cursor: 'pointer',
                color: 'var(--auth-text-muted)', fontSize: '10px', fontWeight: 700,
                padding: '8px 16px', borderRadius: '4px',
                letterSpacing: '0.1em',
                fontFamily: "'Space Mono', monospace",
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--auth-text-muted)';
              }}
            >
              <ArrowLeft size={14} />
              RETURN TO SYSTEM LIBRARY
            </button>
            
            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--auth-border)' }} />
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--auth-accent)' }} />
                <span style={labelStyle}>Logic Inspection Mode</span>
              </div>
              <div style={{ fontSize: '28px', fontFamily: "'Cormorant Garamond', serif", color: '#ffffff', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {selectedPlaybook.name}
                <span style={{ 
                  fontSize: '12px', 
                  fontFamily: "'Space Mono', monospace", 
                  color: 'var(--auth-accent)', 
                  backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                  padding: '4px 12px',
                  borderRadius: '2px',
                  border: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                  {resolvePlaybookSymbol(selectedPlaybook)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             {!selectedPlaybook.is_active ? (
                <button 
                  onClick={() => activatePlaybook(selectedPlaybook)}
                  disabled={selectedPlaybook.generation_status !== 'COMPLETED'}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: selectedPlaybook.generation_status === 'COMPLETED' ? 'pointer' : 'not-allowed',
                    opacity: selectedPlaybook.generation_status === 'COMPLETED' ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={e => {
                    if (selectedPlaybook.generation_status === 'COMPLETED') e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={e => {
                    if (selectedPlaybook.generation_status === 'COMPLETED') e.currentTarget.style.opacity = '1';
                  }}
                >
                  Confirm & Deploy
                </button>
              ) : (
                <div style={{ 
                  padding: '10px 20px', 
                  borderRadius: '4px', 
                  backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                  color: 'var(--auth-accent)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.1em'
                }}>
                  DEPLOYED & ACTIVE
                </div>
              )}
             <button
                onClick={() => {
                  setConfirmConfig({ id: selectedPlaybook.id, name: selectedPlaybook.name });
                  setIsConfirmOpen(true);
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
              >
                <Trash2 size={16} />
              </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flex: 1, overflowY: 'auto' }}>
          {/* Left Pane: Original Context */}
          <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ ...glassStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--auth-border)' }}>
                  <span style={labelStyle}>Source Specification</span>
                  <button
                    onClick={() => handleCopy(selectedPlaybook.original_nl_input)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: copySuccess ? 'var(--auth-accent)' : 'var(--auth-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {copySuccess ? <Check size={12} /> : <Copy size={12} />}
                    {copySuccess ? 'COPIED' : 'COPY'}
                  </button>
                </div>
                <div style={{ 
                  padding: '24px', 
                  fontSize: '13px', 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontFamily: "'Space Mono', monospace", 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.8',
                  overflowY: 'auto',
                  flex: 1
                }}>
                  {selectedPlaybook.original_nl_input}
                </div>
             </div>
          </div>

          {/* Right Pane: Extracted Rules Explorer */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ ...glassStyle, padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <span style={labelStyle}>Deterministic Execution Graphs</span>
                 <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--auth-border)' }} />
              </div>

              {selectedPlaybook.generation_status === 'PENDING' ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      border: '2px solid rgba(255, 255, 255, 0.1)', 
                      borderTopColor: 'var(--auth-accent)', 
                      animation: 'spin 1.5s linear infinite',
                      marginBottom: '20px' 
                    }} />
                    <div style={{ fontSize: '18px', fontFamily: "'Cormorant Garamond', serif" }}>Compiling Logic Primitives...</div>
                    <div style={{ fontSize: '11px', color: 'var(--auth-text-muted)', marginTop: '8px', fontFamily: "'Space Mono', monospace" }}>TRANSLATING NATURAL LANGUAGE TO EXECUTION NODES</div>
                  </div>
                ) : selectedPlaybook.generation_status === 'FAILED' ? (
                  <div style={{ padding: '32px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ ...labelStyle, color: '#ef4444', marginBottom: '12px' }}>Extraction Error Encountered</div>
                    <div style={{ fontSize: '13px', color: 'rgba(239, 68, 68, 0.9)', fontFamily: "'Space Mono', monospace", whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {selectedPlaybook.failure_reason || "Unknown system exception during compilation."}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                    {rules.length === 0 ? (
                       <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--auth-text-muted)', fontSize: '12px', fontStyle: 'italic', border: '1px dashed var(--auth-border)', borderRadius: '4px' }}>
                          NO EXTRACTABLE RULES DETECTED IN THIS SPECIFICATION
                       </div>
                    ) : (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         {rules.map((rule) => Object.keys(rule).length > 0 && (
                            <RuleLogicTree key={rule.id} rule={rule} isDark={true} />
                         ))}
                       </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          isDark={true}
          title={confirmConfig.id === 'all' ? 'Purge System Library' : 'Delete Logic Specification'}
          message={confirmConfig.id === 'all' 
            ? 'Are you certain you want to purge the entire library? Metadata and logic graphs will be permanently erased.' 
            : `Are you certain you want to delete "${confirmConfig.name}"? This will terminate the associated logic graph permanently.`
          }
          confirmText={confirmConfig.id === 'all' ? 'Purge All' : 'Delete Specification'}
        />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        ` }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: 0, color: '#ffffff', backgroundColor: 'var(--auth-black)', height: '100%' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '36px', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 4px 0', fontWeight: 400, letterSpacing: '0.02em' }}>
            Strategy Library
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={labelStyle}>Active Supervison Profiles</span>
             <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--auth-border)' }} />
             <span style={{ fontSize: '10px', color: 'var(--auth-accent)', fontFamily: "'Space Mono', monospace" }}>{playbooks.length} TOTAL</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {playbooks.length > 0 && (
            <button
              onClick={() => {
                setConfirmConfig({ id: 'all', name: 'all playbooks' });
                setIsConfirmOpen(true);
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Trash2 size={14} />
              PURGE LIBRARY
            </button>
          )}
          <button 
            onClick={fetchPlaybooks}
            disabled={isLoadingPlaybooks}
            style={{
              background: 'none',
              border: '1px solid var(--auth-border)',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <RefreshCw size={14} className={isLoadingPlaybooks ? 'animate-spin' : ''} style={{ animation: isLoadingPlaybooks ? 'spin 1s linear infinite' : 'none' }} />
            SYNCHRONIZE
          </button>
        </div>
      </div>
      
      {/* 2-Row Grid Container */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gridAutoRows: 'min-content',
        gap: '20px',
        paddingBottom: '20px'
      }}>
        {isLoadingPlaybooks && playbooks.length === 0 ? (
          <div style={{ gridColumn: '1/-1', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
             <div style={labelStyle}>ACCESSING DATA STREAMS...</div>
          </div>
        ) : playbooks.length === 0 ? (
           <div style={{ gridColumn: '1/-1', height: '300px', border: '1px dashed var(--auth-border)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={labelStyle}>Library Is Empty</div>
              <p style={{ fontSize: '13px', color: 'var(--auth-text-muted)', textAlign: 'center', maxWidth: '300px' }}>Initialize your first strategy to see it archived in the system library.</p>
           </div>
        ) : (
          playbooks.map(pb => {
            const symbol = resolvePlaybookSymbol(pb);
            const isFailed = pb.generation_status === 'FAILED';
            const isPending = pb.generation_status === 'PENDING';
            
            return (
              <div 
                key={pb.id}
                onClick={() => handleOpenAnalysis(pb)}
                style={{ 
                  ...glassStyle,
                  padding: '20px', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'var(--auth-border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Visual Status Indicator */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  bottom: 0, 
                  width: '4px', 
                  backgroundColor: pb.is_active ? 'var(--auth-accent)' : isFailed ? '#ef4444' : isPending ? 'var(--brand)' : 'transparent'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h4 style={{ fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", margin: 0, fontWeight: 300, color: '#ffffff' }}>
                        {pb.name}
                      </h4>
                      <span style={{ 
                        fontSize: '9px', 
                        fontFamily: "'Space Mono', monospace", 
                        color: 'var(--auth-accent)', 
                        padding: '2px 6px',
                        backgroundColor: 'rgba(0, 255, 136, 0.05)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        borderRadius: '2px'
                      }}>
                        {symbol}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Clock size={10} style={{ color: 'var(--auth-text-muted)' }} />
                       <span style={{ ...labelStyle, fontSize: '9px', letterSpacing: '0.05em' }}>
                          Registered {new Date(pb.created_at).toLocaleDateString()}
                       </span>
                    </div>
                  </div>

                  {pb.is_active && (
                    <div style={{ 
                      padding: '4px 10px', 
                      borderRadius: '2px', 
                      backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                      color: 'var(--auth-accent)',
                      fontSize: '9px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      border: '1px solid rgba(0, 255, 136, 0.2)'
                    }}>
                      ALIVE
                    </div>
                  )}
                </div>

                <div style={{ 
                  fontSize: '11px', 
                  color: 'var(--auth-text-muted)', 
                  fontFamily: "'Space Mono', monospace",
                  lineHeight: '1.6',
                  height: '48px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                  {pb.original_nl_input}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                   <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Layers size={12} style={{ color: 'var(--auth-accent)' }} />
                         <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff' }}>4 NODES</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Zap size={12} style={{ color: 'var(--brand)' }} />
                         <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff' }}>DETERMINISTIC</span>
                      </div>
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
                          padding: '4px',
                          cursor: 'pointer',
                          color: 'rgba(255, 255, 255, 0.15)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.15)'}
                      >
                        <Trash2 size={12} />
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isDark={true}
        title={confirmConfig.id === 'all' ? 'Purge System Library' : 'Delete Logic Specification'}
        message={confirmConfig.id === 'all' 
          ? 'Are you certain you want to purge the entire library? Metadata and logic graphs will be permanently erased.' 
          : `Are you certain you want to delete "${confirmConfig.name}"? This will terminate the associated logic graph permanently.`
        }
        confirmText={confirmConfig.id === 'all' ? 'Purge All' : 'Delete Specification'}
      />
    </div>
  );
}

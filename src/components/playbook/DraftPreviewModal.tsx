import React, { useEffect } from 'react';
import { X, CheckCircle2, ShieldAlert, Target, Zap, Activity } from 'lucide-react';

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftPreviewModal({ isOpen, onClose, draft }: DraftPreviewModalProps) {
  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const skeleton = draft?.context_skeleton || {};
  const rules = draft?.rules || [];

  const symbol = skeleton.symbol;
  const marketData = skeleton.market_data || [];
  const metrics = skeleton.ta_lib_metrics || [];
  const accountFields = skeleton.account_fields || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        maxHeight: '85vh',
        backgroundColor: '#0a0a0a',
        border: '1px solid var(--auth-border)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--auth-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.02em' }}>
              Draft Playbook Preview
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--auth-text-muted)' }}>
              A real-time structural view of the logic extracted from your session.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--auth-text-muted)',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--auth-text-muted)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          
          {/* Section: Context & Core Configuration */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Target size={16} color="#00ff88" />
              <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Operational Context
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
              {/* Target Symbol */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--auth-border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--auth-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Target Asset</div>
                {symbol ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={14} color="#00ff88" />
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', fontFamily: "'Space Mono', monospace" }}>{symbol}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                    <ShieldAlert size={14} color="var(--auth-text-muted)" />
                    <span style={{ fontSize: '13px', color: 'var(--auth-text-muted)' }}>Not specified</span>
                  </div>
                )}
              </div>

              {/* Data Feeds */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--auth-border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--auth-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Required Streams</div>
                {marketData.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {marketData.map((feed: string, idx: number) => (
                      <span key={idx} style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', fontSize: '12px', color: '#ffffff' }}>{feed}</span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--auth-text-muted)', opacity: 0.5 }}>Standard OHLCV</span>
                )}
              </div>
            </div>
          </section>

          {/* Section: Indicators */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity size={16} color="#00ff88" />
              <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Technical Indicators
              </h3>
            </div>
            
            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--auth-border)' }}>
               {metrics.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {metrics.map((m: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', fontFamily: "'Space Mono', monospace" }}>{m.name}</span>
                          {m.timeperiod && <span style={{ fontSize: '12px', color: 'var(--auth-text-muted)' }}>({m.timeperiod} periods)</span>}
                        </div>
                        {m.params && Object.keys(m.params).length > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--auth-text-muted)' }}>
                            {Object.entries(m.params).map(([k,v]) => `${k}:${v}`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
               ) : (
                 <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>
                    <Activity size={24} color="var(--auth-text-muted)" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', color: 'var(--auth-text-muted)' }}>No indicators identified yet.</div>
                 </div>
               )}
            </div>
          </section>

          {/* Section: Rules Array */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={16} color="#00ff88" />
              <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Extracted Rules ({rules.length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rules.length > 0 ? (
                rules.map((rule: any, idx: number) => (
                  <div key={idx} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--auth-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{rule.name}</div>
                      <div style={{ 
                        fontSize: '9px', 
                        fontWeight: 900, 
                        color: 'black', 
                        backgroundColor: '#00ff88',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                      }}>
                        {rule.category}
                      </div>
                    </div>
                    {/* Conditions / Extensions summary */}
                    <div style={{ fontSize: '12px', color: 'var(--auth-text-muted)', lineHeight: '1.5' }}>
                      {rule.extensions?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {rule.extensions.map((ext: any, i: number) => (
                            <span key={i} style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                              {ext.primitive}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>No executable handlers defined yet.</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px dashed var(--auth-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--auth-text-muted)' }}>Awaiting logic constraints...</div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Account Dependencies */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldAlert size={16} color="#00ff88" />
              <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Account Dependencies
              </h3>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--auth-border)' }}>
              {accountFields.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {accountFields.map((field: string, idx: number) => (
                    <span key={idx} style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', fontSize: '12px', color: '#ffffff' }}>{field}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--auth-text-muted)', opacity: 0.5 }}>None specified.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

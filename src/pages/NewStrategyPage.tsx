import { useEffect, useRef, useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Send,
  Sparkles,
  Zap,
  Shield,
  Target,
  BarChart3,
  Trash2,
  CheckCircle2,
  Activity,
  FileCode,
  ChevronDown
} from 'lucide-react';
import { IconButton } from '../components/common/IconButton';
import { DraftPreviewModal } from '../components/playbook/DraftPreviewModal';

const STRATEGY_TEMPLATES = [
  {
    category: 'RISK LIMITS',
    icon: Shield,
    title: 'Max 2% per trade',
    description: 'e.g. 10% max drawdown',
    content: 'Risk exactly 2% of my current session balance per trade. If I reach a daily drawdown of 5%, close all positions and stop trading for the day.'
  },
  {
    category: 'ENTRY CONDITIONS',
    icon: Target,
    title: 'Close above VWAP',
    description: 'e.g. 5m VWAP crossover',
    content: 'Enter a long position when the price closes above the VWAP on the 5-minute chart, provided the RSI is above 50.'
  },
  {
    category: 'EXIT RULES',
    icon: Zap,
    title: 'Trailing stop at 1.5 ATR',
    description: 'e.g. Dynamic ATR exit',
    content: 'Set a trailing stop at 1.5 times the 14-period ATR. Exit the position if the price breaks below the 20-period EMA.'
  },
  {
    category: 'POSITION SIZING',
    icon: BarChart3,
    title: 'Inverse volatility',
    description: 'e.g. 3 contracts max',
    content: 'Size my positions based on inverse volatility. My maximum exposure should never exceed 3 contracts at any time.'
  }
];

export function NewStrategyPage() {
  const {
    playbookInput,
    setPlaybookInput,
    selectedMarket,
    setSelectedMarket,
    availableMarkets,
    isLoadingMarkets,
    chatWithSystem,
    selectedPlaybook,
    setSelectedPlaybook,
    playbooks,
    isSubmitting,
    streamingMessage,
    draftChatHistory,
    currentDraft,
    finalizePlaybook,
    resetDraft,
    deletePlaybook,
    setIsSubmitting
  } = usePlaybookContext();

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef(selectedPlaybook?.generation_status);

  const startNewChat = () => {
    setSelectedPlaybook(null);
    setPlaybookInput('');
    setIsSubmitting(false);
    resetDraft();
  };

  useEffect(() => {
    if (prevStatusRef.current === 'PENDING' && selectedPlaybook?.generation_status === 'COMPLETED') {
      navigate('/playbooks');
    }
    prevStatusRef.current = selectedPlaybook?.generation_status;
  }, [selectedPlaybook?.generation_status, navigate]);

  // Navigation Reset: Always show Hero View when navigating to New Strategy initially
  useEffect(() => {
    setSelectedPlaybook(null);
    setPlaybookInput('');
    resetDraft();
    setIsSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPlaybook?.chat_history, isSubmitting, streamingMessage]);

  const handleSubmit = async () => {
    if (!playbookInput.trim() || isSubmitting) return;
    
    // Always use chatWithSystem now; it handles both stateful and draft flows
    await chatWithSystem(playbookInput);
    setPlaybookInput('');
  };

  const handleSelectTemplate = (content: string) => {
    setPlaybookInput(content);
  };

  const isInitialTurn = !selectedPlaybook && draftChatHistory.length === 0;
  const chatHistory = selectedPlaybook ? (selectedPlaybook.chat_history || []) : draftChatHistory;
  const isInitialView = chatHistory.length === 0 && !isSubmitting;

  const cardStyle = {
    backgroundColor: 'var(--auth-input-bg)',
    border: '1px solid var(--auth-border)',
    borderRadius: '4px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    textAlign: 'left' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      height: '100%',
      backgroundColor: 'var(--auth-black)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Sidebar Overlay for better contrast */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(0, 255, 136, 0.02) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>

      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '260px' : '0px',
        flexShrink: 0,
        backgroundColor: 'rgba(5, 5, 5, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--auth-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <button 
            onClick={startNewChat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid var(--auth-border)',
              backgroundColor: 'white',
              fontSize: '11px',
              fontWeight: 900,
              color: 'black',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={14} strokeWidth={3} />
            New Playbook
          </button>

          <div style={{ marginTop: '32px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', marginLeft: '8px', marginBottom: '16px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Historical Archives
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {playbooks.map(pb => (
                <div key={pb.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }} className="history-item-container">
                  <button
                    onClick={() => setSelectedPlaybook(pb)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: selectedPlaybook?.id === pb.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                      fontSize: '13px',
                      color: selectedPlaybook?.id === pb.id ? '#ffffff' : 'var(--auth-text-muted)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { if (selectedPlaybook?.id !== pb.id) e.currentTarget.style.color = '#ffffff' }}
                    onMouseLeave={e => { if (selectedPlaybook?.id !== pb.id) e.currentTarget.style.color = 'var(--auth-text-muted)' }}
                  >
                    <MessageSquare size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: selectedPlaybook?.id === pb.id ? 600 : 400 }}>{pb.name}</span>
                  </button>
                  <div className="history-delete-button">
                    <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Permanently delete this playbook archive?')) {
                        void deletePlaybook(pb.id);
                      }
                    }}
                    icon={Trash2}
                    label={`Delete ${pb.name}`}
                    variant="danger"
                    isDark={true}
                    size={13}
                    style={{ opacity: 0, width: '30px', height: '30px' }}
                  />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: 'transparent'
      }}>
        {/* Sidebar Toggle */}
        <div style={{ 
          height: '56px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: 'linear-gradient(to bottom, rgba(5,5,5,0.8), transparent)'
        }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: 'var(--auth-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--auth-text-muted)'}
          >
            <Menu size={20} />
          </button>

          {/* Condensed Logic Inspector (Top Right) */}
          {currentDraft && !selectedPlaybook && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--auth-border)',
              borderRadius: '99px',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCode size={12} color="#00ff88" />
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.1em' }}>
                  {currentDraft.rules?.length || 0} RULES EXTRACTED
                </span>
              </div>
              <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>
                  {currentDraft.context_skeleton?.ta_lib_metrics?.length || 0} INDICATORS
                </span>
              </div>
              {currentDraft.status === 'ok' && (
                <CheckCircle2 size={12} color="#00ff88" style={{ marginLeft: '4px' }} />
              )}
            </div>
          )}
        </div>

        {/* Unified Container for SCROLLING Chat and INITIAL Parser */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          padding: isInitialView ? '0' : '80px 20px 200px 20px'
        }}>
          {!isInitialView ? (
            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {chatHistory.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    gap: '24px',
                    alignItems: 'flex-start',
                    animation: 'fadeIn 0.5s ease-out'
                  }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '4px', 
                      backgroundColor: isUser ? 'rgba(255,255,255,0.03)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '4px',
                      border: isUser ? '1px solid var(--auth-border)' : 'none'
                    }}>
                      {isUser ? <Plus size={16} color="rgba(255,255,255,0.4)" /> : <Sparkles size={16} color="black" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', marginBottom: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        {isUser ? 'Playbook Ingestor' : 'Core Intelligence Signal'}
                      </div>
                      <div style={{ 
                          fontSize: '15px',
                          color: isUser ? 'rgba(255,255,255,0.9)' : '#ffffff',
                          lineHeight: '1.7',
                          whiteSpace: 'pre-wrap',
                          fontFamily: isUser ? "'Space Mono', monospace" : 'inherit',
                          letterSpacing: isUser ? '-0.01em' : '0'
                      }}>
                          {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Streaming Content */}
              {streamingMessage && (
                <div style={{ 
                  display: 'flex', 
                  gap: '24px',
                  alignItems: 'flex-start',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '4px', 
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '4px'
                  }}>
                    <Sparkles size={16} color="black" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', marginBottom: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      Transmitting Signal...
                    </div>
                    <div style={{ 
                        fontSize: '15px',
                        color: '#ffffff',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {streamingMessage}
                        <span style={{ 
                          display: 'inline-block', 
                          width: '8px', 
                          height: '16px', 
                          backgroundColor: '#00ff88', 
                          marginLeft: '4px',
                          verticalAlign: 'middle',
                          animation: 'blink 0.8s infinite'
                        }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              {isSubmitting && !streamingMessage && (
                 <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                   <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '4px', 
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Sparkles size={16} color="black" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', marginBottom: '12px', letterSpacing: '0.2em' }}>SYSTEM_CORE</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                            {selectedPlaybook?.generation_status === 'PENDING' ? 'Compiling playbook...' : 'Core thinking...'}
                          </span>
                          <div className="thinking-dots" style={{ color: 'var(--auth-text-muted)', fontSize: '20px', lineHeight: 1 }}>
                            <span>.</span><span>.</span><span>.</span>
                          </div>
                        </div>
                        {/* Core logic pulse indicator */}
                        <div style={{ 
                          width: '100%', 
                          height: '2px', 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          borderRadius: '1px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <div style={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '40%',
                            background: 'linear-gradient(to right, transparent, #00ff88, transparent)',
                            animation: 'logicPulse 1.5s infinite linear'
                          }}></div>
                        </div>
                      </div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* INITIAL VIEW - Centered without scrolling */
            <div style={{ 
              width: '100%', 
              height: '100%', 
              maxWidth: '850px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              padding: '40px 20px',
              gap: '24px'
            }}>
              {/* 1. HERO HEADER */}
              <div style={{ textAlign: 'center', marginBottom: '8px', animation: 'heroFade 0.8s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
                   <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, var(--auth-border))' }}></div>
                   <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.3em', color: 'var(--auth-text-muted)', textTransform: 'uppercase' }}>Universal Playbook Parser</span>
                   <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, var(--auth-border))' }}></div>
                </div>
                <h1 style={{ 
                  fontSize: '56px', 
                  fontFamily: "'Cormorant Garamond', serif", 
                  margin: '0 0 12px 0',
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  lineHeight: '1',
                  color: '#ffffff'
                }}>
                  AI Playbook Parser
                </h1>
                <p style={{ 
                  fontSize: '15px', 
                  color: 'var(--auth-text-muted)', 
                  margin: 0,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.05em',
                  fontWeight: 400
                }}>
                  Translate natural language into a precise deterministic playbook.
                </p>
              </div>

              {/* 2. PARSER BOX */}
              <div style={{ 
                backgroundColor: 'rgba(5, 5, 5, 0.8)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '4px', 
                border: `1px solid ${playbookInput ? 'rgba(255, 255, 255, 0.2)' : 'var(--auth-border)'}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: playbookInput ? '0 40px 100px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.02)' : '0 20px 50px rgba(0,0,0,0.5)',
                animation: 'heroFade 1s ease-out'
              }}>
                {isInitialTurn && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--auth-border)', paddingBottom: '16px', marginBottom: '2px' }}>
                     <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.2em' }}>ASSET_PROFILE</span>
                     <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                       <select
                         className="tmom-select tmom-select-dark"
                         value={selectedMarket}
                         onChange={(e) => setSelectedMarket(e.target.value)}
                         disabled={isLoadingMarkets}
                         style={{
                           padding: '4px 34px 4px 12px',
                           borderRadius: '2px',
                           border: '1px solid var(--auth-border)',
                           backgroundColor: 'rgba(255,255,255,0.03)',
                           fontSize: '11px',
                           fontWeight: 900,
                           color: '#ffffff',
                           outline: 'none',
                           cursor: 'pointer',
                           fontFamily: "'Space Mono', monospace",
                           appearance: 'none',
                           WebkitAppearance: 'none',
                           MozAppearance: 'none',
                           letterSpacing: '0.1em',
                           minHeight: '30px'
                         }}
                       >
                         {availableMarkets.length === 0 && <option value="">No markets</option>}
                         {availableMarkets.map((market) => (
                           <option key={market.symbol} value={market.symbol}>{market.symbol}</option>
                         ))}
                       </select>
                       <ChevronDown
                         size={12}
                         style={{
                           position: 'absolute',
                           right: '12px',
                           pointerEvents: 'none',
                           color: 'rgba(255, 255, 255, 0.7)'
                         }}
                       />
                     </div>
                     <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--auth-accent)', animation: 'pulse 2s infinite' }}></div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
                     </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                   <span style={{ color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '20px', marginTop: '4px', opacity: 0.5 }}>&gt;</span>
                   <textarea 
                     placeholder={isInitialTurn ? "Describe your playbook constraints..." : "Input playbook refinements..."}
                     value={playbookInput}
                     onChange={(e) => setPlaybookInput(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSubmit();
                       }
                     }}
                     style={{ 
                         flex: 1,
                         border: 'none', 
                         fontSize: '15px',
                         outline: 'none',
                         resize: 'none',
                         minHeight: '28px',
                         maxHeight: '200px',
                         fontFamily: "'Space Mono', monospace",
                         lineHeight: '1.7',
                         padding: '4px 0',
                         backgroundColor: 'transparent',
                         color: '#ffffff',
                         letterSpacing: '-0.02em'
                     }} 
                   />
                   <button
                     onClick={handleSubmit}
                     disabled={isSubmitting || !playbookInput.trim() || (isInitialTurn && !selectedMarket)}
                     style={{
                       padding: '10px 20px',
                       borderRadius: '2px',
                       backgroundColor: (isSubmitting || !playbookInput.trim() || (isInitialTurn && !selectedMarket)) ? 'rgba(255,255,255,0.03)' : '#ffffff',
                       color: (isSubmitting || !playbookInput.trim() || (isInitialTurn && !selectedMarket)) ? 'rgba(255,255,255,0.2)' : 'black',
                       border: 'none',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: '10px',
                       cursor: (isSubmitting || !playbookInput.trim()) ? 'not-allowed' : 'pointer',
                       transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                       flexShrink: 0,
                       fontSize: '10px',
                       fontWeight: 900,
                       letterSpacing: '0.15em',
                       textTransform: 'uppercase'
                     }}
                   >
                     {isSubmitting ? <div className="loading-spinner" /> : <Send size={15} strokeWidth={2.5} />}
                     {isSubmitting ? 'Parsing' : (isInitialTurn ? 'Initialize' : 'Transmit')}
                   </button>
                </div>
              </div>

              {/* 4. TEMPLATES (Blueprints) */}
              <div style={{ animation: 'heroFade 1.1s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Available Blueprints</span>
                  <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, var(--auth-border), transparent)' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {STRATEGY_TEMPLATES.map((template, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectTemplate(template.content)}
                      style={{
                        ...cardStyle,
                        ...(playbookInput === template.content ? { 
                          borderColor: 'white', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        } : {})
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={e => {
                        if (playbookInput !== template.content) {
                          e.currentTarget.style.borderColor = 'var(--auth-border)';
                          e.currentTarget.style.backgroundColor = 'var(--auth-input-bg)';
                        } else {
                          e.currentTarget.style.borderColor = 'white';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                    >
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ fontSize: '8px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.1em' }}>{template.category}</span>
                          <template.icon size={11} style={{ color: playbookInput === template.content ? 'white' : 'var(--auth-text-muted)', opacity: 0.5 }} />
                       </div>
                       <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>{template.title}</div>
                       <div style={{ fontSize: '11px', color: 'var(--auth-text-muted)', lineHeight: '1.4', fontWeight: 400 }}>{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Playbook Progression Model (Fixed Right) */}
          {!isInitialView && !selectedPlaybook && (
            <div style={{
              position: 'fixed',
              right: '24px',
              top: '120px',
              width: '240px',
              backgroundColor: 'rgba(5, 5, 5, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--auth-border)',
              borderRadius: '4px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              animation: 'heroFade 0.6s ease-out',
              zIndex: 30
            }}>
              <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Playbook Progression
              </div>
              
              {(() => {
                const progressionSteps = [
                  { label: 'Analyzing Intent', status: chatHistory.length > 0 ? 'COMPLETED' : 'PENDING' },
                  { label: 'Logic Extraction', status: currentDraft ? 'COMPLETED' : 'PENDING' },
                  { label: 'Indicator Mapping', status: (currentDraft?.context_skeleton?.ta_lib_metrics?.length > 0) ? 'COMPLETED' : 'PENDING' },
                  { label: 'Structural Validation', status: currentDraft?.status === 'ok' ? 'COMPLETED' : 'PENDING' }
                ];
                const completedStages = progressionSteps.filter(s => s.status === 'COMPLETED').length;
                const progressPercentage = (completedStages / progressionSteps.length) * 100;

                return (
                  <>
                    {progressionSteps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          border: `1px solid ${step.status === 'COMPLETED' ? '#00ff88' : 'var(--auth-border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: step.status === 'COMPLETED' ? 'rgba(0, 255, 136, 0.1)' : 'transparent'
                        }}>
                          {step.status === 'COMPLETED' ? <CheckCircle2 size={10} color="#00ff88" /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />}
                        </div>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: step.status === 'COMPLETED' ? '#ffffff' : 'var(--auth-text-muted)',
                          letterSpacing: '0.05em'
                        }}>
                          {step.label}
                        </span>
                      </div>
                    ))}

                    <div style={{ marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--auth-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button
                        onClick={() => setIsPreviewModalOpen(true)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          border: '1px solid var(--auth-border)',
                          fontSize: '10px',
                          fontWeight: 900,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      >
                        <Target size={12} />
                        Preview Draft
                      </button>
                      <button
                        onClick={() => {
                          if (progressPercentage === 100) {
                            finalizePlaybook();
                          }
                        }}
                        disabled={progressPercentage < 100}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '4px',
                          backgroundColor: progressPercentage === 100 ? '#00ff88' : 'rgba(255,255,255,0.05)',
                          color: progressPercentage === 100 ? 'black' : 'rgba(255,255,255,0.4)',
                          border: 'none',
                          fontSize: '10px',
                          fontWeight: 900,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          cursor: progressPercentage === 100 ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: progressPercentage === 100 ? '0 10px 30px rgba(0, 255, 136, 0.2)' : 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s'
                        }}
                      >
                        {progressPercentage < 100 && (
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${progressPercentage}%`,
                            backgroundColor: 'rgba(0, 255, 136, 0.2)',
                            transition: 'width 0.5s ease-out'
                          }} />
                        )}
                        <span style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Zap size={12} color={progressPercentage === 100 ? "black" : "rgba(255,255,255,0.4)"} />
                          Generate Playbook
                        </span>
                      </button>
                      <p style={{ fontSize: '9px', color: 'var(--auth-text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: '1.4' }}>
                        Deployment will finalize the playbook and move it to your historical archives.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Input Area (only fixed for chat mode) */}
        {!isInitialView && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '60px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(to top, var(--auth-black) 60%, transparent)',
            zIndex: 100
          }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
              {!selectedPlaybook && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px', gap: '12px', transform: 'translateY(-10px)' }}>
                   <button 
                     onClick={resetDraft}
                     style={{
                       display: 'flex',
                       alignItems: 'center',
                       gap: '6px',
                       padding: '6px 12px',
                       borderRadius: '4px',
                       backgroundColor: 'rgba(255, 255, 255, 0.05)',
                       border: '1px solid var(--auth-border)',
                       color: 'var(--auth-text-muted)',
                       fontSize: '10px',
                       fontWeight: 900,
                       textTransform: 'uppercase',
                       cursor: 'pointer'
                     }}
                   >
                     Reset Draft
                   </button>
                </div>
              )}
              <div style={{ 
                backgroundColor: 'rgba(5, 5, 5, 0.9)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '4px', 
                border: `1px solid ${playbookInput ? 'rgba(255, 255, 255, 0.3)' : 'var(--auth-border)'}`,
                padding: '20px',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
              }}>
                <span style={{ color: 'var(--auth-text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '20px', marginTop: '4px', opacity: 0.5 }}>&gt;</span>
                 <textarea 
                   placeholder={selectedPlaybook ? "Refine this playbook..." : "Describe your playbook constraints..."}
                   value={playbookInput}
                   onChange={(e) => setPlaybookInput(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSubmit();
                     }
                   }}
                   style={{ 
                       flex: 1,
                       border: 'none', 
                       fontSize: '15px',
                       outline: 'none',
                       resize: 'none',
                       minHeight: '28px',
                       maxHeight: '200px',
                       fontFamily: "'Space Mono', monospace",
                       lineHeight: '1.7',
                       padding: '4px 0',
                       backgroundColor: 'transparent',
                       color: '#ffffff'
                   }} 
                 />
                 <button
                   onClick={handleSubmit}
                   disabled={isSubmitting || !playbookInput.trim()}
                   style={{
                     padding: '10px 20px',
                     borderRadius: '2px',
                     backgroundColor: (isSubmitting || !playbookInput.trim()) ? 'rgba(255,255,255,0.03)' : (currentDraft?.status === 'ok' ? '#00ff88' : '#ffffff'),
                     color: (isSubmitting || !playbookInput.trim()) ? 'rgba(255,255,255,0.2)' : 'black',
                     border: 'none',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '10px',
                     cursor: (isSubmitting || !playbookInput.trim()) ? 'not-allowed' : 'pointer',
                     transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                     flexShrink: 0,
                     fontSize: '10px',
                     fontWeight: 900,
                     letterSpacing: '0.15em',
                     textTransform: 'uppercase'
                   }}
                 >
                   {isSubmitting ? <div className="loading-spinner" /> : <Send size={15} strokeWidth={2.5} />}
                   {isSubmitting ? 'Parsing' : (currentDraft?.status === 'ok' ? 'Add Detail' : 'Transmit')}
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .thinking-dots span {
          animation: blink 1.4s infinite both;
          font-weight: 900;
        }
        .thinking-dots span:nth-child(2) { animation-delay: .2s; }
        .thinking-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes blink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
        .loading-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top: 2px solid black;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes logicPulse {
          0% { left: -40%; }
          100% { left: 100%; }
        }
        .history-item-container:hover .history-delete-button button {
          opacity: 1 !important;
        }
        .history-delete-button button:hover {
          transform: scale(1.1);
        }
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        textarea::-webkit-scrollbar-thumb {
          background: var(--auth-border);
          border-radius: 2px;
        }
      ` }} />
      <DraftPreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} draft={currentDraft} />
    </div>
  );
}

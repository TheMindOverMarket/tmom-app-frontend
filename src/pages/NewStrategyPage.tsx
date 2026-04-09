import { useEffect, useRef, useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Clock,
  Send,
  Sparkles,
  Zap,
  Shield,
  Target,
  BarChart3
} from 'lucide-react';

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
    createPlaybookFromNL,
    chatWithSystem,
    selectedPlaybook,
    setSelectedPlaybook,
    playbooks,
    isSubmitting
  } = usePlaybookContext();

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef(selectedPlaybook?.generation_status);

  const startNewChat = () => {
    setSelectedPlaybook(null);
    setPlaybookInput('');
  };

  useEffect(() => {
    if (prevStatusRef.current !== 'COMPLETED' && selectedPlaybook?.generation_status === 'COMPLETED') {
      navigate('/playbooks');
    }
    prevStatusRef.current = selectedPlaybook?.generation_status;
  }, [selectedPlaybook?.generation_status, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPlaybook?.chat_history, isSubmitting]);

  const handleSubmit = async () => {
    if (!playbookInput.trim() || isSubmitting) return;
    
    if (selectedPlaybook?.generation_status === 'INCOMPLETE' || selectedPlaybook?.generation_status === 'INITIALIZING') {
      await chatWithSystem(playbookInput);
      setPlaybookInput('');
    } else if (!selectedPlaybook || selectedPlaybook.generation_status === 'FAILED') {
      await createPlaybookFromNL();
      setPlaybookInput('');
    }
  };

  const handleSelectTemplate = (content: string) => {
    setPlaybookInput(content);
  };

  const isInitialTurn = !selectedPlaybook || selectedPlaybook.generation_status === 'FAILED';
  const chatHistory = selectedPlaybook?.chat_history || [];
  const isInitialView = chatHistory.length === 0 && !isSubmitting;

  const cardStyle = {
    backgroundColor: 'var(--auth-input-bg)',
    border: '1px solid var(--auth-border)',
    borderRadius: '4px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
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
            Initialize Logic
          </button>

          <div style={{ marginTop: '32px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', marginLeft: '8px', marginBottom: '16px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Historical Archives
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {playbooks.map(pb => (
                <button
                  key={pb.id}
                  onClick={() => setSelectedPlaybook(pb)}
                  style={{
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
          padding: '0 20px',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10
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
        </div>

        {/* Scrolling Chat Content */}
        {!isInitialView && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '80px 20px 200px 20px'
          }}>
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
                        {isUser ? 'Strategy Ingestor' : 'Core Intelligence Signal'}
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
              
              {isSubmitting && (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="thinking-dots" style={{ color: 'var(--auth-text-muted)', fontSize: '20px' }}>
                          <span>.</span><span>.</span><span>.</span>
                        </div>
                      </div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Initial View (Parser Hero) */}
        {isInitialView && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            marginTop: '-60px'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', width: '100%', animation: 'heroFade 1s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
                 <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, var(--auth-border))' }}></div>
                 <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', color: 'var(--auth-text-muted)', textTransform: 'uppercase' }}>Universal Strategy Parser</span>
                 <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, var(--auth-border))' }}></div>
              </div>
              
              <h1 style={{ 
                fontSize: '72px', 
                fontFamily: "'Cormorant Garamond', serif", 
                margin: '0 0 20px 0',
                fontWeight: 300,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                lineHeight: '1',
                color: '#ffffff'
              }}>
                AI Strategy Parser
              </h1>
              
              <p style={{ 
                fontSize: '18px', 
                color: 'var(--auth-text-muted)', 
                marginBottom: '60px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.05em',
                fontWeight: 300
              }}>
                Translate natural language into precise deterministic execution rules.
              </p>
            </div>
          </div>
        )}

        {/* Unified Input Area */}
        <div style={{
          position: isInitialView ? 'relative' : 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: isInitialView ? '0 24px 80px 24px' : '60px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: isInitialView ? 'transparent' : 'linear-gradient(to top, var(--auth-black) 60%, transparent)',
          zIndex: 100,
          transition: 'all 0.5s ease'
        }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            {/* Parser Box */}
            <div style={{ 
              backgroundColor: 'rgba(5, 5, 5, 0.8)', 
              backdropFilter: 'blur(20px)',
              borderRadius: '4px', 
              border: `1px solid ${playbookInput ? 'rgba(255, 255, 255, 0.2)' : 'var(--auth-border)'}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: playbookInput ? '0 40px 100px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.02)' : '0 20px 50px rgba(0,0,0,0.5)',
              position: 'relative'
            }}>
              {isInitialTurn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--auth-border)', paddingBottom: '20px', marginBottom: '4px' }}>
                   <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.2em' }}>ASSET_PROFILE</span>
                   <div style={{ position: 'relative' }}>
                    <select
                      value={selectedMarket}
                      onChange={(e) => setSelectedMarket(e.target.value)}
                      disabled={isLoadingMarkets}
                      style={{
                        padding: '6px 14px',
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
                        letterSpacing: '0.1em'
                      }}
                    >
                      {availableMarkets.length === 0 && <option value="">No markets</option>}
                      {availableMarkets.map((market) => (
                        <option key={market.symbol} value={market.symbol}>{market.symbol}</option>
                      ))}
                    </select>
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
                   placeholder={isInitialTurn ? "Describe your strategy constraints..." : "Input refinement logic..."}
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
                       fontSize: '16px',
                       outline: 'none',
                       resize: 'none',
                       minHeight: '32px',
                       maxHeight: '400px',
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
                     fontSize: '11px',
                     fontWeight: 900,
                     letterSpacing: '0.15em',
                     textTransform: 'uppercase'
                   }}
                 >
                   {isSubmitting ? <div className="loading-spinner" /> : <Send size={15} strokeWidth={2.5} />}
                   {isSubmitting ? 'Processing' : (isInitialTurn ? 'Initialize' : 'Transmit')}
                 </button>
              </div>
            </div>

            {/* Templates & History (ONLY ON INITIAL VIEW) */}
            {isInitialView && (
              <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '48px', animation: 'heroFade 1.2s ease-out' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Available Blueprints</span>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, var(--auth-border), transparent)' }}></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {STRATEGY_TEMPLATES.map((template, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectTemplate(template.content)}
                        style={{
                          ...cardStyle,
                          ...(playbookInput === template.content ? { 
                            borderColor: 'white', 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            transform: 'translateY(-2px)'
                          } : {})
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          if (playbookInput !== template.content) {
                            e.currentTarget.style.borderColor = 'var(--auth-border)';
                            e.currentTarget.style.backgroundColor = 'var(--auth-input-bg)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          } else {
                            e.currentTarget.style.borderColor = 'white';
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                      >
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.15em' }}>{template.category}</span>
                            <template.icon size={12} style={{ color: playbookInput === template.content ? 'white' : 'var(--auth-text-muted)', opacity: 0.5 }} />
                         </div>
                         <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.01em' }}>{template.title}</div>
                         <div style={{ fontSize: '12px', color: 'var(--auth-text-muted)', lineHeight: '1.5', fontWeight: 400 }}>{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {playbooks.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Recent Derivations</span>
                      <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, var(--auth-border), transparent)' }}></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                      {playbooks.slice(0, 4).map(pb => (
                        <button
                          key={pb.id}
                          onClick={() => setSelectedPlaybook(pb)}
                          style={cardStyle}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--auth-border)';
                            e.currentTarget.style.backgroundColor = 'var(--auth-input-bg)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <Clock size={11} color="var(--auth-text-muted)" style={{ opacity: 0.6 }} />
                             <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--auth-text-muted)', letterSpacing: '0.05em' }}>{new Date(pb.created_at).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pb.name}</div>
                          <div style={{ 
                            fontSize: '9px', 
                            padding: '3px 8px', 
                            borderRadius: '2px', 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 900,
                            width: 'fit-content',
                            letterSpacing: '0.15em',
                            border: '1px solid var(--auth-border)'
                          }}>
                            {pb.market}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        textarea::-webkit-scrollbar-thumb {
          background: var(--auth-border);
          border-radius: 2px;
        }
      ` }} />
    </div>
  );
}

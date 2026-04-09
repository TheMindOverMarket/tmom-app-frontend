import { useEffect, useRef, useState } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Trash2, 
  LayoutGrid, 
  Clock,
  Send,
  Sparkles,
  ChevronRight
} from 'lucide-react';

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

  // Clear selection on switch to "New Chat" state if not specifically viewing something
  const startNewChat = () => {
    setSelectedPlaybook(null);
    setPlaybookInput('');
  };

  // Only navigate away if the playbook transitions INTO a COMPLETED state during this session.
  useEffect(() => {
    if (prevStatusRef.current !== 'COMPLETED' && selectedPlaybook?.generation_status === 'COMPLETED') {
      navigate('/playbooks');
    }
    prevStatusRef.current = selectedPlaybook?.generation_status;
  }, [selectedPlaybook?.generation_status, navigate]);

  // Scroll to bottom whenever chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPlaybook?.chat_history, isSubmitting]);

  const handleSubmit = async () => {
    if (!playbookInput.trim()) return;
    
    if (selectedPlaybook?.generation_status === 'INCOMPLETE' || selectedPlaybook?.generation_status === 'INITIALIZING') {
      await chatWithSystem(playbookInput);
      setPlaybookInput('');
    } else if (!selectedPlaybook || selectedPlaybook.generation_status === 'FAILED') {
      await createPlaybookFromNL();
      setPlaybookInput('');
    }
  };

  const isInitialTurn = !selectedPlaybook || selectedPlaybook.generation_status === 'FAILED';
  const chatHistory = selectedPlaybook?.chat_history || [];

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      height: '100%',
      backgroundColor: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '260px' : '0px',
        flexShrink: 0,
        backgroundColor: '#f9f9f9',
        borderRight: '1px solid #ececec',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <button 
            onClick={startNewChat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              backgroundColor: 'white',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1a1a1a',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f4f4f4'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
          >
            <Plus size={16} strokeWidth={2.5} />
            New Strategy
          </button>

          <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#8e8e8e', marginLeft: '12px', marginBottom: '8px', letterSpacing: '0.05em' }}>
              CHAT HISTORY
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {playbooks.map(pb => (
                <button
                  key={pb.id}
                  onClick={() => setSelectedPlaybook(pb)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedPlaybook?.id === pb.id ? '#ececec' : 'transparent',
                    fontSize: '13px',
                    color: '#444',
                    textAlign: 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onMouseEnter={e => { if (selectedPlaybook?.id !== pb.id) e.currentTarget.style.backgroundColor = '#f0f0f0' }}
                  onMouseLeave={e => { if (selectedPlaybook?.id !== pb.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <MessageSquare size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{pb.name}</span>
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
        backgroundColor: '#ffffff'
      }}>
        {/* Top Control Bar */}
        <div style={{ 
          height: '48px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 16px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10
        }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Chat / Dashboard Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px 20px',
          paddingBottom: '140px'
        }}>
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Dashboard View (Empty State) */}
            {chatHistory.length === 0 && !isSubmitting && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4vh' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  backgroundColor: '#f4f4f4', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Sparkles size={24} color="#6366f1" />
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#222', marginBottom: '12px' }}>
                  What's your strategy today?
                </h2>
                <p style={{ color: '#666', fontSize: '15px', marginBottom: '40px', textAlign: 'center', maxWidth: '500px' }}>
                  Select a market and describe your logic. I'll translate it into deterministic execution rules.
                </p>

                {playbooks.length > 0 && (
                  <div style={{ width: '100%', marginTop: '20px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#999', marginBottom: '16px', letterSpacing: '0.05em' }}>RECENT STRATEGIES</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {playbooks.slice(0, 4).map(pb => (
                        <button
                          key={pb.id}
                          onClick={() => setSelectedPlaybook(pb)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e5e5e5',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#6366f1';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.08)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e5e5e5';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                             <Clock size={12} color="#999" />
                             <span style={{ fontSize: '10px', fontWeight: 700, color: '#999' }}>{new Date(pb.created_at).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>{pb.name}</div>
                          <div style={{ 
                            fontSize: '11px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            backgroundColor: '#f0f0f0', 
                            color: '#666',
                            fontWeight: 700
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

            {/* Chat Messages */}
            {chatHistory.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} style={{ 
                  display: 'flex', 
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    backgroundColor: isUser ? '#f0f0f0' : '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '4px'
                  }}>
                    {isUser ? <Plus size={16} color="#666" /> : <Sparkles size={16} color="white" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>
                      {isUser ? 'You' : 'System'}
                    </div>
                    <div style={{ 
                        fontSize: '15px',
                        color: '#1a1a1a',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isSubmitting && (
               <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                 <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    backgroundColor: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={16} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#999', marginBottom: '4px' }}>SYSTEM</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px' }}>
                      <div className="thinking-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    </div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area (Rounded Pill style) */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(transparent, #ffffff 30%)'
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '800px', 
            backgroundColor: '#f4f4f4', 
            borderRadius: '24px', 
            border: '1px solid #e5e5e5',
            padding: '8px 12px 8px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            {isInitialTurn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', marginLeft: '4px' }}>
                 <span style={{ fontSize: '10px', fontWeight: 800, color: '#999', letterSpacing: '0.05em' }}>MARKET</span>
                 <select
                   value={selectedMarket}
                   onChange={(e) => setSelectedMarket(e.target.value)}
                   disabled={isLoadingMarkets}
                   style={{
                     padding: '2px 8px',
                     borderRadius: '6px',
                     border: 'none',
                     backgroundColor: '#e5e5e5',
                     fontSize: '11px',
                     fontWeight: 700,
                     color: '#444',
                     outline: 'none',
                     cursor: 'pointer'
                   }}
                 >
                   {availableMarkets.length === 0 && <option value="">No markets</option>}
                   {availableMarkets.map((market) => (
                     <option key={market.symbol} value={market.symbol}>{market.symbol}</option>
                   ))}
                 </select>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
               <textarea 
                 placeholder={isInitialTurn ? "Send a message..." : "Reply to the system..."}
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
                     minHeight: '24px',
                     maxHeight: '200px',
                     fontFamily: 'inherit',
                     lineHeight: '1.5',
                     padding: '8px 0',
                     backgroundColor: 'transparent',
                     color: '#1a1a1a'
                 }} 
               />
               <button
                 onClick={handleSubmit}
                 disabled={isSubmitting || !playbookInput.trim() || (isInitialTurn && !selectedMarket)}
                 style={{
                   width: '32px',
                   height: '32px',
                   borderRadius: '50%',
                   backgroundColor: (isSubmitting || !playbookInput.trim()) ? '#e5e5e5' : '#000000',
                   color: 'white',
                   border: 'none',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: (isSubmitting || !playbookInput.trim()) ? 'not-allowed' : 'pointer',
                   transition: 'all 0.2s',
                   flexShrink: 0,
                   marginBottom: '4px'
                 }}
               >
                 <Send size={16} strokeWidth={2.5} />
               </button>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '12px', fontWeight: 500 }}>
            TMOM Engine can't execute incomplete strategies. Keep chatting to refine.
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .thinking-dots span {
          animation: blink 1.4s infinite both;
          font-size: 24px;
          line-height: 0;
          font-weight: 900;
        }
        .thinking-dots span:nth-child(2) { animation-delay: .2s; }
        .thinking-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes blink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
      ` }} />
    </div>
  );
}


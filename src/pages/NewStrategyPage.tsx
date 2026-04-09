import { useEffect, useRef } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { useNavigate } from 'react-router-dom';

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
    isSubmitting
  } = usePlaybookContext();

  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPlaybook?.generation_status === 'COMPLETED') {
      navigate('/playbooks');
    }
  }, [selectedPlaybook?.generation_status, navigate]);

  // Scroll to bottom whenever chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPlaybook?.chat_history, isSubmitting]);

  const handleSubmit = async () => {
    if (!playbookInput.trim()) return;
    
    if (selectedPlaybook?.generation_status === 'INCOMPLETE') {
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
      flexDirection: 'column',
      flex: 1,
      height: '100%',
      backgroundColor: '#f8fafc',
      position: 'relative'
    }}>
      {/* Chat Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        paddingBottom: '120px' // room for the input
      }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {chatHistory.length === 0 && (
             <div style={{ textAlign: 'center', marginTop: '10vh' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>✨</div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  What's your strategy today?
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                  Select a market below and describe your trading logic. I'll help you extract it into deterministic rules.
                </p>
             </div>
          )}

          {chatHistory.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isUser ? 'flex-end' : 'flex-start' 
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {isUser ? 'YOU' : 'SYSTEM'}
                </span>
                <div style={{ 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    backgroundColor: isUser ? '#0f172a' : 'white', 
                    color: isUser ? 'white' : '#1e293b',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    boxShadow: isUser ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '15px',
                    maxWidth: '85%',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                }}>
                    {msg.content}
                </div>
              </div>
            );
          })}
          
          {isSubmitting && (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                    SYSTEM
                </span>
                <div style={{ 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#64748b',
                    fontSize: '14px'
                }}>
                   <div style={{ 
                      width: '16px', height: '16px', borderRadius: '50%', 
                      border: '2px solid #e2e8f0', borderTopColor: '#0f172a', 
                      animation: 'spin 0.8s linear infinite' 
                   }} />
                   Thinking...
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, #f8fafc 20%)',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '800px', 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {isInitialTurn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
               <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>MARKET:</label>
               <select
                 value={selectedMarket}
                 onChange={(e) => setSelectedMarket(e.target.value)}
                 disabled={isLoadingMarkets}
                 style={{
                   padding: '4px 8px',
                   borderRadius: '6px',
                   border: '1px solid #e2e8f0',
                   backgroundColor: '#f8fafc',
                   fontSize: '13px',
                   fontWeight: 600,
                   outline: 'none'
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
               placeholder={isInitialTurn ? "e.g., Go long on BTC when RSI crosses above 30..." : "Reply to the system..."}
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
                   minHeight: '44px',
                   maxHeight: '200px',
                   fontFamily: 'inherit',
                   lineHeight: '1.5',
                   padding: '10px 0',
                   backgroundColor: 'transparent'
               }} 
             />
             <button
               onClick={handleSubmit}
               disabled={isSubmitting || !playbookInput.trim() || (isInitialTurn && !selectedMarket)}
               style={{
                 width: '40px',
                 height: '40px',
                 borderRadius: '50%',
                 backgroundColor: (isSubmitting || !playbookInput.trim()) ? '#cbd5e1' : '#0f172a',
                 color: 'white',
                 border: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: (isSubmitting || !playbookInput.trim()) ? 'not-allowed' : 'pointer',
                 transition: 'background-color 0.2s',
                 flexShrink: 0
               }}
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <line x1="22" y1="2" x2="11" y2="13"></line>
                 <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
               </svg>
             </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
}

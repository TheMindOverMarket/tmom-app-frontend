import { useEffect } from 'react';
import { usePlaybookContext } from '../contexts/PlaybookContext';
import { PlaybookIngestion } from '../components/playbook/PlaybookIngestion';
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

  useEffect(() => {
    if (selectedPlaybook?.generation_status === 'COMPLETED') {
      navigate('/playbooks');
    }
  }, [selectedPlaybook?.generation_status, navigate]);

  const handleSubmit = async () => {
    if (selectedPlaybook?.generation_status === 'INCOMPLETE') {
      await chatWithSystem(playbookInput);
      setPlaybookInput('');
    } else if (!selectedPlaybook || selectedPlaybook.generation_status === 'FAILED') {
      await createPlaybookFromNL();
      setPlaybookInput('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      padding: '40px',
      alignItems: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 900, 
            color: '#0f172a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>Enter your strategy in Natural Language</h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#64748b', 
            margin: 0,
            fontWeight: 500
          }}>
            Describe your specific trading logic, conditions, risk models, and parameters below. 
            The TMOM Rule Engine will extract them into deterministic logic.
          </p>
        </div>

        <section style={{ 
          padding: '24px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <PlaybookIngestion 
            value={playbookInput}
            onChange={setPlaybookInput}
            selectedMarket={selectedMarket}
            onMarketChange={setSelectedMarket}
            availableMarkets={availableMarkets}
            isLoadingMarkets={isLoadingMarkets}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            chatHistory={selectedPlaybook?.chat_history}
            hideMarket={!!selectedPlaybook && selectedPlaybook.generation_status !== 'FAILED'}
          />
        </section>
      </div>
    </div>
  );
}

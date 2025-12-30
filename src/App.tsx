import { PriceChart } from './components/PriceChart';
import { BehaviorTimelinePanel } from './components/terminal/BehaviorTimelinePanel';

function App() {
  const symbol = "BTC-USD";

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      padding: '20px', 
      gap: '20px',
      backgroundColor: '#f3f4f6', // Light gray background for app
      fontFamily: 'sans-serif',
    }}>
      <header style={{ marginBottom: '4px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Mind Over Market <span style={{ fontWeight: 'normal', color: '#6B7280' }}>| Demo Scaffolding</span>
        </h1>
      </header>
      
      <div style={{ 
        flex: 1, 
        minHeight: '400px', 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <PriceChart />
      </div>
      
      <div style={{ height: '350px' }}>
         <BehaviorTimelinePanel symbol={symbol} />
      </div>
    </main>
  );
}

export default App;

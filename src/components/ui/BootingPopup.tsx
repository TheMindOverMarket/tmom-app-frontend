import { useEffect, useState } from 'react';
import { useSystemStatus } from '../../contexts/SystemStatusContext';

const PHRASES = [
  "Waking up the neural engines...",
  "Connecting to market data streams...",
  "Optimizing rule-engine execution...",
  "Fetching your active playbooks...",
  "Warming up the decision core...",
  "Establishing secure trading link...",
  "Synchronizing playback vectors...",
  "Almost there, finalizing data handshake..."
];

export function BootingPopup() {
  const { isBooting } = useSystemStatus();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate phrases
  useEffect(() => {
    if (!isBooting) return;
    
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isBooting]);

  // Simulate progress
  useEffect(() => {
    if (!isBooting) {
      setProgress(0);
      setPhraseIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we reach the "end" to simulate waiting for the actual response
        if (prev < 30) return prev + 2;
        if (prev < 60) return prev + 1;
        if (prev < 85) return prev + 0.5;
        if (prev < 98) return prev + 0.1;
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isBooting]);

  if (!isBooting) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)', // Slate-900 with opacity
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
      
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px'
          }}>
            ⚡
          </div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 800, 
            color: '#0f172a',
            margin: '0 0 8px 0'
          }}>
            Systems Booting Up
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#64748b',
            margin: 0,
            height: '20px', // Fixed height to prevent Layout Shift
            transition: 'opacity 0.3s ease-in-out'
          }}>
            {PHRASES[phraseIndex]}
          </p>
        </div>

        {/* Progress Container */}
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px',
          position: 'relative'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#0f172a',
            borderRadius: '4px',
            transition: 'width 0.4s cubic-bezier(0.1, 0.7, 0.1, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }} />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '11px', 
          fontWeight: 700, 
          color: '#94a3b8',
          letterSpacing: '0.05em'
        }}>
          <span>BOOTING PROCESS</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

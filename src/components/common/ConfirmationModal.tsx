import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isDark?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Proceed',
  cancelText = 'Cancel',
  isDanger = true,
  isDark = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: isDark ? 'var(--auth-black)' : 'white',
        border: isDark ? '1px solid var(--auth-border)' : 'none',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        animation: 'modalEnter 0.2s ease-out'
      }}>
        <div style={{
          padding: '24px',
          paddingBottom: '0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: isDark 
              ? (isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)')
              : (isDanger ? '#fef2f2' : '#f0f9ff'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark
              ? (isDanger ? '#ef4444' : 'var(--auth-accent)')
              : (isDanger ? '#dc2626' : '#0284c7'),
            border: isDark ? `1px solid ${isDanger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 255, 136, 0.2)'}` : 'none'
          }}>
            <AlertTriangle size={24} />
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--auth-text-muted)',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit',
            fontWeight: isDark ? 400 : 700, 
            color: isDark ? '#ffffff' : '#0f172a',
            margin: '0 0 8px 0'
          }}>
            {title}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--auth-text-muted)',
            lineHeight: 1.5,
            margin: 0,
            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
          }}>
            {message}
          </p>
        </div>

        <div style={{ 
          padding: '16px 24px 24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
          borderTop: isDark ? '1px solid var(--auth-border)' : 'none'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: isDark ? '1px solid var(--auth-border)' : '1px solid #e2e8f0',
              backgroundColor: isDark ? 'transparent' : 'white',
              fontSize: '12px',
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#475569',
              cursor: 'pointer',
              fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isDanger ? '#dc2626' : (isDark ? '#ffffff' : '#0f172a'),
              fontSize: '12px',
              fontWeight: 800,
              color: (isDark && !isDanger) ? '#000000' : 'white',
              cursor: 'pointer',
              fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
              textTransform: isDark ? 'uppercase' : 'none'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

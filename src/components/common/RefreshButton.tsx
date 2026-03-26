import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
  label?: string;
  style?: React.CSSProperties;
}

export function RefreshButton({ 
  onRefresh, 
  isLoading, 
  label = 'REFRESH',
  style 
}: RefreshButtonProps) {
  return (
    <button 
      onClick={onRefresh}
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '800',
        backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        color: isLoading ? '#94a3b8' : '#64748b',
        cursor: isLoading ? 'default' : 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        ...style
      }}
    >
      <RefreshCw 
        size={12} 
        style={{ 
          color: isLoading ? '#6366f1' : '#64748b',
          animation: isLoading ? 'spin 1.5s linear infinite' : 'none' 
        }} 
      />
      <span>{isLoading ? 'REFRESHING...' : label}</span>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

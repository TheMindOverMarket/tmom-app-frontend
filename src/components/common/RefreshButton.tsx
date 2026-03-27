import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
  label?: string;
}

export function RefreshButton({ 
  onRefresh, 
  isLoading, 
  label = 'REFRESH'
}: RefreshButtonProps) {
  return (
    <button 
      onClick={onRefresh}
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 12px',
        height: '32px',
        fontSize: '10px',
        fontWeight: '900',
        backgroundColor: isLoading ? 'var(--slate-50)' : '#ffffff',
        border: `1px solid var(--slate-200)`,
        borderRadius: '4px',
        color: isLoading ? 'var(--slate-400)' : 'var(--slate-600)',
        cursor: isLoading ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'none',
        letterSpacing: '0.05em'
      }}
      onMouseOver={e => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--slate-50)')}
      onMouseOut={e => !isLoading && (e.currentTarget.style.backgroundColor = '#ffffff')}
    >
      <RefreshCw 
        size={12} 
        style={{ 
          color: isLoading ? 'var(--brand)' : 'var(--slate-600)',
          animation: isLoading ? 'spin 1.5s linear infinite' : 'none' 
        }} 
      />
      <span>{isLoading ? 'REFRESHING...' : label}</span>
    </button>
  );
}

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
        padding: '6px 14px',
        fontSize: '11px',
        fontWeight: '800',
        backgroundColor: isLoading ? 'var(--slate-50)' : '#ffffff',
        border: `1px solid var(--slate-200)`,
        borderRadius: 'var(--radius-md)',
        color: isLoading ? 'var(--slate-400)' : 'var(--slate-600)',
        cursor: isLoading ? 'default' : 'pointer',
        transition: 'var(--transition)',
        boxShadow: 'var(--shadow-sm)',
        ...style
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

import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
  label?: string;
  isDark?: boolean;
}

export function RefreshButton({ 
  onRefresh, 
  isLoading, 
  label = 'REFRESH',
  isDark = false
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
        backgroundColor: isLoading 
          ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'var(--slate-50)') 
          : (isDark ? 'transparent' : '#ffffff'),
        border: `1px solid ${isDark ? 'var(--auth-border)' : 'var(--slate-200)'}`,
        borderRadius: '4px',
        color: isLoading 
          ? (isDark ? 'rgba(255, 255, 255, 0.3)' : 'var(--slate-400)') 
          : (isDark ? '#ffffff' : 'var(--slate-600)'),
        cursor: isLoading ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'none',
        letterSpacing: '0.05em',
        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
      }}
      onMouseOver={e => !isLoading && (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'var(--slate-50)')}
      onMouseOut={e => !isLoading && (e.currentTarget.style.backgroundColor = isDark ? 'transparent' : '#ffffff')}
    >
      <RefreshCw 
        size={12} 
        style={{ 
          color: isLoading ? 'var(--auth-accent)' : (isDark ? '#ffffff' : 'var(--slate-600)'),
          animation: isLoading ? 'spin 1.5s linear infinite' : 'none' 
        }} 
      />
      <span>{isLoading ? 'REFRESHING...' : label}</span>
    </button>
  );
}

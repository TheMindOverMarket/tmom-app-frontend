import { RefreshCw } from 'lucide-react';
import { ActionButton } from './ActionButton';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
  label?: string;
  isDark?: boolean;
}

export function RefreshButton({ 
  onRefresh, 
  isLoading, 
  label = 'Refresh',
  isDark = false
}: RefreshButtonProps) {
  return (
    <ActionButton
      onClick={onRefresh}
      disabled={isLoading}
      isDark={isDark}
      icon={
        <RefreshCw
          size={12}
          style={{
            color: isLoading ? 'var(--auth-accent)' : undefined,
            animation: isLoading ? 'spin 1.5s linear infinite' : 'none',
          }}
        />
      }
    >
      {isLoading ? 'Refreshing...' : label}
    </ActionButton>
  );
}

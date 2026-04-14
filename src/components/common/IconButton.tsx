import { CSSProperties, MouseEventHandler } from 'react';
import { LucideIcon } from 'lucide-react';

type IconButtonVariant = 'neutral' | 'danger';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  isDark?: boolean;
  disabled?: boolean;
  variant?: IconButtonVariant;
  size?: number;
  style?: CSSProperties;
}

function getPalette(variant: IconButtonVariant, isDark: boolean, disabled: boolean) {
  if (variant === 'danger') {
    return {
      backgroundColor: disabled
        ? 'rgba(239, 68, 68, 0.03)'
        : (isDark ? 'rgba(239, 68, 68, 0.05)' : '#ffffff'),
      borderColor: disabled
        ? 'rgba(239, 68, 68, 0.12)'
        : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5'),
      color: disabled ? 'rgba(248, 113, 113, 0.45)' : '#ef4444',
      hoverBackgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
    };
  }

  if (isDark) {
    return {
      backgroundColor: disabled ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
      borderColor: 'var(--auth-border)',
      color: disabled ? 'rgba(255, 255, 255, 0.3)' : 'var(--auth-text-muted)',
      hoverBackgroundColor: 'rgba(255, 255, 255, 0.05)',
    };
  }

  return {
    backgroundColor: disabled ? '#f8fafc' : '#ffffff',
    borderColor: '#e2e8f0',
    color: disabled ? '#cbd5e1' : '#64748b',
    hoverBackgroundColor: '#f8fafc',
  };
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  isDark = false,
  disabled = false,
  variant = 'neutral',
  size = 14,
  style,
}: IconButtonProps) {
  const palette = getPalette(variant, isDark, disabled);
  const baseBackgroundColor = palette.backgroundColor;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        padding: 0,
        borderRadius: '4px',
        border: `1px solid ${palette.borderColor}`,
        backgroundColor: baseBackgroundColor,
        color: palette.color,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        ...style,
      }}
      onMouseEnter={(event) => {
        if (!disabled) {
          event.currentTarget.style.backgroundColor = palette.hoverBackgroundColor;
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = baseBackgroundColor;
      }}
    >
      <Icon size={size} />
    </button>
  );
}

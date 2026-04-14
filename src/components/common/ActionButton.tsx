import { CSSProperties, ReactNode } from 'react';

type ActionButtonVariant = 'secondary' | 'primary' | 'danger';
type ActionButtonSize = 'sm' | 'md';

interface ActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isDark?: boolean;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  icon?: ReactNode;
  title?: string;
  style?: CSSProperties;
}

const sizeStyles: Record<ActionButtonSize, CSSProperties> = {
  sm: {
    height: '32px',
    padding: '0 12px',
    gap: '8px',
    fontSize: '10px',
  },
  md: {
    height: '40px',
    padding: '0 16px',
    gap: '8px',
    fontSize: '11px',
  },
};

function getButtonPalette(variant: ActionButtonVariant, isDark: boolean, disabled: boolean) {
  if (variant === 'primary') {
    return {
      backgroundColor: disabled ? 'rgba(255, 255, 255, 0.35)' : '#ffffff',
      borderColor: disabled ? 'rgba(255, 255, 255, 0.35)' : '#ffffff',
      color: disabled ? 'rgba(0, 0, 0, 0.45)' : '#000000',
      hoverBackgroundColor: '#f8fafc',
    };
  }

  if (variant === 'danger') {
    if (isDark) {
      return {
        backgroundColor: disabled ? 'rgba(239, 68, 68, 0.02)' : 'rgba(239, 68, 68, 0.05)',
        borderColor: disabled ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.3)',
        color: disabled ? 'rgba(248, 113, 113, 0.45)' : '#f87171',
        hoverBackgroundColor: 'rgba(239, 68, 68, 0.1)',
      };
    }

    return {
      backgroundColor: disabled ? '#fef2f2' : '#ffffff',
      borderColor: disabled ? '#fecaca' : '#fca5a5',
      color: disabled ? '#fca5a5' : '#dc2626',
      hoverBackgroundColor: '#fef2f2',
    };
  }

  if (isDark) {
    return {
      backgroundColor: disabled ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
      borderColor: 'var(--auth-border)',
      color: disabled ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
      hoverBackgroundColor: 'rgba(255, 255, 255, 0.05)',
    };
  }

  return {
    backgroundColor: disabled ? 'var(--slate-50)' : '#ffffff',
    borderColor: 'var(--slate-200)',
    color: disabled ? 'var(--slate-400)' : 'var(--slate-600)',
    hoverBackgroundColor: 'var(--slate-50)',
  };
}

export function ActionButton({
  children,
  onClick,
  disabled = false,
  isDark = false,
  variant = 'secondary',
  size = 'sm',
  icon,
  title,
  style,
}: ActionButtonProps) {
  const palette = getButtonPalette(variant, isDark, disabled);
  const baseBackgroundColor = palette.backgroundColor;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: palette.borderColor,
        borderRadius: '4px',
        backgroundColor: baseBackgroundColor,
        color: palette.color,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: 900,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        boxShadow: 'none',
        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
        opacity: disabled ? 0.8 : 1,
        ...sizeStyles[size],
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
      {icon}
      <span>{children}</span>
    </button>
  );
}

import { LucideIcon } from 'lucide-react';
import { CSSProperties } from 'react';

interface StatusPlaceholderProps {
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  style?: CSSProperties;
}

/**
 * Unified UI for empty, inactive, or loading states across the platform.
 * Ensures aesthetic consistency and premium feel.
 */
export function StatusPlaceholder({ icon: Icon, title, subtitle, style }: StatusPlaceholderProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      flex: 1,
      minHeight: '200px',
      ...style
    }}>
      {Icon && (
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <Icon size={20} color="var(--auth-accent)" strokeWidth={1.5} />
        </div>
      )}
      <div style={{
        fontSize: '11px',
        fontWeight: 900,
        color: '#ffffff',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '8px',
        fontFamily: "'Space Mono', monospace"
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '11px',
        color: 'var(--auth-text-muted)',
        fontWeight: 500,
        maxWidth: '260px',
        lineHeight: '1.6',
        fontFamily: "'Inter', sans-serif"
      }}>
        {subtitle}
      </div>
    </div>
  );
}

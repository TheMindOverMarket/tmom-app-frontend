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
      backgroundColor: '#ffffff',
      flex: 1,
      minHeight: '200px',
      ...style
    }}>
      {Icon && (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '1px solid #f1f5f9'
        }}>
          <Icon size={18} color="#94a3b8" strokeWidth={1.5} />
        </div>
      )}
      <div style={{
        fontSize: '10px',
        fontWeight: 900,
        color: '#0f172a',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: '6px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '10.5px',
        color: '#94a3b8',
        fontWeight: 500,
        maxWidth: '220px',
        lineHeight: '1.5'
      }}>
        {subtitle}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Activity, Database, LayoutGrid, PlusCircle } from 'lucide-react';
import { usePlaybookContext } from '../../contexts/PlaybookContext';
import { useUserSession } from '../../contexts/UserSessionContext';

const NAV_ITEMS = [
  { path: '/playbooks', label: 'PLAYBOOKS', icon: Database },
  { path: '/new-strategy', label: 'NEW PLAYBOOK', icon: PlusCircle },
  { path: '/supervision', label: 'LIVE SUPERVISION', icon: Activity, requiresPlaybook: true },
  { path: '/analytics', label: 'SESSION ANALYTICS', icon: ShieldCheck },
];

export function Navbar() {
  const { selectedPlaybook, playbooks, activeSession } = usePlaybookContext();
  const { currentUser } = useUserSession();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'MANAGER';
  const navItems = isAdmin 
    ? [{ path: '/admin', label: 'ADMIN CONTROL', icon: LayoutGrid }, ...NAV_ITEMS]
    : NAV_ITEMS;

  return (
    <nav style={{
      display: 'flex',
      gap: '32px',
      padding: '0 24px',
      borderBottom: '1px solid var(--auth-border)',
      backgroundColor: 'var(--auth-black)',
      flexShrink: 0,
      height: '40px',
      alignItems: 'center',
      position: 'relative'
    }}>
      {navItems.map(({ path, label, icon: Icon, requiresPlaybook }) => {
        const hasSupervisionContext = Boolean(
          selectedPlaybook ||
          activeSession ||
          playbooks.some((playbook) => playbook.is_active)
        );
        const isDisabled = requiresPlaybook && !hasSupervisionContext;
        const isHovered = hoveredItem === path;
        
        return (
          <div 
            key={path} 
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setHoveredItem(path)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to={path}
              onClick={(e) => {
                if (isDisabled) e.preventDefault();
              }}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 4px',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                color: isDisabled ? 'rgba(255, 255, 255, 0.1)' : (isActive ? 'var(--auth-accent)' : 'var(--auth-text-muted)'),
                textDecoration: 'none',
                borderBottom: !isDisabled && isActive ? '2px solid var(--auth-accent)' : '2px solid transparent',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                height: '100%',
                letterSpacing: '0.1em',
                pointerEvents: 'auto',
                filter: isDisabled ? 'grayscale(1) opacity(0.5)' : 'none'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={12} strokeWidth={isActive ? 3 : 2} style={{ opacity: isDisabled ? 0.3 : 1 }} />
                  {label}
                </>
              )}
            </NavLink>

            {/* High-Fidelity Custom Tooltip */}
            {isDisabled && isHovered && (
              <div style={{
                position: 'absolute',
                top: '45px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid var(--auth-accent)',
                borderRadius: '4px',
                padding: '8px 12px',
                width: '240px',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 255, 136, 0.1)',
                pointerEvents: 'none'
              }}>
                <div style={{ 
                  fontSize: '8px', 
                  fontWeight: 900, 
                  color: 'var(--auth-accent)', 
                  fontFamily: "'Space Mono', monospace",
                  marginBottom: '4px',
                  letterSpacing: '0.1em'
                }}>
                  FEATURE LOCKED
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#ffffff', 
                  lineHeight: '1.4',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Live Supervision requires an active session. Select or start a Playbook to enable orchestration.
                </div>
                {/* Tooltip Arrow */}
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderBottom: '5px solid var(--auth-accent)'
                }} />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

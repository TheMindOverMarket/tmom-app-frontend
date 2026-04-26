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
      alignItems: 'center'
    }}>
      {navItems.map(({ path, label, icon: Icon, requiresPlaybook }) => {
        const hasSupervisionContext = Boolean(
          selectedPlaybook ||
          activeSession ||
          playbooks.some((playbook) => playbook.is_active)
        );
        const isDisabled = requiresPlaybook && !hasSupervisionContext;
        
        return (
          <NavLink
            key={path}
            to={path}
            onClick={(e) => {
              if (isDisabled) e.preventDefault();
            }}
            title={isDisabled ? "LIVE SUPERVISION LOCKED: Select or initiate a Playbook to enable real-time orchestration" : label}
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
            onMouseEnter={e => {
              if (!isDisabled) e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              if (!isDisabled) {
                const isActive = window.location.pathname === path;
                e.currentTarget.style.color = isActive ? 'var(--auth-accent)' : 'var(--auth-text-muted)';
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={12} strokeWidth={isActive ? 3 : 2} style={{ opacity: isDisabled ? 0.3 : 1 }} />
                {label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import { ShieldCheck, Activity, Database, LayoutGrid } from 'lucide-react';
import { usePlaybookContext } from '../../contexts/PlaybookContext';
import { useUserSession } from '../../contexts/UserSessionContext';

const NAV_ITEMS = [
  { path: '/playbooks', label: 'PLAYBOOKS', icon: Database },
  { path: '/supervision', label: 'LIVE SUPERVISION', icon: Activity, requiresPlaybook: true },
  { path: '/analytics', label: 'SESSION ANALYTICS', icon: ShieldCheck },
];

export function Navbar() {
  const { selectedPlaybook } = usePlaybookContext();
  const { currentUser } = useUserSession();

  const isAdmin = currentUser?.role === 'MANAGER';
  const navItems = isAdmin 
    ? [...NAV_ITEMS, { path: '/admin', label: 'ADMIN CONTROL', icon: LayoutGrid }]
    : NAV_ITEMS;

  return (
    <nav style={{
      display: 'flex',
      gap: '24px',
      padding: '0 24px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      flexShrink: 0,
      height: '36px',
      alignItems: 'center'
    }}>
      {navItems.map(({ path, label, icon: Icon, requiresPlaybook }) => {
        const isDisabled = requiresPlaybook && !selectedPlaybook;
        
        return (
          <NavLink
            key={path}
            to={path}
            onClick={(e) => {
              if (isDisabled) e.preventDefault();
            }}
            title={isDisabled ? "Select or initiate a Playbook to enable real-time supervision orchestration" : "Monitor active playbook execution"}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 4px',
              fontSize: '11px',
              fontWeight: 800,
              color: isDisabled ? '#cbd5e1' : (isActive ? '#6366f1' : '#64748b'),
              textDecoration: 'none',
              borderBottom: !isDisabled && isActive ? '2px solid #6366f1' : '2px solid transparent',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              height: '100%',
              letterSpacing: '0.05em',
              pointerEvents: 'auto'
            })}
          >
            <Icon size={12} strokeWidth={3} />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}

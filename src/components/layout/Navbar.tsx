import React from 'react';
import { NavLink } from 'react-router-dom';
import { PlayCircle, ShieldCheck, Activity, Database } from 'lucide-react';
import { usePlaybookContext } from '../../contexts/PlaybookContext';

const NAV_ITEMS = [
  { path: '/playbooks', label: 'PLAYBOOKS', icon: Database },
  { path: '/monitor', label: 'LIVE MONITOR', icon: Activity, requiresPlaybook: true },
  { path: '/analytics', label: 'SESSION ANALYTICS', icon: ShieldCheck },
];

export function Navbar() {
  const { selectedPlaybook } = usePlaybookContext();

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
      {NAV_ITEMS.map(({ path, label, icon: Icon, requiresPlaybook }) => {
        const isDisabled = requiresPlaybook && !selectedPlaybook;
        
        return (
          <NavLink
            key={path}
            to={path}
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
              pointerEvents: isDisabled ? 'none' : 'auto'
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

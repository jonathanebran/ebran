import { NavLink } from 'react-router-dom';
import { Home, Target, Briefcase, PieChart, ListChecks } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/',         icon: Home,       label: 'Home',   exact: true  },
  { to: '/foco',     icon: ListChecks, label: 'Foco',   exact: false },
  { to: '/metas',    icon: Target,     label: 'Metas',  exact: false },
  { to: '/trabalho', icon: Briefcase,  label: 'Trab.',  exact: false },
  { to: '/financas', icon: PieChart,   label: 'Finan.', exact: false },
];

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  exact: boolean;
}

function NavItem({ to, icon: Icon, label, exact }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={exact}
      className="relative flex flex-col items-center tap-scale"
      style={{ padding: '6px 12px 4px', minWidth: 54 }}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="nav-bubble"
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.1)',
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            />
          )}
          <div className="relative z-10 w-7 h-7 flex items-center justify-center">
            <Icon
              size={20}
              strokeWidth={isActive ? 2.4 : 1.7}
              style={{ stroke: isActive ? 'url(#nav-gradient)' : 'rgba(255,255,255,0.38)' }}
            />
          </div>
          <span
            className="relative z-10 font-semibold mt-0.5"
            style={{
              fontSize: 9,
              color: isActive ? 'var(--color-accent,#FF9F3D)' : 'rgba(255,255,255,0.38)',
              letterSpacing: '0.01em',
            }}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

// Floating AI button — sits above the nav bar on the right side
function AIFloatingButton() {
  return (
    <div
      className="fixed z-50"
      style={{
        right: 16,
        bottom: 'calc(max(16px, env(safe-area-inset-bottom, 16px)) + 78px)',
      }}
    >
      <NavLink to="/ai-hub" className="tap-scale block">
        {({ isActive }) => (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, delay: 0.15 }}
            className="relative flex items-center justify-center"
            style={{ width: 56, height: 56 }}
          >
            <svg width="56" height="56" className="absolute inset-0" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="ai-fab-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style={{ stopColor: 'var(--color-start,#FFD84A)' }} />
                  <stop offset="50%"  style={{ stopColor: 'var(--color-mid,#FF6B5F)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--color-end,#FF2F7D)' }} />
                </linearGradient>
              </defs>
              {isActive && (
                <circle cx="28" cy="28" r="27" fill="none" stroke="url(#ai-fab-ring)" strokeWidth={10} opacity={0.12} />
              )}
              <circle
                cx="28" cy="28" r="26"
                fill="none"
                stroke="url(#ai-fab-ring)"
                strokeWidth={isActive ? 2.2 : 1.6}
                opacity={isActive ? 1 : 0.85}
              />
            </svg>
            <div
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{
                width: 48, height: 48,
                background: isActive ? 'rgba(255,100,60,0.18)' : 'rgba(12,12,12,0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
              }}
            >
              <AppLogo size={26} />
            </div>
          </motion.div>
        )}
      </NavLink>
    </div>
  );
}

export function BottomNav() {
  return (
    <>
      <div style={{ height: 'max(90px, calc(env(safe-area-inset-bottom, 0px) + 80px))' }} />

      <AIFloatingButton />

      <div
        className="fixed left-0 right-0 z-50 flex justify-center"
        style={{ bottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
      >
        <motion.nav
          initial={{ y: 80, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36, delay: 0.05 }}
          className="relative flex items-center"
          style={{
            background: 'rgba(10,10,10,0.28)',
            backdropFilter: 'blur(72px) saturate(280%) brightness(1.12)',
            WebkitBackdropFilter: 'blur(72px) saturate(280%) brightness(1.12)',
            borderRadius: 34,
            border: '0.5px solid rgba(255,255,255,0.1)',
            boxShadow:
              '0 16px 56px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            padding: '4px 6px',
          }}
        >
          {navItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}

          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="nav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   style={{ stopColor: 'var(--color-start,#FFD84A)' }} />
                <stop offset="35%"  style={{ stopColor: 'var(--color-mid,#FF9F3D)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--color-end,#FF2F7D)' }} />
              </linearGradient>
            </defs>
          </svg>
        </motion.nav>
      </div>
    </>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, Target, Briefcase, PieChart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { motion } from 'framer-motion';

const leftItems = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/metas', icon: Target, label: 'Metas', exact: false },
];

const rightItems = [
  { to: '/trabalho', icon: Briefcase, label: 'Trab.', exact: false },
  { to: '/financas', icon: PieChart, label: 'Finan.', exact: false },
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
      style={{ padding: '6px 14px 4px', minWidth: 58 }}
    >
      {({ isActive }) => (
        <>
          {/* Sliding glass bubble — layoutId makes it animate between positions */}
          {isActive && (
            <motion.div
              layoutId="nav-bubble"
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'rgba(255,255,255,0.07)',
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
              color: isActive ? '#FF9F3D' : 'rgba(255,255,255,0.38)',
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

export function BottomNav() {
  return (
    <>
      {/* Spacer so page content scrolls above the floating bar */}
      <div style={{ height: 'max(90px, calc(env(safe-area-inset-bottom, 0px) + 80px))' }} />

      {/* Floating pill nav */}
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
            background: 'rgba(14,14,14,0.48)',
            backdropFilter: 'blur(52px) saturate(220%) brightness(1.05)',
            WebkitBackdropFilter: 'blur(52px) saturate(220%) brightness(1.05)',
            borderRadius: 34,
            border: '0.5px solid rgba(255,255,255,0.09)',
            boxShadow:
              '0 12px 48px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            padding: '4px 6px',
          }}
        >
          {leftItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}

          {/* AI center button — floats above the bar */}
          <NavLink
            to="/ai-hub"
            className="relative flex flex-col items-center tap-scale"
            style={{ padding: '0 10px', marginTop: -18 }}
          >
            {({ isActive }) => (
              <>
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: 54, height: 54 }}
                >
                  {/* Gradient ring */}
                  <svg
                    width="54"
                    height="54"
                    className="absolute inset-0"
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <linearGradient id="ai-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD84A" />
                        <stop offset="50%" stopColor="#FF6B5F" />
                        <stop offset="100%" stopColor="#FF2F7D" />
                      </linearGradient>
                    </defs>
                    {/* Outer glow when active */}
                    {isActive && (
                      <circle
                        cx="27" cy="27" r="26"
                        fill="none"
                        stroke="url(#ai-ring)"
                        strokeWidth={10}
                        opacity={0.12}
                      />
                    )}
                    <circle
                      cx="27" cy="27" r="25"
                      fill="none"
                      stroke="url(#ai-ring)"
                      strokeWidth={isActive ? 2 : 1.5}
                      opacity={isActive ? 1 : 0.7}
                    />
                  </svg>

                  {/* Inner glass disc */}
                  <motion.div
                    animate={{
                      background: isActive
                        ? 'rgba(255,100,60,0.15)'
                        : 'rgba(16,16,16,0.88)',
                    }}
                    transition={{ duration: 0.25 }}
                    className="relative z-10 flex items-center justify-center rounded-full"
                    style={{
                      width: 46,
                      height: 46,
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '0.5px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <AppLogo size={24} />
                  </motion.div>
                </div>

                <span
                  className="font-semibold"
                  style={{
                    fontSize: 9,
                    marginTop: 2,
                    color: isActive ? '#FF9F3D' : 'rgba(255,255,255,0.38)',
                    letterSpacing: '0.01em',
                  }}
                >
                  AI
                </span>
              </>
            )}
          </NavLink>

          {rightItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}

          {/* Gradient def for icon strokes */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="nav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD84A" />
                <stop offset="35%" stopColor="#FF9F3D" />
                <stop offset="65%" stopColor="#FF6B5F" />
                <stop offset="100%" stopColor="#FF2F7D" />
              </linearGradient>
            </defs>
          </svg>
        </motion.nav>
      </div>
    </>
  );
}

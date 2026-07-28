import { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Target, Briefcase, PieChart, ListChecks, HeartPulse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { motion } from 'framer-motion';

const FAB_POS_KEY = 'ebran:aifab:v1';

const navItems = [
  { to: '/',         icon: Home,       label: 'Home',   exact: true  },
  { to: '/foco',     icon: ListChecks, label: 'Foco',   exact: false },
  { to: '/saude',    icon: HeartPulse, label: 'Saúde',  exact: false },
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
      style={{ padding: '6px 8px 4px', minWidth: 48 }}
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
              color: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.38)',
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

// Botão flutuante do assistente — arrastável para qualquer canto da tela.
// A posição fica salva; um toque (sem arrastar) abre o assistente.
function AIFloatingButton() {
  const navigate = useNavigate();
  const [pos] = useState<{ x: number; y: number }>(() => {
    try { return JSON.parse(localStorage.getItem(FAB_POS_KEY) || '') || { x: 0, y: 0 }; }
    catch { return { x: 0, y: 0 }; }
  });
  const draggedRef = useRef(false);

  // Mantém o botão dentro da tela (âncora no canto inferior direito).
  const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  return (
    <motion.div
      className="fixed z-50"
      style={{ right: 16, bottom: 'calc(max(16px, env(safe-area-inset-bottom, 16px)) + 78px)', touchAction: 'none' }}
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={{ left: -(vw - 90), right: 8, top: -(vh - 180), bottom: 24 }}
      initial={{ x: pos.x, y: pos.y }}
      onDragStart={() => { draggedRef.current = true; }}
      onDragEnd={(_, info) => {
        const next = { x: pos.x + info.offset.x, y: pos.y + info.offset.y };
        try { localStorage.setItem(FAB_POS_KEY, JSON.stringify(next)); } catch { /* ignora */ }
        // pequena folga para o onClick não disparar logo após arrastar
        setTimeout(() => { draggedRef.current = false; }, 0);
      }}
      onClick={() => { if (!draggedRef.current) navigate('/ai-hub'); }}
      whileTap={{ scale: 0.94 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 56, height: 56, cursor: 'grab' }}>
        <svg width="56" height="56" className="absolute inset-0" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="ai-fab-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   style={{ stopColor: 'var(--color-start)' }} />
              <stop offset="50%"  style={{ stopColor: 'var(--color-mid)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--color-end)' }} />
            </linearGradient>
          </defs>
          <circle cx="28" cy="28" r="26" fill="none" stroke="url(#ai-fab-ring)" strokeWidth={1.6} opacity={0.85} />
        </svg>
        <div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 48, height: 48,
            background: 'rgba(12,12,12,0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
          }}
        >
          <AppLogo size={26} />
        </div>
      </div>
    </motion.div>
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
                <stop offset="0%"   style={{ stopColor: 'var(--color-start)' }} />
                <stop offset="35%"  style={{ stopColor: 'var(--color-mid)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--color-end)' }} />
              </linearGradient>
            </defs>
          </svg>
        </motion.nav>
      </div>
    </>
  );
}

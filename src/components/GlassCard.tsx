import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  padding?: string;
}

export function GlassCard({ children, className = '', onClick, active = false, padding = 'p-4' }: GlassCardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.985 } : {}}
      whileHover={onClick ? { scale: 1.005 } : {}}
      onClick={onClick}
      className={`rounded-2xl overflow-hidden ${padding} ${className}`}
      style={{
        background: 'rgba(18,18,18,var(--glass-opacity,0.72))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: active
          ? '1px solid rgba(255,111,95,0.65)'
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: active ? '0 0 20px rgba(255,111,95,0.12)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </motion.div>
  );
}

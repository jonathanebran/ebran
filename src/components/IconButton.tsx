import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function IconButton({ children, onClick, active = false, size = 'md', className = '' }: IconButtonProps) {
  const sz = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`${sz} rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        background: active ? 'rgba(255,111,95,0.15)' : 'rgba(255,255,255,0.06)',
        border: active ? '1px solid rgba(255,111,95,0.5)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </motion.button>
  );
}

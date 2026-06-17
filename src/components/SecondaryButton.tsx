import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
  className?: string;
}

export function SecondaryButton({
  children, onClick, fullWidth = false, size = 'md', type = 'button', className = '',
}: SecondaryButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3.5 px-6 text-[15px]',
    lg: 'py-4 px-8 text-base',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} rounded-2xl font-semibold flex items-center justify-center gap-2 ${className}`}
      style={{
        background: 'transparent',
        border: '1.5px solid rgba(255,111,95,0.5)',
        color: '#FF6B5F',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </motion.button>
  );
}

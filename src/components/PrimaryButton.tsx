import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
  className?: string;
}

export function PrimaryButton({
  children, onClick, fullWidth = false, loading = false,
  disabled = false, size = 'md', type = 'button', className = '',
}: PrimaryButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3.5 px-6 text-[15px]',
    lg: 'py-4 px-8 text-base',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} rounded-2xl font-semibold text-white flex items-center justify-center gap-2 ${className}`}
      style={{
        background: disabled || loading
          ? 'rgba(255,255,255,0.08)'
          : 'linear-gradient(135deg, var(--color-start,#FFD84A) 0%, var(--color-mid,#FF9F3D) 50%, var(--color-end,#FF2F7D) 100%)',
        color: disabled || loading ? '#6F6F6F' : '#000',
        letterSpacing: '-0.01em',
        transition: 'opacity 0.2s',
      }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </motion.button>
  );
}

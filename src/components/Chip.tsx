import { motion } from 'framer-motion';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function Chip({ label, active = false, onClick, size = 'md' }: ChipProps) {
  const padding = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm';
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`${padding} rounded-full font-medium flex-shrink-0`}
      style={{
        background: active
          ? 'linear-gradient(135deg, var(--color-start) 0%, var(--color-accent) 35%, var(--color-mid) 65%, var(--color-end) 100%)'
          : 'rgba(255,255,255,0.08)',
        color: active ? '#000' : '#A8A8A8',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {label}
    </motion.button>
  );
}

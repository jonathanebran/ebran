import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  value: boolean;
  onChange: (v: boolean) => void;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({ value, onChange, size = 'md' }: ToggleSwitchProps) {
  const w = size === 'sm' ? 40 : 50;
  const h = size === 'sm' ? 22 : 28;
  const d = size === 'sm' ? 16 : 22;

  return (
    <motion.button
      onClick={() => onChange(!value)}
      style={{
        width: w,
        height: h,
        borderRadius: h,
        background: value
          ? 'linear-gradient(135deg, #FFD84A 0%, #FF9F3D 35%, #FF6B5F 65%, #FF2F7D 100%)'
          : 'rgba(255,255,255,0.12)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        padding: 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          width: d,
          height: d,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: (h - d) / 2,
        }}
        animate={{ left: value ? w - d - (h - d) / 2 : (h - d) / 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

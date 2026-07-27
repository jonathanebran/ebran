import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  height?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, showLabel = false, height = 6, className = '' }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(135deg, var(--color-start) 0%, var(--color-accent) 35%, var(--color-mid) 65%, var(--color-end) 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[var(--color-accent)] font-semibold">{pct}%</span>
      )}
    </div>
  );
}

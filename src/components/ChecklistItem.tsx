import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import type { DailyFocusItem } from '../lib/types';

interface ChecklistItemProps {
  item: DailyFocusItem;
  done: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ item, done, onToggle }: ChecklistItemProps) {
  return (
    <motion.div
      className="flex items-center gap-3 py-3 border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      whileTap={{ scale: 0.99 }}
    >
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.85 }}
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: done
            ? 'linear-gradient(135deg, var(--color-start), var(--color-end))'
            : 'transparent',
          border: done ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
        }}
      >
        {done && <Check size={12} color="var(--color-on-gradient)" strokeWidth={3} />}
        {!done && <Circle size={12} color="transparent" />}
      </motion.button>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color: done ? '#6F6F6F' : '#F7F7F7',
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </p>
        {item.estimated_price && (
          <p className="text-[11px] text-[#6F6F6F] mt-0.5">
            ~R$ {item.estimated_price.toFixed(2).replace('.', ',')}
            {item.recurrence && ` · ${item.recurrence === 'weekly' ? 'Semanal' : item.recurrence === 'monthly' ? 'Mensal' : item.recurrence}`}
          </p>
        )}
      </div>

      {item.priority === 'high' && !done && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'var(--color-danger)' }}
        />
      )}
    </motion.div>
  );
}

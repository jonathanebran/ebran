import { motion } from 'framer-motion';
import { Heart, MoreHorizontal } from 'lucide-react';
import { GlassCard } from './GlassCard';
import type { WishlistItem } from '../lib/types';
import { formatCurrency } from '../lib/utils';

const priorityColor = { low: '#6F6F6F', medium: '#FF9F3D', high: '#FF6B5F', urgent: '#FF2F7D' };

interface WishlistCardProps {
  item: WishlistItem;
}

export function WishlistCard({ item }: WishlistCardProps) {
  return (
    <GlassCard padding="p-3.5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <Heart size={18} color={priorityColor[item.priority]} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#F7F7F7] font-semibold text-sm truncate">{item.title}</p>
          <p className="text-[#6F6F6F] text-xs mt-0.5">{item.category}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {item.estimated_price && (
            <p className="text-[#FF9F3D] font-bold text-sm">{formatCurrency(item.estimated_price)}</p>
          )}
          <motion.button whileTap={{ scale: 0.9 }}>
            <MoreHorizontal size={16} color="#6F6F6F" />
          </motion.button>
        </div>
      </div>
    </GlassCard>
  );
}

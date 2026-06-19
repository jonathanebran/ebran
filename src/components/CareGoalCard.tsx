import { Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';
import type { Goal } from '../lib/types';
import { formatCurrency, getPercentage, getDaysRemaining } from '../lib/utils';

interface CareGoalCardProps {
  goal: Goal;
  onClick?: () => void;
}

export function CareGoalCard({ goal, onClick }: CareGoalCardProps) {
  const pct = getPercentage(goal.current_amount, goal.target_amount);
  const days = goal.desired_date ? getDaysRemaining(goal.desired_date) : null;

  return (
    <GlassCard onClick={onClick} padding="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,111,95,0.1)' }}
          >
            <Sparkles size={16} color="#FF9F3D" />
          </div>
          <div>
            <p className="text-[#F7F7F7] font-semibold text-sm">{goal.title}</p>
            {days !== null && (
              <p className="text-[#6F6F6F] text-[10px]">{days > 0 ? `em ${days} dias` : 'Prazo encerrado'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#A8A8A8]">{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
        <span className="text-[#FF9F3D] font-bold">{pct}%</span>
      </div>
      <ProgressBar value={pct} height={4} />
    </GlassCard>
  );
}

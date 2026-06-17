import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { ProgressRing } from './ProgressRing';
import type { Goal } from '../lib/types';
import { formatCurrency, getPercentage, getDaysRemaining } from '../lib/utils';

interface GoalCardProps {
  goal: Goal;
  variant?: 'default' | 'ring' | 'compact';
}

const categoryEmoji: Record<string, string> = {
  Viagem: '✈️', Transporte: '🚗', Moradia: '🏠', Finanças: '💰',
  'Cuidado Pessoal': '✨', Lazer: '🎮', Treino: '👟', Acessórios: '🎒', default: '⭐',
};

const categoryGradient: Record<string, [string, string]> = {
  Viagem: ['#FF9F3D', '#FF2F7D'],
  Transporte: ['#FFD84A', '#FF6B5F'],
  Moradia: ['#FF6B5F', '#FF2F7D'],
  Finanças: ['#22c55e', '#FF9F3D'],
  default: ['#FFD84A', '#FF2F7D'],
};

function LuminousBar({ value, gradA, gradB }: { value: number; gradA: string; gradB: string }) {
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ height: 4, background: 'rgba(255,255,255,0.07)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.max(2, value)}%`,
          background: `linear-gradient(90deg, ${gradA}, ${gradB})`,
          boxShadow: `0 0 8px ${gradB}90, 0 0 18px ${gradB}45`,
        }}
      />
    </div>
  );
}

export function GoalCard({ goal, variant = 'default' }: GoalCardProps) {
  const navigate = useNavigate();
  const pct = getPercentage(goal.current_amount, goal.target_amount);
  const days = goal.desired_date ? getDaysRemaining(goal.desired_date) : null;
  const emoji = categoryEmoji[goal.category] ?? categoryEmoji.default;
  const [gradA, gradB] = categoryGradient[goal.category] ?? categoryGradient.default;

  if (variant === 'ring') {
    return (
      <motion.div
        whileTap={{ scale: 0.985 }}
        onClick={() => navigate(`/metas/${goal.id}`)}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(18,18,18,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
        }}
      >
        <div className="flex">
          {/* Left thumbnail */}
          <div className="relative flex-shrink-0" style={{ width: 110 }}>
            {goal.image_url ? (
              <img
                src={goal.image_url}
                alt={goal.title}
                className="w-full h-full object-cover"
                style={{ minHeight: 110 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  minHeight: 110,
                  background: `linear-gradient(135deg, ${gradA}28, ${gradB}28)`,
                }}
              >
                <span style={{ fontSize: 36 }}>{emoji}</span>
              </div>
            )}
            {/* Category badge */}
            <div
              className="absolute top-2 left-2 w-7 h-7 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <span style={{ fontSize: 13 }}>{emoji}</span>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0 p-3 flex flex-col justify-between gap-2">
            {/* Header row */}
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: gradA }}>{goal.category}</p>
                <h3 className="text-[#F7F7F7] font-bold text-[15px] leading-tight truncate mt-0.5">{goal.title}</h3>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                <ProgressRing value={pct} size={44} strokeWidth={3.5} label={`${pct}%`} />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={e => e.stopPropagation()}
                >
                  <MoreHorizontal size={16} color="#4A4A4A" />
                </motion.button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="text-[#F7F7F7] font-bold text-[17px] leading-tight">
                {formatCurrency(goal.current_amount)}
              </p>
              <p className="text-[#6F6F6F] text-xs mt-0.5">de {formatCurrency(goal.target_amount)}</p>
            </div>

            {/* Luminous progress bar */}
            <div>
              <LuminousBar value={pct} gradA={gradA} gradB={gradB} />
              {days !== null && (
                <p className="text-[#4A4A4A] text-[10px] mt-1.5">
                  {days > 0 ? `${days} dias restantes` : 'Prazo encerrado'}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <GlassCard onClick={() => navigate(`/metas/${goal.id}`)} padding="p-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[#F7F7F7] font-semibold text-sm truncate">{goal.title}</p>
            <LuminousBar value={pct} gradA={gradA} gradB={gradB} />
            <p className="text-[#A8A8A8] text-[11px] mt-1">{pct}% · {formatCurrency(goal.current_amount)}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard onClick={() => navigate(`/metas/${goal.id}`)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: gradA }}>{goal.category}</p>
            <h3 className="text-[#F7F7F7] font-bold text-base">{goal.title}</h3>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
          <MoreHorizontal size={18} color="#6F6F6F" />
        </motion.button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[#A8A8A8] text-xs">{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
        <span className="text-xs font-bold" style={{ color: gradA }}>{pct}%</span>
      </div>
      <LuminousBar value={pct} gradA={gradA} gradB={gradB} />

      {days !== null && (
        <p className="text-[#6F6F6F] text-[11px] mt-2">
          {days > 0 ? `${days} dias restantes` : 'Prazo encerrado'}
        </p>
      )}
    </GlassCard>
  );
}

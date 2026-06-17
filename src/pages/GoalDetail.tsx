import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, Minus, Edit2, Trash2, Bell, Paperclip, Calendar,
  Folder, Pause, Archive, Copy, MoreHorizontal
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ProgressRing } from '../components/ProgressRing';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { mockGoals, mockGoalContributions } from '../data/mockData';
import { formatCurrency, getPercentage, getDaysRemaining, getMonthlySuggestion, formatDate } from '../lib/utils';

export function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goal = mockGoals.find(g => g.id === id) ?? mockGoals[0];
  const pct = getPercentage(goal.current_amount, goal.target_amount);
  const days = goal.desired_date ? getDaysRemaining(goal.desired_date) : null;
  const monthlySuggestion = goal.desired_date
    ? getMonthlySuggestion(goal.target_amount, goal.current_amount, goal.desired_date)
    : null;
  const contributions = mockGoalContributions.filter(c => c.goal_id === goal.id);

  const actions = [
    { icon: Plus, label: 'Adicionar valor', color: '#22c55e' },
    { icon: Minus, label: 'Remover valor', color: '#FF6B5F' },
    { icon: Edit2, label: 'Editar', color: '#FF9F3D' },
    { icon: Bell, label: 'Lembrete', color: '#a78bfa' },
    { icon: Paperclip, label: 'Anexar', color: '#A8A8A8' },
    { icon: Calendar, label: 'Calendar', color: '#4285F4' },
    { icon: Folder, label: 'Drive', color: '#0F9D58' },
    { icon: Pause, label: 'Pausar', color: '#6F6F6F' },
    { icon: Archive, label: 'Arquivar', color: '#6F6F6F' },
    { icon: Copy, label: 'Duplicar', color: '#A8A8A8' },
    { icon: Trash2, label: 'Excluir', color: '#FF2F7D' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7] flex-1">{goal.title}</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(`/metas/${goal.id}/editar`)}>
          <MoreHorizontal size={22} color="#6F6F6F" />
        </motion.button>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Progress card */}
        <GlassCard>
          <div className="flex items-center gap-5">
            <ProgressRing value={pct} size={90} strokeWidth={7} label={`${pct}%`} />
            <div className="flex-1">
              <p className="text-[10px] text-[#FF9F3D] font-semibold uppercase tracking-wider mb-1">{goal.category}</p>
              <p className="text-[#F7F7F7] font-bold text-2xl">{formatCurrency(goal.current_amount)}</p>
              <p className="text-[#A8A8A8] text-sm">de {formatCurrency(goal.target_amount)}</p>
              {monthlySuggestion && (
                <p className="text-[#6F6F6F] text-xs mt-2">
                  Guardar <span className="text-[#FF9F3D] font-semibold">{formatCurrency(monthlySuggestion)}/mês</span>
                </p>
              )}
            </div>
          </div>
          <ProgressBar value={pct} height={6} className="mt-4" />
          {days !== null && (
            <p className="text-[#6F6F6F] text-xs mt-2 text-center">
              {days > 0 ? `${days} dias restantes` : 'Prazo encerrado'}
              {goal.desired_date ? ` · ${formatDate(goal.desired_date)}` : ''}
            </p>
          )}
        </GlassCard>

        {/* Info */}
        <GlassCard>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Faltando', value: formatCurrency(goal.target_amount - goal.current_amount) },
              { label: 'Reservado', value: formatCurrency(goal.reserved_amount) },
              { label: 'Prioridade', value: goal.priority === 'high' ? 'Alta' : goal.priority === 'urgent' ? 'Urgente' : goal.priority === 'medium' ? 'Média' : 'Baixa' },
              { label: 'Status', value: goal.status === 'active' ? 'Ativa' : goal.status === 'planning' ? 'Planejando' : goal.status },
              { label: 'Tipo', value: goal.type === 'travel' ? 'Viagem' : goal.type === 'financial' ? 'Financeira' : goal.type === 'care' ? 'Cuidado' : goal.type === 'small' ? 'Pequena' : goal.type },
              { label: 'Recorrência', value: goal.recurrence === 'monthly' ? 'Mensal' : goal.recurrence === 'once' ? 'Única' : goal.recurrence },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wider">{label}</p>
                <p className="text-[#F7F7F7] text-sm font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Histórico */}
        {contributions.length > 0 && (
          <GlassCard>
            <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Histórico de aportes</p>
            {contributions.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2.5 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-[#F7F7F7] text-sm">{c.note ?? 'Aporte'}</p>
                  <p className="text-[#6F6F6F] text-xs mt-0.5">{formatDate(c.created_at)}</p>
                </div>
                <p className="text-[#22c55e] font-bold text-sm">+{formatCurrency(c.amount)}</p>
              </div>
            ))}
          </GlassCard>
        )}

        {/* Actions grid */}
        <GlassCard>
          <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Ações</p>
          <div className="grid grid-cols-4 gap-3">
            {actions.map(({ icon: Icon, label, color }) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.9 }}
                onClick={() => label === 'Editar' && navigate(`/metas/${goal.id}/editar`)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={18} color={color} />
                </div>
                <span className="text-[10px] text-[#6F6F6F] text-center leading-tight">{label}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* CTAs */}
        <PrimaryButton fullWidth onClick={() => navigate(`/metas/${goal.id}/editar`)}>
          Adicionar valor
        </PrimaryButton>
        <SecondaryButton fullWidth onClick={() => navigate(-1)}>
          Voltar
        </SecondaryButton>
      </div>
    </div>
  );
}

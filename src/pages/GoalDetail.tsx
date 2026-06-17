import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, Plus, Minus } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ProgressRing } from '../components/ProgressRing';
import { ProgressBar } from '../components/ProgressBar';
import { SecondaryButton } from '../components/SecondaryButton';
import { mockGoals, mockGoalContributions } from '../data/mockData';
import { formatCurrency, getPercentage, getDaysRemaining, getMonthlySuggestion, formatDate } from '../lib/utils';

function ValueModal({
  mode,
  onClose,
  onConfirm,
}: {
  mode: 'add' | 'remove';
  onClose: () => void;
  onConfirm: (value: number, note: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const isAdd = mode === 'add';
  const accent = isAdd ? '#22c55e' : '#FF6B5F';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        className="w-full max-w-sm mx-auto rounded-t-3xl p-6"
        style={{ background: 'rgba(18,18,18,0.98)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-[#F7F7F7] font-bold text-lg mb-4">
          {isAdd ? 'Adicionar valor' : 'Remover valor'}
        </h3>
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-[#A8A8A8] font-semibold">R$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-[#F7F7F7] font-bold text-xl outline-none"
          />
        </div>
        <input
          type="text"
          placeholder="Observação (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full rounded-2xl px-4 py-3 mb-5 text-[#F7F7F7] text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { if (amount) onConfirm(parseFloat(amount), note); }}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-4 rounded-2xl font-bold text-base"
          style={{
            background: `linear-gradient(90deg, ${accent}99, ${accent})`,
            color: '#fff',
            opacity: (!amount || parseFloat(amount) <= 0) ? 0.4 : 1,
          }}
        >
          Confirmar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goal = mockGoals.find(g => g.id === id) ?? mockGoals[0];
  const days = goal.desired_date ? getDaysRemaining(goal.desired_date) : null;
  const monthlySuggestion = goal.desired_date
    ? getMonthlySuggestion(goal.target_amount, goal.current_amount, goal.desired_date)
    : null;
  const contributions = mockGoalContributions.filter(c => c.goal_id === goal.id);

  const [modal, setModal] = useState<'add' | 'remove' | null>(null);
  const [currentAmount, setCurrentAmount] = useState(goal.current_amount);

  const handleConfirm = (value: number, _note: string) => {
    if (modal === 'add') setCurrentAmount(prev => Math.min(prev + value, goal.target_amount));
    if (modal === 'remove') setCurrentAmount(prev => Math.max(0, prev - value));
    setModal(null);
  };

  const displayPct = getPercentage(currentAmount, goal.target_amount);

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7] flex-1">{goal.title}</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/metas/${goal.id}/editar`)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,159,61,0.15)' }}
        >
          <Edit2 size={16} color="#FF9F3D" />
        </motion.button>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Progress */}
        <GlassCard>
          <div className="flex items-center gap-5">
            <ProgressRing value={displayPct} size={90} strokeWidth={7} label={`${displayPct}%`} />
            <div className="flex-1">
              <p className="text-[10px] text-[#FF9F3D] font-semibold uppercase tracking-wider mb-1">{goal.category}</p>
              <p className="text-[#F7F7F7] font-bold text-2xl">{formatCurrency(currentAmount)}</p>
              <p className="text-[#A8A8A8] text-sm">de {formatCurrency(goal.target_amount)}</p>
              {monthlySuggestion && (
                <p className="text-[#6F6F6F] text-xs mt-2">
                  Guardar <span className="text-[#FF9F3D] font-semibold">{formatCurrency(monthlySuggestion)}/mês</span>
                </p>
              )}
            </div>
          </div>
          <ProgressBar value={displayPct} height={6} className="mt-4" />
          {days !== null && (
            <p className="text-[#6F6F6F] text-xs mt-2 text-center">
              {days > 0 ? `${days} dias restantes` : 'Prazo encerrado'}
              {goal.desired_date ? ` · ${formatDate(goal.desired_date)}` : ''}
            </p>
          )}
        </GlassCard>

        {/* Quick add/remove */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setModal('add')}
            className="flex items-center justify-center gap-2 rounded-2xl py-4"
            style={{ background: 'rgba(34,197,94,0.12)', border: '0.5px solid rgba(34,197,94,0.25)' }}
          >
            <Plus size={18} color="#22c55e" strokeWidth={2.5} />
            <span className="font-bold text-sm" style={{ color: '#22c55e' }}>Adicionar</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setModal('remove')}
            className="flex items-center justify-center gap-2 rounded-2xl py-4"
            style={{ background: 'rgba(255,107,95,0.1)', border: '0.5px solid rgba(255,107,95,0.2)' }}
          >
            <Minus size={18} color="#FF6B5F" strokeWidth={2.5} />
            <span className="font-bold text-sm" style={{ color: '#FF6B5F' }}>Remover</span>
          </motion.button>
        </div>

        {/* Info */}
        <GlassCard>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Faltando', value: formatCurrency(goal.target_amount - currentAmount) },
              { label: 'Reservado', value: formatCurrency(goal.reserved_amount) },
              { label: 'Prioridade', value: goal.priority === 'high' ? 'Alta' : goal.priority === 'urgent' ? 'Urgente' : goal.priority === 'medium' ? 'Média' : 'Baixa' },
              { label: 'Status', value: goal.status === 'active' ? 'Ativa' : goal.status === 'planning' ? 'Planejando' : goal.status },
              { label: 'Tipo', value: goal.type === 'travel' ? 'Viagem' : goal.type === 'financial' ? 'Financeira' : goal.type === 'care' ? 'Cuidado' : goal.type === 'small' ? 'Pequena' : goal.type },
              { label: 'Recorrência', value: goal.recurrence === 'monthly' ? 'Mensal' : goal.recurrence === 'once' ? 'Única' : goal.recurrence ?? '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wider">{label}</p>
                <p className="text-[#F7F7F7] text-sm font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Contribution history */}
        {contributions.length > 0 && (
          <GlassCard>
            <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Histórico de aportes</p>
            {contributions.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-[#F7F7F7] text-sm">{c.note ?? 'Aporte'}</p>
                  <p className="text-[#6F6F6F] text-xs mt-0.5">{formatDate(c.created_at)}</p>
                </div>
                <p className="text-[#22c55e] font-bold text-sm">+{formatCurrency(c.amount)}</p>
              </div>
            ))}
          </GlassCard>
        )}

        <SecondaryButton fullWidth onClick={() => navigate(`/metas/${goal.id}/editar`)}>
          Editar meta
        </SecondaryButton>
      </div>

      <AnimatePresence>
        {modal && (
          <ValueModal mode={modal} onClose={() => setModal(null)} onConfirm={handleConfirm} />
        )}
      </AnimatePresence>
    </div>
  );
}

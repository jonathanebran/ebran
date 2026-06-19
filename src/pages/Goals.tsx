import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Zap, CheckCircle2, Clock, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GoalCard } from '../components/GoalCard';
import { WishlistCard } from '../components/WishlistCard';
import { CareGoalCard } from '../components/CareGoalCard';
import { GlassCard } from '../components/GlassCard';
import { mockWishlistItems } from '../data/mockData';
import { useGoals } from '../contexts/GoalsContext';
import { formatCurrency, getPercentage, getDaysRemaining, getMonthlySuggestion } from '../lib/utils';
import type { Goal } from '../lib/types';

const tabs = ['Grandes', 'Focos', 'Desejos', 'Cuidado', 'Planejamento'] as const;
type Tab = typeof tabs[number];

// ─── AI Planning Engine ──────────────────────────────────────────────────────

type ActionTag = 'focar_agora' | 'no_caminho' | 'pode_adiar' | 'pesquisar';

interface GoalAnalysis {
  goal: Goal;
  action: ActionTag;
  reason: string;
  pct: number;
  days: number | null;
}

const actionConfig: Record<ActionTag, { label: string; color: string; icon: React.ReactNode }> = {
  focar_agora: { label: 'Foco agora',     color: '#FF6B5F', icon: <Zap size={12} /> },
  no_caminho:  { label: 'No caminho',     color: '#22c55e', icon: <CheckCircle2 size={12} /> },
  pode_adiar:  { label: 'Pode adiar',     color: '#FF9F3D', icon: <Clock size={12} /> },
  pesquisar:   { label: 'Pesquisar',      color: '#A8A8A8', icon: <Search size={12} /> },
};

function analyzeGoals(goals: Goal[]): GoalAnalysis[] {
  return goals
    .filter(g => g.status !== 'completed' && g.status !== 'cancelled' && g.status !== 'archived')
    .map(g => {
      const pct = getPercentage(g.current_amount, g.target_amount);
      const days = g.desired_date ? getDaysRemaining(g.desired_date) : null;

      let action: ActionTag;
      let reason: string;

      const isUrgent   = g.priority === 'urgent';
      const isHigh     = g.priority === 'high';
      const isMedium   = g.priority === 'medium';
      const closeDeadline = days !== null && days < 90;
      const veryClose  = days !== null && days < 30;
      const noValue    = g.target_amount === 0;
      const goodProgress = pct >= 50;
      const lowProgress  = pct < 25;

      if (noValue || g.type === 'wish') {
        action = 'pesquisar';
        reason = noValue
          ? 'Defina um valor alvo para começar a planejar.'
          : 'Pesquise o preço e considere transformar em meta financeira.';
      } else if (isUrgent || (isHigh && veryClose) || (closeDeadline && lowProgress)) {
        action = 'focar_agora';
        reason = veryClose
          ? `Prazo em ${days} dias com ${pct}% concluído — prioridade máxima.`
          : isUrgent
            ? `Meta urgente: faltam ${formatCurrency(g.target_amount - g.current_amount)}.`
            : `Prazo se aproxima (${days} dias) e progresso está baixo (${pct}%).`;
      } else if (goodProgress || (!closeDeadline && pct > 0)) {
        action = 'no_caminho';
        reason = pct >= 80
          ? `Quase lá! Faltam apenas ${formatCurrency(g.target_amount - g.current_amount)}.`
          : days !== null
            ? `${pct}% concluído com ${days} dias restantes — ritmo adequado.`
            : `Progresso de ${pct}% — continue assim.`;
      } else if (!isUrgent && !isHigh && (!closeDeadline || isMedium)) {
        action = 'pode_adiar';
        reason = days !== null
          ? `Prazo em ${days} dias e prioridade ${g.priority === 'low' ? 'baixa' : 'média'} — sem urgência.`
          : 'Sem prazo definido e prioridade baixa — pode ser postergado.';
      } else {
        action = 'no_caminho';
        reason = `${pct}% concluído — acompanhe o progresso regularmente.`;
      }

      return { goal: g, action, reason, pct, days };
    });
}

function generateInsights(goals: Goal[]): string[] {
  const insights: string[] = [];
  const active = goals.filter(g => g.status === 'active' || g.status === 'in_progress');

  // Almost there
  const almostDone = active.filter(g => g.target_amount > 0 && getPercentage(g.current_amount, g.target_amount) >= 75);
  almostDone.slice(0, 2).forEach(g => {
    const remaining = g.target_amount - g.current_amount;
    insights.push(`Faltam apenas ${formatCurrency(remaining)} para completar "${g.title}".`);
  });

  // Monthly suggestion
  const withDeadline = active.filter(g => g.desired_date && g.target_amount > g.current_amount);
  withDeadline.slice(0, 1).forEach(g => {
    const monthly = getMonthlySuggestion(g.target_amount, g.current_amount, g.desired_date!);
    if (monthly > 0) {
      insights.push(`Guardando ${formatCurrency(monthly)}/mês você atinge "${g.title}" no prazo.`);
    }
  });

  // Total goal value
  const totalTarget = active.reduce((s, g) => s + g.target_amount, 0);
  const totalCurrent = active.reduce((s, g) => s + g.current_amount, 0);
  if (totalTarget > 0) {
    insights.push(`Total em metas ativas: ${formatCurrency(totalCurrent)} de ${formatCurrency(totalTarget)} (${getPercentage(totalCurrent, totalTarget)}% acumulado).`);
  }

  return insights.slice(0, 4);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PlanningTab({ goals, onAdd }: { goals: Goal[]; onAdd: () => void }) {
  const analysis = useMemo(() => analyzeGoals(goals), [goals]);
  const insights = useMemo(() => generateInsights(goals), [goals]);

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Sparkles size={32} color="#FF9F3D" />
        <p className="text-[#F7F7F7] font-semibold text-base">Nenhuma meta cadastrada</p>
        <p className="text-[#6F6F6F] text-sm text-center px-6">
          Adicione metas para a IA gerar seu planejamento personalizado.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl"
          style={{ background: 'rgba(255,159,61,0.12)', border: '1px dashed rgba(255,159,61,0.35)' }}
        >
          <Plus size={16} color="#FF9F3D" />
          <span className="text-[#FF9F3D] text-sm font-semibold">Criar primeira meta</span>
        </motion.button>
      </div>
    );
  }

  const groups: ActionTag[] = ['focar_agora', 'no_caminho', 'pode_adiar', 'pesquisar'];

  const avgPct = analysis.length > 0
    ? Math.round(analysis.reduce((s, a) => s + a.pct, 0) / analysis.length)
    : 0;
  const totalTarget  = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.current_amount, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg, rgba(255,159,61,0.12), rgba(255,47,125,0.08))', border: '1px solid rgba(255,159,61,0.2)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} color="#FF9F3D" />
          <span className="text-[#FF9F3D] text-xs font-bold uppercase tracking-wider">Análise de IA</span>
        </div>
        <p className="text-[#F7F7F7] font-bold text-base mb-3">Planejamento Inteligente</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Metas', value: String(analysis.length) },
            { label: 'Progresso médio', value: `${avgPct}%` },
            { label: 'Acumulado', value: formatCurrency(totalCurrent) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[#F7F7F7] font-bold text-sm">{value}</p>
              <p className="text-[#6F6F6F] text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {totalTarget > 0 && (
          <p className="text-[#6F6F6F] text-[10px] mt-2 text-center">
            Meta total: {formatCurrency(totalTarget)}
          </p>
        )}
      </div>

      {/* Recommendation groups */}
      {groups.map(action => {
        const items = analysis.filter(a => a.action === action);
        if (items.length === 0) return null;
        const cfg = actionConfig[action];
        return (
          <GlassCard key={action}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: cfg.color }}>{cfg.icon}</span>
              <span className="text-[#F7F7F7] font-semibold text-sm">{cfg.label}</span>
              <span
                className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${cfg.color}22`, color: cfg.color }}
              >
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-0">
              {items.map(({ goal: g, reason, pct }, i) => (
                <div
                  key={g.id}
                  className="py-3"
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F7F7F7] text-sm font-semibold truncate">{g.title}</p>
                      <p className="text-[#6F6F6F] text-xs mt-0.5 leading-relaxed">{reason}</p>
                    </div>
                    {g.target_amount > 0 && (
                      <span
                        className="text-[11px] font-bold flex-shrink-0 mt-0.5"
                        style={{ color: cfg.color }}
                      >
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        );
      })}

      {/* Insights */}
      {insights.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} color="#a78bfa" />
            <span className="text-[#F7F7F7] font-semibold text-sm">Insights</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <AlertCircle size={13} color="#a78bfa" className="mt-0.5 flex-shrink-0" />
                <p className="text-[#A8A8A8] text-xs leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <p className="text-[#6F6F6F] text-sm">{label}</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl"
        style={{ background: 'rgba(255,159,61,0.12)', border: '1px dashed rgba(255,159,61,0.35)' }}
      >
        <Plus size={16} color="#FF9F3D" />
        <span className="text-[#FF9F3D] text-sm font-semibold">Nova meta</span>
      </motion.button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function Goals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { goals } = useGoals();

  const paramTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<Tab>(
    tabs.includes(paramTab as Tab) ? (paramTab as Tab) : 'Grandes'
  );

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const largeGoals = goals.filter(g => g.type === 'financial' || g.type === 'travel');
  const focusGoals = goals.filter(g => g.type === 'small');
  const careGoals  = goals.filter(g => g.type === 'care' || g.type === 'health');
  const wishGoals  = goals.filter(g => g.type === 'wish');

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Metas</h1>
        <p className="text-[#6F6F6F] text-sm mt-0.5">Tudo o que você quer conquistar, organizado.</p>
      </div>

      <div className="px-5 mt-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/metas/nova')}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4"
          style={{ background: 'linear-gradient(90deg, #FFD84A, #FF9F3D 40%, #FF6B5F 70%, #FF2F7D)' }}
        >
          <Plus size={20} color="#000" strokeWidth={2.5} />
          <span className="text-black font-bold text-base">Nova meta</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {activeTab === 'Grandes' && (
          largeGoals.length > 0
            ? largeGoals.map(g => <GoalCard key={g.id} goal={g} variant="ring" />)
            : <EmptyState label="Nenhuma meta grande ainda." onAdd={() => navigate('/metas/nova')} />
        )}

        {activeTab === 'Focos' && (
          focusGoals.length > 0
            ? focusGoals.map(g => <GoalCard key={g.id} goal={g} />)
            : <EmptyState label="Nenhum foco cadastrado." onAdd={() => navigate('/metas/nova')} />
        )}

        {activeTab === 'Desejos' && (
          <>
            {wishGoals.length > 0
              ? wishGoals.map(g => <GoalCard key={g.id} goal={g} variant="compact" />)
              : <EmptyState label="Nenhum desejo cadastrado." onAdd={() => navigate('/metas/nova')} />
            }
            {mockWishlistItems.length > 0 && (
              <div className="mt-2">
                <p className="text-[#A8A8A8] text-xs font-medium mb-2">Lista de desejos</p>
                {mockWishlistItems.map(w => <WishlistCard key={w.id} item={w} />)}
              </div>
            )}
          </>
        )}

        {activeTab === 'Cuidado' && (
          careGoals.length > 0
            ? careGoals.map(g => (
                <CareGoalCard key={g.id} goal={g} onClick={() => navigate(`/metas/${g.id}`)} />
              ))
            : <EmptyState label="Nenhuma meta de cuidado." onAdd={() => navigate('/metas/nova')} />
        )}

        {activeTab === 'Planejamento' && (
          <PlanningTab goals={goals} onAdd={() => navigate('/metas/nova')} />
        )}
      </div>
    </div>
  );
}

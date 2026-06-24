import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Droplets, Dumbbell, Moon, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { AICommandBar } from '../components/AICommandBar';
import { ProgressBar } from '../components/ProgressBar';
import { ProgressRing } from '../components/ProgressRing';
import { mockWorkSummary, mockHealthToday, mockRecentActivity } from '../data/mockData';
import { useGoals } from '../contexts/GoalsContext';
import { formatCurrency, getPercentage } from '../lib/utils';
import { Briefcase } from 'lucide-react';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
};

export function Home() {
  const navigate = useNavigate();
  const { goals } = useGoals();

  const workPct = getPercentage(mockWorkSummary.monthly_revenue, mockWorkSummary.monthly_goal);
  const primaryGoal = goals.find(g => g.status === 'active') ?? goals[0] ?? null;
  const goalPct = primaryGoal ? getPercentage(primaryGoal.current_amount, primaryGoal.target_amount) : 0;
  const activeCount = goals.filter(g => g.status === 'active').length;

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#000' }}>
      <Header showGreeting />

      <motion.div
        className="flex flex-col gap-4 px-5 mt-4"
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        {/* AI Bar */}
        <motion.div variants={stagger.item}>
          <AICommandBar />
        </motion.div>

        {/* Trabalho + Metas — 2 colunas */}
        <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3">
          {/* Trabalho */}
          <GlassCard onClick={() => navigate('/trabalho')} padding="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Briefcase size={13} color="#FF9F3D" />
                <span className="text-[#F7F7F7] font-semibold text-xs">Trabalho</span>
              </div>
            </div>
            <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wide mb-0.5">Faturamento</p>
            <p className="text-[#F7F7F7] font-bold text-base leading-tight">{formatCurrency(mockWorkSummary.monthly_revenue)}</p>
            <p className="text-[#6F6F6F] text-[10px] mb-2">Meta {formatCurrency(mockWorkSummary.monthly_goal)}</p>
            <ProgressBar value={workPct} height={4} />
            <p className="text-[#FF9F3D] text-[10px] font-bold mt-1.5">{workPct}%</p>
            <div className="flex justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-[#6F6F6F] text-[9px]">Atendimentos</p>
                <p className="text-[#F7F7F7] text-xs font-bold">{mockWorkSummary.services_count}</p>
              </div>
              <div className="text-right">
                <p className="text-[#6F6F6F] text-[9px]">Ticket médio</p>
                <p className="text-[#F7F7F7] text-xs font-bold">{formatCurrency(mockWorkSummary.average_ticket)}</p>
              </div>
            </div>
          </GlassCard>

          {/* Metas */}
          <GlassCard onClick={() => navigate('/metas')} padding="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#F7F7F7] font-semibold text-xs">Metas</span>
              <ChevronRight size={14} color="#6F6F6F" />
            </div>
            {primaryGoal ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <ProgressRing value={goalPct} size={52} strokeWidth={5} label={`${goalPct}%`} />
                  <div className="min-w-0">
                    <p className="text-[#F7F7F7] font-bold text-xs leading-tight truncate">{primaryGoal.title}</p>
                    <p className="text-[#6F6F6F] text-[10px]">{primaryGoal.category}</p>
                  </div>
                </div>
                <p className="text-[#6F6F6F] text-[9px]">Guardado</p>
                <p className="text-[#F7F7F7] text-xs font-bold">{formatCurrency(primaryGoal.current_amount)}</p>
                <p className="text-[#6F6F6F] text-[9px]">de {formatCurrency(primaryGoal.target_amount)}</p>
                {activeCount > 1 && (
                  <p className="text-[#FF9F3D] text-[9px] font-semibold mt-1">+{activeCount - 1} outras</p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={e => { e.stopPropagation(); navigate('/metas/nova'); }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,159,61,0.15)', border: '1px dashed rgba(255,159,61,0.4)' }}
                >
                  <Plus size={18} color="#FF9F3D" />
                </motion.button>
                <p className="text-[#6F6F6F] text-[10px] text-center">Criar primeira meta</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Saúde */}
        <motion.div variants={stagger.item}>
          <GlassCard onClick={() => navigate('/saude')}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#F7F7F7] font-semibold text-sm">Saúde</span>
              <ChevronRight size={16} color="#6F6F6F" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Droplets size={18} color="#FF9F3D" />
                <p className="text-[#F7F7F7] text-xs font-bold">{mockHealthToday.water.current}L</p>
                <p className="text-[#6F6F6F] text-[10px]">{mockHealthToday.water.target}L meta</p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Dumbbell size={18} color={mockHealthToday.workout.done ? '#22c55e' : '#6F6F6F'} />
                <p className="text-[#F7F7F7] text-xs font-bold">Treino</p>
                <p className="text-[10px]" style={{ color: mockHealthToday.workout.done ? '#22c55e' : '#6F6F6F' }}>
                  {mockHealthToday.workout.done ? 'Concluído' : 'Pendente'}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Moon size={18} color="#a78bfa" />
                <p className="text-[#F7F7F7] text-xs font-bold">{mockHealthToday.sleep.hours}h {mockHealthToday.sleep.minutes}min</p>
                <p className="text-[#6F6F6F] text-[10px]">Sono</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Atividade Recente */}
        <motion.div variants={stagger.item}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#F7F7F7] font-semibold text-sm">Atividade recente</span>
            <button className="text-xs font-semibold" style={{ color: '#FF9F3D' }}>Ver todas</button>
          </div>
          {mockRecentActivity.length === 0 ? (
            <p className="text-[#6F6F6F] text-sm text-center py-4">Nenhuma atividade ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {mockRecentActivity.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}22` }}
                  >
                    {item.icon === 'briefcase' && <Briefcase size={16} color={item.color} />}
                    {item.icon === 'dollar-sign' && <span style={{ color: item.color, fontSize: 15, fontWeight: 'bold' }}>$</span>}
                    {item.icon === 'target' && <span style={{ color: item.color, fontSize: 15 }}>◎</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F7F7F7] text-xs font-medium truncate">{item.title}</p>
                    <p className="text-[#6F6F6F] text-[10px]">{item.subtitle}</p>
                  </div>
                  <span className="text-[#6F6F6F] text-[10px] flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

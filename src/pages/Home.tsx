import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Briefcase, Droplets, Dumbbell, Moon, Heart, Clock, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { AICommandBar } from '../components/AICommandBar';
import { ProgressBar } from '../components/ProgressBar';
import { ProgressRing } from '../components/ProgressRing';
import {
  mockWorkSummary, mockHealthToday, mockRecentActivity, mockDailyFocusItems
} from '../data/mockData';
import { useGoals } from '../contexts/GoalsContext';
import { formatCurrency, getPercentage } from '../lib/utils';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
};

export function Home() {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const workPct = getPercentage(mockWorkSummary.monthly_revenue, mockWorkSummary.monthly_goal);
  const primaryGoal = goals[0] ?? null;
  const goalPct = primaryGoal ? getPercentage(primaryGoal.current_amount, primaryGoal.target_amount) : 0;
  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const pendingFocus = mockDailyFocusItems.filter(i => i.status === 'pending').slice(0, 3);

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

        {/* Foco Diário */}
        <motion.div variants={stagger.item}>
          <GlassCard onClick={() => navigate('/foco')}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,159,61,0.15)' }}>
                  <Clock size={14} color="#FF9F3D" />
                </div>
                <span className="text-[#F7F7F7] font-semibold text-sm">Foco Diário</span>
              </div>
              <ChevronRight size={16} color="#6F6F6F" />
            </div>
            <div className="flex flex-col gap-2">
              {pendingFocus.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.priority === 'high' ? '#FF6B5F' : '#6F6F6F' }} />
                  <span className="text-[#A8A8A8] text-xs">{item.name}</span>
                  {item.category === 'market' && <span className="text-[10px] text-[#6F6F6F]">· Mercado</span>}
                  {item.category === 'care' && <span className="text-[10px] text-[#6F6F6F]">· Cuidado</span>}
                </div>
              ))}
              <p className="text-[#6F6F6F] text-xs mt-1">
                {mockDailyFocusItems.filter(i => i.status === 'pending').length} pendências hoje
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Saúde + Trabalho em grid */}
        <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3">
          {/* Saúde */}
          <GlassCard onClick={() => navigate('/saude')} padding="p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Heart size={13} color="#FF6B5F" />
                <span className="text-[#F7F7F7] font-semibold text-xs">Saúde</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Droplets size={12} color="#FF9F3D" />
                <span className="text-[#A8A8A8] text-[11px]">{mockHealthToday.water.current}L / {mockHealthToday.water.target}L</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Dumbbell size={12} color="#22c55e" />
                <span className="text-[#A8A8A8] text-[11px]">Treino feito ✓</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Moon size={12} color="#a78bfa" />
                <span className="text-[#A8A8A8] text-[11px]">7h 15min</span>
              </div>
            </div>
          </GlassCard>

          {/* Trabalho */}
          <GlassCard onClick={() => navigate('/trabalho')} padding="p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Briefcase size={13} color="#FF9F3D" />
                <span className="text-[#F7F7F7] font-semibold text-xs">Trabalho</span>
              </div>
            </div>
            <p className="text-[#F7F7F7] font-bold text-base leading-tight">{formatCurrency(mockWorkSummary.monthly_revenue)}</p>
            <p className="text-[#6F6F6F] text-[10px] mb-2">Meta: {formatCurrency(mockWorkSummary.monthly_goal)}</p>
            <ProgressBar value={workPct} height={4} />
            <p className="text-[#FF9F3D] text-[10px] font-bold mt-1.5">{workPct}%</p>
          </GlassCard>
        </motion.div>

        {/* Metas */}
        <motion.div variants={stagger.item}>
          <GlassCard onClick={() => navigate('/metas')}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#F7F7F7] font-semibold text-sm">Metas</span>
              <ChevronRight size={16} color="#6F6F6F" />
            </div>
            {primaryGoal ? (
              <div className="flex items-center gap-4">
                <ProgressRing value={goalPct} size={60} strokeWidth={5} label={`${goalPct}%`} />
                <div>
                  <p className="text-[#F7F7F7] font-bold text-sm">{primaryGoal.title}</p>
                  <p className="text-[#A8A8A8] text-xs mt-0.5">{formatCurrency(primaryGoal.current_amount)} guardados</p>
                  <p className="text-[#6F6F6F] text-[10px] mt-1">{activeGoalsCount} {activeGoalsCount === 1 ? 'meta ativa' : 'metas ativas'}</p>
                </div>
              </div>
            ) : (
              <p className="text-[#6F6F6F] text-sm">Nenhuma meta ainda. Toque para criar a primeira.</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Cuidado Pessoal */}
        <motion.div variants={stagger.item}>
          <GlassCard onClick={() => navigate('/saude')}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,47,125,0.12)' }}>
                  <Sparkles size={14} color="#FF2F7D" />
                </div>
                <span className="text-[#F7F7F7] font-semibold text-sm">Cuidado Pessoal</span>
              </div>
              <ChevronRight size={16} color="#6F6F6F" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#A8A8A8] text-xs">Skincare noite</span>
                <span className="text-[#FF6B5F] text-xs font-medium">Pendente</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A8A8A8] text-xs">Psicóloga</span>
                <span className="text-[#A8A8A8] text-xs">Qui, 15:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A8A8A8] text-xs">Protetor Solar</span>
                <span className="text-[#FF9F3D] text-xs">Repor em 3 dias</span>
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
                  {item.icon === 'dollar-sign' && <span style={{ color: item.color, fontSize: 16, fontWeight: 'bold' }}>$</span>}
                  {item.icon === 'target' && <span style={{ color: item.color, fontSize: 16 }}>◎</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F7F7F7] text-xs font-medium truncate">{item.title}</p>
                  <p className="text-[#6F6F6F] text-[10px]">{item.subtitle}</p>
                </div>
                <span className="text-[#6F6F6F] text-[10px] flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Sugestões */}
        <motion.div variants={stagger.item}>
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,47,125,0.07)',
              border: '1px solid rgba(255,47,125,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} color="#FF9F3D" />
              <span className="text-[#FF9F3D] text-xs font-semibold">Sugestão da IA</span>
            </div>
            <p className="text-[#F7F7F7] text-sm">
              Você está a <span className="text-[#FF9F3D] font-bold">R$ 1.800</span> da sua meta mensal de trabalho. Mais 2 serviços e você chega lá.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Camera, Globe, Sparkles, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { Chip } from '../components/Chip';
import { AICommandBar } from '../components/AICommandBar';
import { mockWorkSummary, mockWorkRecords } from '../data/mockData';
import { formatCurrency, getPercentage } from '../lib/utils';

// ─── Work Goals data ──────────────────────────────────────────────────────────

interface TaskItem { label: string; done: boolean }

interface WorkGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  // financial goal
  target?: number;
  current?: number;
  unit?: string;
  deadline?: string;
  // checklist goal
  tasks?: TaskItem[];
}

const workGoals: WorkGoal[] = [
  {
    id: 'wg-europa',
    title: 'Viagem Europa',
    description: 'Trabalhar e fotografar em Portugal e Espanha',
    icon: '✈️',
    category: 'Viagem',
    color: '#FF9F3D',
    target: 15000,
    current: 4200,
    deadline: 'Dez 2025',
  },
  {
    id: 'wg-fotos',
    title: 'Novos conteúdos',
    description: 'Sessões fotográficas para portfólio e redes',
    icon: '📷',
    category: 'Conteúdo',
    color: '#FFD84A',
    target: 20,
    current: 7,
    unit: 'sessões',
    deadline: 'Mensal',
  },
  {
    id: 'wg-site',
    title: 'Atualizar o site',
    description: 'Fotos, vídeos e textos sempre frescos',
    icon: '🌐',
    category: 'Marketing',
    color: '#FF6B5F',
    tasks: [
      { label: 'Upload de 10 novas fotos', done: false },
      { label: 'Gravar reels e vídeos', done: false },
      { label: 'Atualizar depoimentos', done: true },
      { label: 'Novo texto de apresentação', done: false },
      { label: 'Atualizar preços e pacotes', done: true },
    ],
  },
  {
    id: 'wg-cuidado',
    title: 'Cuidados pessoais',
    description: 'Estética e bem-estar para imagem profissional',
    icon: '✨',
    category: 'Beleza',
    color: '#FF2F7D',
    tasks: [
      { label: 'Skincare rotina diária', done: true },
      { label: 'Procedimento estético trimestral', done: false },
      { label: 'Treino 5× por semana', done: false },
      { label: 'Cabelo — manutenção mensal', done: false },
      { label: 'Hidratação 3L/dia', done: true },
    ],
  },
];

// ─── Atendimentos tab ─────────────────────────────────────────────────────────

function AtendimentosTab() {
  const navigate = useNavigate();
  const workPct = getPercentage(mockWorkSummary.monthly_revenue, mockWorkSummary.monthly_goal);

  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,159,61,0.15)' }}>
            <Briefcase size={18} color="#FF9F3D" />
          </div>
          <div>
            <p className="text-[#A8A8A8] text-xs">Faturamento de junho</p>
            <p className="text-[#F7F7F7] font-bold text-2xl">{formatCurrency(mockWorkSummary.monthly_revenue)}</p>
          </div>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#A8A8A8]">Meta: {formatCurrency(mockWorkSummary.monthly_goal)}</span>
          <span className="text-[#FF9F3D] font-bold">{workPct}%</span>
        </div>
        <ProgressBar value={workPct} height={6} />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[#6F6F6F] text-[10px] uppercase">Atendimentos</p>
            <p className="text-[#F7F7F7] font-bold text-xl mt-0.5">{mockWorkSummary.services_count}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[#6F6F6F] text-[10px] uppercase">Ticket médio</p>
            <p className="text-[#F7F7F7] font-bold text-xl mt-0.5">{formatCurrency(mockWorkSummary.average_ticket)}</p>
          </div>
        </div>
      </GlassCard>

      <AICommandBar placeholder="Recebi R$ 500 via Pix hoje da Camila..." compact />

      <GlassCard>
        <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Atendimentos recentes</p>
        {mockWorkRecords.map(r => (
          <div key={r.id} className="flex items-center gap-3 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <Camera size={16} color="#22c55e" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F7F7F7] text-sm font-medium truncate">{r.description}</p>
              <p className="text-[#6F6F6F] text-xs">{r.date} · {r.payment_method?.toUpperCase()}</p>
            </div>
            <p className="text-[#22c55e] font-bold text-sm">+{formatCurrency(r.amount)}</p>
          </div>
        ))}
      </GlassCard>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/novo-registro')}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4"
        style={{ background: 'linear-gradient(90deg, #FFD84A, #FF9F3D 40%, #FF6B5F 70%, #FF2F7D)' }}
      >
        <Plus size={18} color="#000" strokeWidth={2.5} />
        <span className="text-black font-bold">Novo atendimento</span>
      </motion.button>
    </div>
  );
}

// ─── Work Goals tab ───────────────────────────────────────────────────────────

function WorkGoalCard({ goal }: { goal: WorkGoal }) {
  const [tasks, setTasks] = useState<TaskItem[]>(goal.tasks ?? []);

  const toggleTask = (i: number) => {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  };

  const isMoney = goal.target !== undefined && !goal.unit;
  const isCount = goal.target !== undefined && !!goal.unit;
  const pct = goal.target ? Math.round(((goal.current ?? 0) / goal.target) * 100) : 0;
  const tasksDone = tasks.filter(t => t.done).length;
  const tasksPct = tasks.length ? Math.round((tasksDone / tasks.length) * 100) : 0;

  return (
    <GlassCard>
      <div className="flex items-start gap-3 mb-3">
        <span style={{ fontSize: 26 }}>{goal.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[#F7F7F7] font-bold text-sm">{goal.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-xl font-medium" style={{ background: `${goal.color}22`, color: goal.color }}>
              {goal.category}
            </span>
          </div>
          <p className="text-[#6F6F6F] text-xs mt-0.5">{goal.description}</p>
        </div>
        {goal.deadline && <span className="text-[10px] text-[#6F6F6F]">{goal.deadline}</span>}
      </div>

      {(isMoney || isCount) && (
        <>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#A8A8A8]">
              {isMoney
                ? `${formatCurrency(goal.current ?? 0)} de ${formatCurrency(goal.target!)}`
                : `${goal.current} de ${goal.target} ${goal.unit}`}
            </span>
            <span className="font-bold" style={{ color: goal.color }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(2, pct)}%`,
                background: `linear-gradient(90deg, ${goal.color}99, ${goal.color})`,
                boxShadow: `0 0 8px ${goal.color}70`,
              }}
            />
          </div>
        </>
      )}

      {tasks.length > 0 && (
        <>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#A8A8A8]">{tasksDone} de {tasks.length} concluídos</span>
            <span className="font-bold" style={{ color: goal.color }}>{tasksPct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(2, tasksPct)}%`,
                background: `linear-gradient(90deg, ${goal.color}99, ${goal.color})`,
                boxShadow: `0 0 8px ${goal.color}70`,
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            {tasks.map((task, i) => (
              <motion.button
                key={task.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleTask(i)}
                className="flex items-center gap-3 py-2 text-left"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: task.done ? `linear-gradient(135deg, ${goal.color}, #FF2F7D)` : 'rgba(255,255,255,0.08)',
                    border: task.done ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  {task.done && <span style={{ fontSize: 10, color: '#000' }}>✓</span>}
                </div>
                <span
                  className="text-sm flex-1"
                  style={{
                    color: task.done ? '#6F6F6F' : '#F7F7F7',
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}
                >
                  {task.label}
                </span>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}

function MetasTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 py-2">
        <Target size={15} color="#FF9F3D" />
        <span className="text-[#A8A8A8] text-xs">Metas profissionais e de desenvolvimento</span>
      </div>
      {workGoals.map(g => <WorkGoalCard key={g.id} goal={g} />)}
    </div>
  );
}

// ─── AI Analysis tab ──────────────────────────────────────────────────────────

function AIAnalysisTab() {
  const { monthly_revenue, monthly_goal, services_count, average_ticket } = mockWorkSummary;

  const insights = useMemo(() => {
    const metaPct = getPercentage(monthly_revenue, monthly_goal);
    const daysInMonth = 30;
    const daysPassed = 17;
    const daysLeft = daysInMonth - daysPassed;
    const dailyRate = monthly_revenue / daysPassed;
    const projection = Math.round(monthly_revenue + dailyRate * daysLeft);
    const projPct = getPercentage(projection, monthly_goal);
    const missingToGoal = Math.max(0, monthly_goal - monthly_revenue);
    const sessionsNeeded = missingToGoal > 0 ? Math.ceil(missingToGoal / average_ticket) : 0;

    return [
      {
        icon: metaPct >= 60 ? '📈' : '⚠️',
        title: metaPct >= 80 ? 'Meta quase atingida!' : metaPct >= 50 ? 'No caminho certo' : 'Atenção à meta',
        desc: `Você está em ${metaPct}% da meta mensal. ${sessionsNeeded > 0 ? `Faltam ${sessionsNeeded} atendimento${sessionsNeeded > 1 ? 's' : ''} para atingi-la.` : 'Meta já atingida!'}`,
        color: metaPct >= 80 ? '#22c55e' : metaPct >= 50 ? '#FF9F3D' : '#FF6B5F',
      },
      {
        icon: '🔮',
        title: 'Projeção do mês',
        desc: `No ritmo atual (R$ ${Math.round(dailyRate).toLocaleString('pt-BR')}/dia), você fecha em ${formatCurrency(projection)} — ${projPct >= 100 ? 'acima' : 'abaixo'} da meta.`,
        color: projPct >= 100 ? '#22c55e' : '#FF9F3D',
      },
      {
        icon: '💡',
        title: 'Ticket médio',
        desc: `Seu ticket médio é ${formatCurrency(average_ticket)}. Aumentar em 10% adicionaria ${formatCurrency(services_count * average_ticket * 0.1)} por mês no faturamento.`,
        color: '#FFD84A',
      },
      {
        icon: '📅',
        title: 'Ritmo de atendimentos',
        desc: `Você fez ${services_count} atendimentos em ${daysPassed} dias — uma média de ${(services_count / daysPassed * 7).toFixed(1)} por semana. Continue assim!`,
        color: '#FF9F3D',
      },
      {
        icon: '✈️',
        title: 'Meta Europa',
        desc: `Guardando ${formatCurrency(Math.round(monthly_goal * 0.3))} por mês, você atinge a meta da viagem em ${Math.ceil((15000 - 4200) / (monthly_goal * 0.3))} meses.`,
        color: '#FF6B5F',
      },
    ];
  }, [monthly_revenue, monthly_goal, services_count, average_ticket]);

  const chartMax = mockWorkRecords.reduce((max, r) => Math.max(max, r.amount), 0);
  const byMonth = ['Jan','Fev','Mar','Abr','Mai','Jun'].map((m, i) => ({
    label: m,
    value: [2100, 3400, 2800, 3900, 4200, monthly_revenue][i],
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* Trend chart */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,159,61,0.15)' }}>
            <TrendingUp size={15} color="#FF9F3D" />
          </div>
          <div>
            <p className="text-[#F7F7F7] font-semibold text-sm">Faturamento 2025</p>
            <p className="text-[#6F6F6F] text-xs">Tendência dos últimos 6 meses</p>
          </div>
        </div>
        <div className="flex items-end gap-2 h-20">
          {byMonth.map((m, i) => {
            const h = Math.round((m.value / 5000) * 100);
            const isLast = i === byMonth.length - 1;
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative" style={{ height: 64 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 rounded-t-lg"
                    style={{
                      background: isLast
                        ? 'linear-gradient(180deg, #FFD84A, #FF9F3D)'
                        : 'rgba(255,255,255,0.1)',
                      boxShadow: isLast ? '0 0 12px #FF9F3D60' : 'none',
                    }}
                  />
                </div>
                <span className="text-[9px] text-[#6F6F6F]">{m.label}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Insights */}
      <div className="flex items-center gap-2 mt-1 mb-1">
        <Sparkles size={14} color="#FFD84A" />
        <span className="text-[#A8A8A8] text-xs font-medium">Insights da IA</span>
      </div>

      {insights.map(insight => (
        <GlassCard key={insight.title} padding="p-4">
          <div className="flex gap-3">
            <span style={{ fontSize: 22, lineHeight: 1 }}>{insight.icon}</span>
            <div className="flex-1">
              <p className="text-[#F7F7F7] font-semibold text-sm mb-0.5" style={{ color: insight.color }}>
                {insight.title}
              </p>
              <p className="text-[#A8A8A8] text-xs leading-relaxed">{insight.desc}</p>
            </div>
          </div>
        </GlassCard>
      ))}

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} color="#A8A8A8" />
          <span className="text-[#A8A8A8] text-xs font-medium">Atendimentos por valor</span>
        </div>
        {mockWorkRecords.map(r => (
          <div key={r.id} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#F7F7F7] truncate flex-1 mr-2">{r.description}</span>
              <span className="text-[#22c55e] font-bold">{formatCurrency(r.amount)}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((r.amount / chartMax) * 100)}%`,
                  background: 'linear-gradient(90deg, #22c55e80, #22c55e)',
                }}
              />
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const tabs = ['Atendimentos', 'Metas', 'Análise IA'] as const;
type Tab = typeof tabs[number];

export function Work() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Atendimentos');

  const tabContent: Record<Tab, React.ReactElement> = {
    Atendimentos: <AtendimentosTab />,
    Metas: <MetasTab />,
    'Análise IA': <AIAnalysisTab />,
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <span className="text-[#F7F7F7] text-xl">‹</span>
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7] flex-1">Trabalho</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/novo-registro')}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFD84A, #FF2F7D)' }}
        >
          <Plus size={18} color="#000" />
        </motion.button>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}

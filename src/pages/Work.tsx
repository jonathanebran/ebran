import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Sparkles, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Chip } from '../components/Chip';
import { mockPhotoSessions } from '../data/mockData';
import { formatCurrency } from '../lib/utils';
import type { PhotoSession } from '../lib/types';

// ─── Work Goals data ──────────────────────────────────────────────────────────

interface TaskItem { label: string; done: boolean }

interface WorkGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  target?: number;
  current?: number;
  unit?: string;
  deadline?: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
}

function getSessionsInRange(sessions: PhotoSession[], startMs: number, endMs: number) {
  return sessions.filter(s => {
    const t = new Date(s.date).getTime();
    return t >= startMs && t <= endMs;
  });
}

const SERVICE_ICONS: Record<string, string> = {
  'Ensaio Retrato': '🧑‍🎨',
  'Ensaio Casal': '💑',
  'Ensaio Família': '👨‍👩‍👧',
  'Aniversário/Debutante': '🎂',
  'Fotografia Corporativa': '🏢',
  'Fotografia de Produto': '📦',
};

// ─── Atendimentos tab ─────────────────────────────────────────────────────────

function AtendimentosTab() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<30 | 60 | 90>(30);

  const todayMs = new Date('2026-06-17').getTime();
  const startMs = todayMs - period * 86_400_000;
  const prevStartMs = startMs - period * 86_400_000;

  const current = useMemo(
    () => getSessionsInRange(mockPhotoSessions, startMs, todayMs)
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()),
    [period]
  );
  const prev = useMemo(
    () => getSessionsInRange(mockPhotoSessions, prevStartMs, startMs),
    [period]
  );

  const trendPct = prev.length > 0
    ? Math.round(((current.length - prev.length) / prev.length) * 100)
    : 0;
  const weeklyAvg = (current.length / (period / 7)).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      {/* Period selector */}
      <div className="flex gap-2">
        {([30, 60, 90] as const).map(p => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPeriod(p)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
            style={{
              background: period === p ? 'rgba(255,159,61,0.18)' : 'rgba(255,255,255,0.05)',
              color: period === p ? '#FF9F3D' : '#6F6F6F',
              border: period === p ? '0.5px solid rgba(255,159,61,0.35)' : '0.5px solid rgba(255,255,255,0.06)',
            }}
          >
            {p} dias
          </motion.button>
        ))}
      </div>

      {/* Stats card */}
      <GlassCard>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,159,61,0.15)' }}
          >
            <Camera size={22} color="#FF9F3D" />
          </div>
          <div>
            <p className="text-[#A8A8A8] text-xs">Atendimentos — últimos {period} dias</p>
            <div className="flex items-end gap-2 mt-0.5">
              <p className="text-[#F7F7F7] font-bold text-3xl leading-none">{current.length}</p>
              {prev.length > 0 && (
                <div
                  className="flex items-center gap-0.5 mb-0.5"
                  style={{ color: trendPct >= 0 ? '#22c55e' : '#FF6B5F' }}
                >
                  {trendPct >= 0
                    ? <TrendingUp size={14} />
                    : <TrendingDown size={14} />
                  }
                  <span className="text-sm font-bold">
                    {trendPct >= 0 ? '+' : ''}{trendPct}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wider">Período anterior</p>
            <p className="text-[#F7F7F7] font-bold text-xl mt-1">{prev.length}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wider">Média/semana</p>
            <p className="text-[#F7F7F7] font-bold text-xl mt-1">{weeklyAvg}</p>
          </div>
        </div>
      </GlassCard>

      {/* Session list */}
      <GlassCard>
        <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">
          Registros do período
        </p>
        {current.length === 0 ? (
          <p className="text-[#6F6F6F] text-sm text-center py-6">
            Nenhum atendimento neste período
          </p>
        ) : (
          current.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 py-3"
              style={{
                borderBottom: i < current.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: 'rgba(255,159,61,0.1)' }}
              >
                {SERVICE_ICONS[s.service_type] ?? '📷'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F7F7F7] text-sm font-medium truncate">{s.client}</p>
                <p className="text-[#6F6F6F] text-xs mt-0.5">{s.service_type}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#A8A8A8] text-xs">{formatSessionDate(s.date)}</p>
                <p className="text-[#6F6F6F] text-[10px] mt-0.5">{s.time}</p>
              </div>
            </div>
          ))
        )}
      </GlassCard>

      {/* Register button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/novo-registro')}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4"
        style={{
          background: 'linear-gradient(90deg, #FFD84A, #FF9F3D 40%, #FF6B5F 70%, #FF2F7D)',
        }}
      >
        <Plus size={18} color="#000" strokeWidth={2.5} />
        <span className="text-black font-bold">Registrar atendimento</span>
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
            <span
              className="text-[10px] px-2 py-0.5 rounded-xl font-medium"
              style={{ background: `${goal.color}22`, color: goal.color }}
            >
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
                    background: task.done
                      ? `linear-gradient(135deg, ${goal.color}, #FF2F7D)`
                      : 'rgba(255,255,255,0.08)',
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
  const sessions = mockPhotoSessions;

  // Sessions by month (last 6 months from Jun 2026)
  const byMonth = useMemo(() => {
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun'];
    const counts = [0, 0, 3, 6, 9, 6]; // derived from mock data
    return months.map((label, i) => ({ label, value: counts[i] }));
  }, []);

  // Peak hours — count sessions by hour bucket
  const peakHours = useMemo(() => {
    const buckets: Record<string, number> = {};
    sessions.forEach(s => {
      const h = parseInt(s.time.split(':')[0]);
      const label = `${h}h`;
      buckets[label] = (buckets[label] ?? 0) + 1;
    });
    return Object.entries(buckets)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [sessions]);

  // Busiest days of week
  const byDayOfWeek = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    sessions.forEach(s => {
      const dow = new Date(s.date).getDay();
      counts[dow]++;
    });
    return days.map((label, i) => ({ label, count: counts[i] }));
  }, [sessions]);

  const maxHour = Math.max(...peakHours.map(h => h.count));
  const maxDay = Math.max(...byDayOfWeek.map(d => d.count));

  const topHour = peakHours.reduce((a, b) => (a.count > b.count ? a : b), peakHours[0]);
  const topDay = byDayOfWeek.reduce((a, b) => (a.count > b.count ? a : b), byDayOfWeek[0]);
  const totalSessions = sessions.length;
  const lastMonthCount = byMonth[byMonth.length - 1].value;
  const prevMonthCount = byMonth[byMonth.length - 2].value;
  const monthTrend = prevMonthCount > 0
    ? Math.round(((lastMonthCount - prevMonthCount) / prevMonthCount) * 100)
    : 0;

  const insights = [
    {
      icon: '🕘',
      title: `Horário de pico: ${topHour?.label}`,
      desc: `Você é mais procurado às ${topHour?.label}. Reserve esta faixa para seus melhores clientes e evite outros compromissos neste horário.`,
      color: '#FF9F3D',
    },
    {
      icon: '📅',
      title: `Dia mais movimentado: ${topDay?.label}`,
      desc: `${topDay?.label} é seu dia mais procurado (${topDay?.count} sessões). Garanta disponibilidade neste dia toda semana.`,
      color: '#FFD84A',
    },
    {
      icon: monthTrend >= 0 ? '📈' : '📉',
      title: monthTrend >= 0 ? 'Crescimento em alta' : 'Volume caindo',
      desc: `Este mês você tem ${lastMonthCount} sessões registradas — ${Math.abs(monthTrend)}% ${monthTrend >= 0 ? 'acima' : 'abaixo'} do mês anterior (${prevMonthCount} sessões).`,
      color: monthTrend >= 0 ? '#22c55e' : '#FF6B5F',
    },
    {
      icon: '💡',
      title: 'Dica de agenda',
      desc: `Você fez ${totalSessions} atendimentos nos últimos 90 dias. Para crescer, considere abrir 2 horários extras por semana nas manhãs de sábado.`,
      color: '#FF6B5F',
    },
    {
      icon: '✈️',
      title: 'Meta Europa',
      desc: `Com ${lastMonthCount} sessões/mês e crescimento consistente, você está no caminho certo para alcançar seus objetivos profissionais na Europa.`,
      color: '#FF2F7D',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Session trend chart */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,159,61,0.15)' }}
          >
            <TrendingUp size={15} color="#FF9F3D" />
          </div>
          <div>
            <p className="text-[#F7F7F7] font-semibold text-sm">Sessões por mês</p>
            <p className="text-[#6F6F6F] text-xs">Evolução dos últimos 6 meses</p>
          </div>
        </div>
        <div className="flex items-end gap-2 h-20">
          {byMonth.map((m, i) => {
            const h = byMonth[byMonth.length - 1].value > 0
              ? Math.max(8, Math.round((m.value / Math.max(...byMonth.map(x => x.value))) * 100))
              : 8;
            const isLast = i === byMonth.length - 1;
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative" style={{ height: 64 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: m.value > 0 ? `${h}%` : '8%' }}
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

      {/* Peak hours */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 16 }}>🕘</span>
          <p className="text-[#F7F7F7] font-semibold text-sm">Horários de pico</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {peakHours.map(h => (
            <div key={h.label} className="flex items-center gap-3">
              <span className="text-[#A8A8A8] text-xs w-8 text-right">{h.label}</span>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(6, Math.round((h.count / maxHour) * 100))}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full flex items-center justify-end pr-2"
                  style={{
                    background: h.count === maxHour
                      ? 'linear-gradient(90deg, #FF9F3D99, #FF9F3D)'
                      : 'rgba(255,255,255,0.12)',
                    boxShadow: h.count === maxHour ? '0 0 8px #FF9F3D60' : 'none',
                  }}
                >
                  <span className="text-[9px] font-bold" style={{ color: h.count === maxHour ? '#000' : '#6F6F6F' }}>
                    {h.count}
                  </span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Busiest days */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 16 }}>📅</span>
          <p className="text-[#F7F7F7] font-semibold text-sm">Dias mais movimentados</p>
        </div>
        <div className="flex items-end gap-2 h-16">
          {byDayOfWeek.map(d => {
            const h = maxDay > 0 ? Math.max(8, Math.round((d.count / maxDay) * 100)) : 8;
            const isTop = d.count === maxDay && d.count > 0;
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: 48 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: d.count > 0 ? `${h}%` : '6%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 rounded-t-md"
                    style={{
                      background: isTop
                        ? 'linear-gradient(180deg, #FFD84A, #FF2F7D)'
                        : 'rgba(255,255,255,0.09)',
                      boxShadow: isTop ? '0 0 10px #FF9F3D50' : 'none',
                    }}
                  />
                </div>
                <span className="text-[9px]" style={{ color: isTop ? '#FF9F3D' : '#6F6F6F' }}>
                  {d.label}
                </span>
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
              <p className="font-semibold text-sm mb-0.5" style={{ color: insight.color }}>
                {insight.title}
              </p>
              <p className="text-[#A8A8A8] text-xs leading-relaxed">{insight.desc}</p>
            </div>
          </div>
        </GlassCard>
      ))}
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

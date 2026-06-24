import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Sparkles, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Chip } from '../components/Chip';
import { mockPhotoSessions } from '../data/mockData';
import type { PhotoSession } from '../lib/types';

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

  const todayMs = Date.now();
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

function MetasTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Target size={32} color="#FF9F3D" />
      <p className="text-[#6F6F6F] text-sm text-center px-6">
        Nenhuma meta de trabalho cadastrada ainda.
      </p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl"
        style={{ background: 'rgba(255,159,61,0.12)', border: '1px dashed rgba(255,159,61,0.35)' }}
      >
        <Plus size={16} color="#FF9F3D" />
        <span className="text-[#FF9F3D] text-sm font-semibold">Nova meta</span>
      </motion.button>
    </div>
  );
}

// ─── AI Analysis tab ──────────────────────────────────────────────────────────

function AIAnalysisTab() {
  const sessions = mockPhotoSessions;

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span style={{ fontSize: 32 }}>📊</span>
        <p className="text-[#F7F7F7] font-semibold text-base text-center">Sem dados suficientes</p>
        <p className="text-[#6F6F6F] text-sm text-center px-6">
          Registre atendimentos para ver análises e insights aqui.
        </p>
      </div>
    );
  }

  // Sessions by month (last 6 months)
  const byMonth = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('pt-BR', { month: 'short' });
      const value = sessions.filter(s => {
        const sd = new Date(s.date);
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
      }).length;
      return { label, value };
    });
  }, [sessions]);

  // Peak hours
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

  const maxHour = peakHours.length > 0 ? Math.max(...peakHours.map(h => h.count)) : 1;
  const maxDay = Math.max(...byDayOfWeek.map(d => d.count), 1);

  const topHour = peakHours.length > 0
    ? peakHours.reduce((a, b) => (a.count > b.count ? a : b))
    : null;
  const topDay = byDayOfWeek.reduce((a, b) => (a.count > b.count ? a : b));
  const totalSessions = sessions.length;
  const lastMonthCount = byMonth[byMonth.length - 1].value;
  const prevMonthCount = byMonth[byMonth.length - 2].value;
  const monthTrend = prevMonthCount > 0
    ? Math.round(((lastMonthCount - prevMonthCount) / prevMonthCount) * 100)
    : 0;

  const insights = [
    topHour && {
      icon: '🕘',
      title: `Horário de pico: ${topHour.label}`,
      desc: `Você é mais procurado às ${topHour.label}. Reserve esta faixa para seus melhores clientes.`,
      color: '#FF9F3D',
    },
    {
      icon: '📅',
      title: `Dia mais movimentado: ${topDay.label}`,
      desc: `${topDay.label} é seu dia mais procurado (${topDay.count} sessões).`,
      color: '#FFD84A',
    },
    {
      icon: monthTrend >= 0 ? '📈' : '📉',
      title: monthTrend >= 0 ? 'Crescimento em alta' : 'Volume caindo',
      desc: `Este mês você tem ${lastMonthCount} sessões — ${Math.abs(monthTrend)}% ${monthTrend >= 0 ? 'acima' : 'abaixo'} do mês anterior.`,
      color: monthTrend >= 0 ? '#22c55e' : '#FF6B5F',
    },
    {
      icon: '💡',
      title: 'Dica de agenda',
      desc: `Você fez ${totalSessions} atendimentos registrados. Para crescer, considere abrir horários extras nas manhãs de sábado.`,
      color: '#FF6B5F',
    },
  ].filter(Boolean) as { icon: string; title: string; desc: string; color: string }[];

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
            const maxVal = Math.max(...byMonth.map(x => x.value), 1);
            const h = Math.max(8, Math.round((m.value / maxVal) * 100));
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
      {peakHours.length > 0 && (
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
      )}

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

  const tabContent = {
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

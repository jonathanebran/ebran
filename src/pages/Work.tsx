import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Sparkles, TrendingUp, TrendingDown, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Chip } from '../components/Chip';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWork } from '../contexts/WorkContext';
import { useFinance } from '../contexts/FinanceContext';
import { useActivity } from '../contexts/ActivityContext';
import { formatCurrency } from '../lib/utils';
import type { PhotoSession, PaymentMethod } from '../lib/types';

// ─── Helpers ───────────────────────────────────────────────────────────

function formatSessionDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  'Outro': '📷',
};

const SERVICE_OPTIONS = Object.keys(SERVICE_ICONS).map(s => ({ value: s, label: s }));
const PAYMENT_OPTIONS = [
  { value: 'pix', label: 'Pix' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'transfer', label: 'Transferência' },
];

// ─── Add session sheet ──────────────────────────────────────────────────

function AddSessionSheet({ onClose }: { onClose: () => void }) {
  const { addSession } = useWork();
  const { addRecord } = useFinance();
  const { log } = useActivity();
  const [client, setClient] = useState('');
  const [service, setService] = useState('Ensaio Retrato');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(localToday());
  const [time, setTime] = useState('');
  const [payment, setPayment] = useState('pix');

  function save() {
    const value = parseFloat(amount.replace(',', '.')) || 0;
    const now = new Date().toISOString();
    const id = `sess-${Date.now()}`;
    addSession({
      id, user_id: 'user-1', client: client || 'Cliente', service_type: service,
      amount: value, payment_method: payment as PaymentMethod,
      date, time: time || '09:00', created_at: now,
    });
    // Também vira faturamento em Finanças (categoria trabalho).
    if (value > 0) {
      addRecord({
        id: `fin-${id}`, user_id: 'user-1', type: 'income',
        description: `${service}${client ? ` — ${client}` : ''}`, amount: value,
        category: 'work', payment_method: payment as PaymentMethod,
        date, status: 'confirmed', created_at: now,
      });
    }
    log('income', `Atendimento: ${client || service}`, value > 0 ? formatCurrency(value) : undefined);
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-3xl px-5 pt-4 pb-8"
        style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 430 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#F7F7F7] font-bold text-lg">Novo atendimento</h2>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}><X size={20} color="#A8A8A8" /></motion.button>
        </div>
        <div className="flex flex-col gap-3">
          <TextField label="Cliente" value={client} onChange={setClient} placeholder="Nome do cliente" />
          <SelectField label="Tipo de serviço" value={service} onChange={setService} options={SERVICE_OPTIONS} />
          <TextField label="Valor (R$)" value={amount} onChange={setAmount} type="number" placeholder="0,00" />
          <div className="flex gap-3">
            <div className="flex-1"><TextField label="Data" value={date} onChange={setDate} type="date" /></div>
            <div className="flex-1"><TextField label="Hora" value={time} onChange={setTime} type="time" /></div>
          </div>
          <SelectField label="Pagamento" value={payment} onChange={setPayment} options={PAYMENT_OPTIONS} />
          <PrimaryButton fullWidth onClick={save}>Salvar atendimento</PrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Atendimentos tab ───────────────────────────────────────────────────

function AtendimentosTab({ onAdd }: { onAdd: () => void }) {
  const { sessions } = useWork();
  const [period, setPeriod] = useState<30 | 60 | 90>(30);
  const [todayMs] = useState(() => Date.now());

  const current = useMemo(() => {
    const startMs = todayMs - period * 86_400_000;
    return getSessionsInRange(sessions, startMs, todayMs)
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  }, [sessions, period, todayMs]);

  const prev = useMemo(() => {
    const startMs = todayMs - period * 86_400_000;
    const prevStartMs = startMs - period * 86_400_000;
    return getSessionsInRange(sessions, prevStartMs, startMs);
  }, [sessions, period, todayMs]);

  const revenue = current.reduce((s, x) => s + (x.amount ?? 0), 0);
  const trendPct = prev.length > 0 ? Math.round(((current.length - prev.length) / prev.length) * 100) : 0;
  const weeklyAvg = (current.length / (period / 7)).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {([30, 60, 90] as const).map(p => (
          <motion.button
            key={p} whileTap={{ scale: 0.95 }} onClick={() => setPeriod(p)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
            style={{
              background: period === p ? 'rgba(var(--color-accent-rgb),0.18)' : 'rgba(255,255,255,0.05)',
              color: period === p ? 'var(--color-accent)' : '#6F6F6F',
              border: period === p ? '0.5px solid rgba(var(--color-accent-rgb),0.35)' : '0.5px solid rgba(255,255,255,0.06)',
            }}
          >
            {p} dias
          </motion.button>
        ))}
      </div>

      <GlassCard>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-accent-rgb),0.15)' }}>
            <Camera size={22} color="var(--color-accent)" />
          </div>
          <div>
            <p className="text-[#A8A8A8] text-xs">Atendimentos — últimos {period} dias</p>
            <div className="flex items-end gap-2 mt-0.5">
              <p className="text-[#F7F7F7] font-bold text-3xl leading-none">{current.length}</p>
              {prev.length > 0 && (
                <div className="flex items-center gap-0.5 mb-0.5" style={{ color: trendPct >= 0 ? '#22c55e' : 'var(--color-danger)' }}>
                  {trendPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-sm font-bold">{trendPct >= 0 ? '+' : ''}{trendPct}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wider">Faturamento</p>
            <p className="text-[#22c55e] font-bold text-base mt-1">{formatCurrency(revenue)}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wider">Anterior</p>
            <p className="text-[#F7F7F7] font-bold text-base mt-1">{prev.length}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[#6F6F6F] text-[10px] uppercase tracking-wider">Média/sem</p>
            <p className="text-[#F7F7F7] font-bold text-base mt-1">{weeklyAvg}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Registros do período</p>
        {current.length === 0 ? (
          <p className="text-[#6F6F6F] text-sm text-center py-6">Nenhum atendimento neste período</p>
        ) : (
          current.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i < current.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base" style={{ background: 'rgba(var(--color-accent-rgb),0.1)' }}>
                {SERVICE_ICONS[s.service_type] ?? '📷'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F7F7F7] text-sm font-medium truncate">{s.client}</p>
                <p className="text-[#6F6F6F] text-xs mt-0.5">{s.service_type}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {s.amount ? <p className="text-[#22c55e] text-sm font-bold">{formatCurrency(s.amount)}</p> : null}
                <p className="text-[#6F6F6F] text-[10px] mt-0.5">{formatSessionDate(s.date)} · {s.time}</p>
              </div>
            </div>
          ))
        )}
      </GlassCard>

      <motion.button
        whileTap={{ scale: 0.96 }} onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4"
        style={{ background: 'linear-gradient(90deg, var(--color-start), var(--color-accent) 40%, var(--color-mid) 70%, var(--color-end))' }}
      >
        <Plus size={18} color="var(--color-on-gradient)" strokeWidth={2.5} />
        <span className="font-bold" style={{ color: 'var(--color-on-gradient)' }}>Registrar atendimento</span>
      </motion.button>
    </div>
  );
}

// ─── Work Goals tab ─────────────────────────────────────────────────────

function MetasTab() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Target size={32} color="var(--color-accent)" />
      <p className="text-[#6F6F6F] text-sm text-center px-6">Suas metas de trabalho ficam junto das metas gerais.</p>
      <motion.button
        whileTap={{ scale: 0.95 }} onClick={() => navigate('/metas')}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl"
        style={{ background: 'rgba(var(--color-accent-rgb),0.12)', border: '1px dashed rgba(var(--color-accent-rgb),0.35)' }}
      >
        <Plus size={16} color="var(--color-accent)" />
        <span className="text-[var(--color-accent)] text-sm font-semibold">Ir para Metas</span>
      </motion.button>
    </div>
  );
}

// ─── AI Analysis tab ────────────────────────────────────────────────────

function AIAnalysisTab() {
  const { sessions } = useWork();

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

  const peakHours = useMemo(() => {
    const buckets: Record<string, number> = {};
    sessions.forEach(s => {
      const h = parseInt(s.time.split(':')[0]);
      const label = `${h}h`;
      buckets[label] = (buckets[label] ?? 0) + 1;
    });
    return Object.entries(buckets).map(([label, count]) => ({ label, count })).sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [sessions]);

  const byDayOfWeek = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    sessions.forEach(s => { counts[new Date(s.date).getDay()]++; });
    return days.map((label, i) => ({ label, count: counts[i] }));
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span style={{ fontSize: 32 }}>📊</span>
        <p className="text-[#F7F7F7] font-semibold text-base text-center">Sem dados suficientes</p>
        <p className="text-[#6F6F6F] text-sm text-center px-6">Registre atendimentos para ver análises e insights aqui.</p>
      </div>
    );
  }

  const maxHour = peakHours.length > 0 ? Math.max(...peakHours.map(h => h.count)) : 1;
  const maxDay = Math.max(...byDayOfWeek.map(d => d.count), 1);
  const topHour = peakHours.length > 0 ? peakHours.reduce((a, b) => (a.count > b.count ? a : b)) : null;
  const topDay = byDayOfWeek.reduce((a, b) => (a.count > b.count ? a : b));
  const totalSessions = sessions.length;
  const lastMonthCount = byMonth[byMonth.length - 1].value;
  const prevMonthCount = byMonth[byMonth.length - 2].value;
  const monthTrend = prevMonthCount > 0 ? Math.round(((lastMonthCount - prevMonthCount) / prevMonthCount) * 100) : 0;

  const insights = [
    topHour && { icon: '🕘', title: `Horário de pico: ${topHour.label}`, desc: `Você é mais procurado às ${topHour.label}. Reserve esta faixa para seus melhores clientes.`, color: 'var(--color-accent)' },
    { icon: '📅', title: `Dia mais movimentado: ${topDay.label}`, desc: `${topDay.label} é seu dia mais procurado (${topDay.count} sessões).`, color: 'var(--color-start)' },
    { icon: monthTrend >= 0 ? '📈' : '📉', title: monthTrend >= 0 ? 'Crescimento em alta' : 'Volume caindo', desc: `Este mês você tem ${lastMonthCount} sessões — ${Math.abs(monthTrend)}% ${monthTrend >= 0 ? 'acima' : 'abaixo'} do mês anterior.`, color: monthTrend >= 0 ? '#22c55e' : 'var(--color-danger)' },
    { icon: '💡', title: 'Dica de agenda', desc: `Você tem ${totalSessions} atendimentos registrados. Para crescer, considere abrir horários extras nas manhãs de sábado.`, color: 'var(--color-danger)' },
  ].filter(Boolean) as { icon: string; title: string; desc: string; color: string }[];

  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--color-accent-rgb),0.15)' }}>
            <TrendingUp size={15} color="var(--color-accent)" />
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
                    initial={{ height: 0 }} animate={{ height: m.value > 0 ? `${h}%` : '8%' }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 rounded-t-lg"
                    style={{ background: isLast ? 'linear-gradient(180deg, var(--color-start), var(--color-accent))' : 'rgba(255,255,255,0.1)', boxShadow: isLast ? '0 0 12px rgba(var(--color-accent-rgb), 0.38)' : 'none' }}
                  />
                </div>
                <span className="text-[9px] text-[#6F6F6F]">{m.label}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {peakHours.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3"><span style={{ fontSize: 16 }}>🕘</span><p className="text-[#F7F7F7] font-semibold text-sm">Horários de pico</p></div>
          <div className="flex flex-col gap-2.5">
            {peakHours.map(h => (
              <div key={h.label} className="flex items-center gap-3">
                <span className="text-[#A8A8A8] text-xs w-8 text-right">{h.label}</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${Math.max(6, Math.round((h.count / maxHour) * 100))}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ background: h.count === maxHour ? 'linear-gradient(90deg, rgba(var(--color-accent-rgb), 0.6), var(--color-accent))' : 'rgba(255,255,255,0.12)', boxShadow: h.count === maxHour ? '0 0 8px rgba(var(--color-accent-rgb), 0.38)' : 'none' }}
                  >
                    <span className="text-[9px] font-bold" style={{ color: h.count === maxHour ? '#000' : '#6F6F6F' }}>{h.count}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="flex items-center gap-2 mb-3"><span style={{ fontSize: 16 }}>📅</span><p className="text-[#F7F7F7] font-semibold text-sm">Dias mais movimentados</p></div>
        <div className="flex items-end gap-2 h-16">
          {byDayOfWeek.map(d => {
            const h = maxDay > 0 ? Math.max(8, Math.round((d.count / maxDay) * 100)) : 8;
            const isTop = d.count === maxDay && d.count > 0;
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: 48 }}>
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: d.count > 0 ? `${h}%` : '6%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 rounded-t-md"
                    style={{ background: isTop ? 'linear-gradient(180deg, var(--color-start), var(--color-end))' : 'rgba(255,255,255,0.09)', boxShadow: isTop ? '0 0 10px rgba(var(--color-accent-rgb), 0.31)' : 'none' }}
                  />
                </div>
                <span className="text-[9px]" style={{ color: isTop ? 'var(--color-accent)' : '#6F6F6F' }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="flex items-center gap-2 mt-1 mb-1">
        <Sparkles size={14} color="var(--color-start)" />
        <span className="text-[#A8A8A8] text-xs font-medium">Insights</span>
      </div>
      {insights.map(insight => (
        <GlassCard key={insight.title} padding="p-4">
          <div className="flex gap-3">
            <span style={{ fontSize: 22, lineHeight: 1 }}>{insight.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-0.5" style={{ color: insight.color }}>{insight.title}</p>
              <p className="text-[#A8A8A8] text-xs leading-relaxed">{insight.desc}</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────

const tabs = ['Atendimentos', 'Metas', 'Análise'] as const;
type Tab = typeof tabs[number];

export function Work() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Atendimentos');
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <span className="text-[#F7F7F7] text-xl">‹</span>
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7] flex-1">Trabalho</h1>
        <motion.button
          whileTap={{ scale: 0.9 }} onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--color-start), var(--color-end))' }}
        >
          <Plus size={18} color="var(--color-on-gradient)" />
        </motion.button>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5">
        {activeTab === 'Atendimentos' && <AtendimentosTab onAdd={() => setShowAdd(true)} />}
        {activeTab === 'Metas' && <MetasTab />}
        {activeTab === 'Análise' && <AIAnalysisTab />}
      </div>

      <AnimatePresence>
        {showAdd && <AddSessionSheet onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}

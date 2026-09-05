import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Send, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { classifyAICommand } from '../lib/aiClassifier';
import { useGoals } from '../contexts/GoalsContext';
import { useDailyFocus } from '../contexts/DailyFocusContext';
import { useHealth } from '../contexts/HealthContext';
import { useFinance } from '../contexts/FinanceContext';
import type { Goal, DailyFocusItem, Appointment, GoalType, FinanceRecord, FinanceCategory, PaymentMethod } from '../lib/types';

const quickExamples = [
  'Recebi R$ 500 via Pix hoje',
  'Adiciona frango e ovos ao mercado',
  'Quero fazer botox em 3 meses, ~R$ 900',
  'Tenho psicóloga quinta às 15h',
  'Paguei R$ 300 no dermatologista',
];

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  result?: ReturnType<typeof classifyAICommand>;
}

const DESTINATION_ROUTES: Record<string, string> = {
  finance:        '/financas',
  goals:          '/metas',
  daily_focus:    '/foco',
  health:         '/saude',
  work:           '/trabalho',
  work_and_goals: '/trabalho',
  ai_hub:         '/ai-hub',
};

const ACTION_ROUTES: Record<string, string> = {
  'Ir para Finanças':    '/financas',
  'Ir para Metas':       '/metas',
  'Ir para Foco diário': '/foco',
  'Ir para Saúde':       '/saude',
  'Ir para Trabalho':    '/trabalho',
};

// Ações que o assistente sabe EXECUTAR de verdade (criam dados).
const EXECUTABLE_ACTIONS = new Set([
  'create_goal', 'add_items', 'create_appointment',
  'create_finance_record', 'create_work_record',
]);

// Data LOCAL (YYYY-MM-DD) — igual ao isoLocal usado na tela do Foco. Usar
// toISOString() (UTC) ancorava o item no dia errado à noite no Brasil.
function isoLocal(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
const todayIso = () => isoLocal(new Date());

const WEEKDAY_INDEX: Record<string, number> = {
  domingo: 0, segunda: 1, terça: 2, terca: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6, sabado: 6,
};

// Próxima data (local, YYYY-MM-DD) para um nome de dia da semana.
function nextWeekdayIso(dayName: string): string {
  const target = WEEKDAY_INDEX[dayName.toLowerCase()];
  const d = new Date();
  if (target == null) return todayIso();
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return isoLocal(d);
}

export function AIHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'ai',
      content: 'Olá! Sou o seu assistente pessoal do Ebran. Diga o que quer organizar, registrar ou planejar — em texto livre. Voz e imagem em breve. 🔮',
    },
  ]);

  const { addGoal } = useGoals();
  const { addItem } = useDailyFocus();
  const { data: health, update: updateHealth } = useHealth();
  const { addRecord: addFinance } = useFinance();
  const [executed, setExecuted] = useState<Set<string>>(new Set());

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), type: 'user', content: text };
    const result = classifyAICommand(text);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `Entendido! Detectei: **${result.intent.replace(/_/g, ' ')}**. Aqui estão as ações sugeridas:`,
      result,
    };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  // Executa de verdade a ação sugerida, criando os dados nos contextos.
  const execute = (msgId: string, result: ReturnType<typeof classifyAICommand>) => {
    const now = new Date().toISOString();
    const d = (result.extractedData ?? {}) as Record<string, unknown>;
    let feedback = 'Feito! ✅';
    let route: string | null = null;

    if (result.action === 'create_goal') {
      const title = (d.title as string) || 'Nova meta';
      const goal: Goal = {
        id: `goal-${Date.now()}`, user_id: 'user-1', title,
        type: ((d.type as GoalType) || 'financial'), category: '',
        target_amount: (d.target_amount as number) || 0, current_amount: 0, reserved_amount: 0,
        desired_date: (d.deadline as string) || undefined,
        recurrence: 'monthly', priority: 'medium', status: 'active',
        tags: [], created_at: now, updated_at: now,
      };
      addGoal(goal);
      feedback = `Meta "${title}" criada! ✅`; route = '/metas';
    } else if (result.action === 'add_items') {
      const market = (d.marketItems as string[]) || [];
      const care = (d.careItems as string[]) || [];
      let i = 0;
      const mk = (name: string, category: DailyFocusItem['category'], rec: DailyFocusItem['recurrence']) => {
        addItem({
          id: `df-${Date.now()}-${i++}`, user_id: 'user-1', name,
          category, status: 'pending', priority: 'medium', recurrence: rec,
          date: todayIso(), created_at: now,
        });
      };
      market.forEach(n => mk(n, 'market', 'weekly'));
      care.forEach(n => mk(n, 'care', 'monthly'));
      const total = market.length + care.length;
      feedback = total ? `${total} item(ns) adicionado(s) ao Foco! ✅` : 'Nenhum item reconhecido.';
      route = total ? '/foco' : null;
    } else if (result.action === 'create_appointment') {
      const specialty = (d.specialty as string) || 'Consulta';
      const appt: Appointment = {
        id: `apt-${Date.now()}`, user_id: 'user-1', title: specialty, specialty,
        date: d.day ? nextWeekdayIso(d.day as string) : todayIso(),
        time: (d.time as string) || '', status: 'scheduled', created_at: now,
      };
      updateHealth({ appointments: [...health.appointments, appt] });
      feedback = `Consulta com ${specialty} agendada! ✅`; route = '/saude';
    } else if (result.action === 'create_finance_record') {
      const isIncome = (d.type as string) !== 'expense';
      const amount = (d.amount as number) || 0;
      const rec: FinanceRecord = {
        id: `fin-${Date.now()}`, user_id: 'user-1',
        type: isIncome ? 'income' : 'expense',
        description: (d.description as string) || (isIncome ? 'Entrada' : 'Despesa'),
        amount, category: ((d.category as FinanceCategory) || (isIncome ? 'work' : 'products')),
        payment_method: (d.method as string)?.toLowerCase() as PaymentMethod | undefined,
        date: todayIso(), status: 'confirmed', created_at: now,
      };
      addFinance(rec);
      feedback = `${isIncome ? 'Entrada' : 'Despesa'} de R$ ${amount} registrada em Finanças! ✅`; route = '/financas';
    } else if (result.action === 'create_work_record') {
      const amount = (d.amount as number) || 0;
      addFinance({
        id: `fin-${Date.now()}`, user_id: 'user-1', type: 'income',
        description: (d.description as string) || 'Trabalho', amount, category: 'work',
        date: todayIso(), status: 'confirmed', created_at: now,
      });
      feedback = `Registro de R$ ${amount} em Trabalho salvo! ✅`; route = '/financas';
    } else {
      feedback = 'Abrindo a página… 👇';
      route = DESTINATION_ROUTES[result.suggestedDestination] ?? null;
    }

    setExecuted(prev => new Set(prev).add(msgId));
    setMessages(prev => [...prev, { id: `${Date.now()}-ok`, type: 'ai', content: feedback }]);
    if (route) setTimeout(() => navigate(route!), 800);
  };

  // Se a Home mandou uma mensagem, processa automaticamente ao abrir.
  const handledRef = useRef(false);
  useEffect(() => {
    const incoming = (location.state as { message?: string } | null)?.message;
    if (incoming && !handledRef.current) {
      handledRef.current = true;
      send(incoming);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 flex-shrink-0">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <div className="flex items-center gap-2">
          <Sparkles size={18} color="var(--color-accent)" />
          <h1 className="text-xl font-bold text-[#F7F7F7]">Assistente pessoal</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'ai' && (
                <div className="max-w-[85%]">
                  <GlassCard padding="p-3.5">
                    <p className="text-[#F7F7F7] text-sm leading-relaxed">{msg.content}</p>
                    {msg.result && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        {msg.result.suggestedActions.filter(Boolean).map((action, i) => {
                          const dest = ACTION_ROUTES[action];
                          return dest ? (
                            <motion.button
                              key={i}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => navigate(dest)}
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-left w-full"
                              style={{ background: 'rgba(var(--color-accent-rgb),0.1)', border: '1px solid rgba(var(--color-accent-rgb),0.2)' }}
                            >
                              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
                              <p className="text-xs text-[var(--color-accent)] font-medium">{action}</p>
                            </motion.button>
                          ) : (
                            <div
                              key={i}
                              className="flex items-center gap-2 rounded-xl px-3 py-2"
                              style={{ background: 'rgba(var(--color-accent-rgb),0.06)' }}
                            >
                              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
                              <p className="text-xs text-[#A8A8A8]">{action}</p>
                            </div>
                          );
                        })}
                        {EXECUTABLE_ACTIONS.has(msg.result.action) && (
                          executed.has(msg.id) ? (
                            <div
                              className="mt-1 py-2 rounded-xl text-xs font-semibold text-center"
                              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                            >
                              Salvo ✅
                            </div>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => execute(msg.id, msg.result!)}
                              className="mt-1 py-2 rounded-xl text-xs font-semibold text-center"
                              style={{
                                background: 'linear-gradient(135deg, var(--color-start), var(--color-end))',
                                color: 'var(--color-on-gradient)',
                              }}
                            >
                              Confirmar e salvar
                            </motion.button>
                          )
                        )}
                      </div>
                    )}
                  </GlassCard>
                </div>
              )}
              {msg.type === 'user' && (
                <div
                  className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm"
                  style={{ background: 'rgba(var(--color-accent-rgb),0.15)', border: '1px solid rgba(var(--color-accent-rgb),0.2)' }}
                >
                  <p className="text-[#F7F7F7] text-sm">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Quick examples */}
        {messages.length < 3 && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-[#6F6F6F] text-xs">Tente dizer:</p>
            {quickExamples.map(ex => (
              <motion.button
                key={ex}
                whileTap={{ scale: 0.98 }}
                onClick={() => send(ex)}
                className="text-left px-3 py-2.5 rounded-xl text-xs"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#A8A8A8', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                "{ex}"
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{
          background: 'rgba(10,10,10,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Mic size={18} color="#6F6F6F" />
        </motion.button>
        <div className="flex-1 flex items-center rounded-2xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Digite uma ação..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: '#F7F7F7' }}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: input.trim()
              ? 'linear-gradient(135deg, var(--color-start), var(--color-end))'
              : 'rgba(255,255,255,0.06)',
          }}
        >
          <Send size={16} color={input.trim() ? '#000' : '#6F6F6F'} />
        </motion.button>
      </div>
    </div>
  );
}

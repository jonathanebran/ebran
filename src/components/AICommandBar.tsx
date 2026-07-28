import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ArrowRight, Check } from 'lucide-react';
import { classifyAICommand } from '../lib/aiClassifier';
import { useDailyFocus } from '../contexts/DailyFocusContext';
import type { DailyFocusItem } from '../lib/types';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';

interface AICommandBarProps {
  placeholder?: string;
  compact?: boolean;
}

type Classified = ReturnType<typeof classifyAICommand>;

// Rótulo em português para a intenção detectada.
const INTENT_LABEL: Record<string, string> = {
  register_income: 'Registrar entrada',
  create_goal: 'Criar meta',
  register_income_and_contribute_goal: 'Registrar entrada e aportar meta',
  add_items_to_focus: 'Adicionar itens ao foco',
  create_care_goal: 'Criar meta de cuidado',
  create_appointment: 'Agendar consulta',
  create_expense: 'Registrar despesa',
  register_work_record: 'Registrar atendimento',
  general_query: 'Escolher destino',
};

// Para onde cada intenção leva depois de confirmada.
const DESTINATION: Record<string, { route: string; label: string }> = {
  finance:        { route: '/financas',  label: 'Abrir Finanças' },
  goals:          { route: '/metas',     label: 'Abrir Metas' },
  daily_focus:    { route: '/foco',      label: 'Abrir Foco diário' },
  health:         { route: '/saude',     label: 'Abrir Saúde' },
  work:           { route: '/trabalho',  label: 'Abrir Trabalho' },
  work_and_goals: { route: '/trabalho',  label: 'Abrir Trabalho' },
  ai_hub:         { route: '/ai-hub',    label: 'Abrir assistente' },
};

// Alguns intents a barra consegue executar na hora, sem abrir outra tela.
function extractFocusItems(result: Classified): { name: string; category: DailyFocusItem['category'] }[] {
  const data = result.extractedData as { marketItems?: string[]; careItems?: string[] };
  const out: { name: string; category: DailyFocusItem['category'] }[] = [];
  (data.marketItems ?? []).forEach(n => out.push({ name: n, category: 'market' }));
  (data.careItems ?? []).forEach(n => out.push({ name: n, category: 'care' }));
  return out;
}

export function AICommandBar({ placeholder = 'O que você quer organizar agora? 🔮', compact = false }: AICommandBarProps) {
  const navigate = useNavigate();
  const { addItem } = useDailyFocus();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Classified | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setResult(classifyAICommand(input));
    setDone(null);
    setSheetOpen(true);
    setInput('');
  };

  const dest = result ? (DESTINATION[result.suggestedDestination] ?? DESTINATION.ai_hub) : null;
  const focusItems = result ? extractFocusItems(result) : [];

  // Ação principal: executa o que dá na hora, senão abre o módulo para concluir.
  const confirm = () => {
    if (!result) return;

    if (focusItems.length > 0) {
      focusItems.forEach((it, i) => addItem({
        id: `df-${Date.now()}-${i}`,
        user_id: 'user-1',
        name: it.name,
        category: it.category,
        status: 'pending',
        priority: 'medium',
        recurrence: 'once',
        created_at: new Date().toISOString(),
      }));
      setDone(`${focusItems.length} item(ns) adicionado(s) ao Foco diário`);
      setTimeout(() => { setSheetOpen(false); navigate('/foco'); }, 900);
      return;
    }

    setSheetOpen(false);
    if (dest) navigate(dest.route);
  };

  const primaryLabel = focusItems.length > 0
    ? `Adicionar ao Foco diário`
    : (dest?.label ?? 'Abrir');

  return (
    <>
      <div
        className="flex items-center gap-3 rounded-2xl px-4"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          height: compact ? 48 : 56,
        }}
      >
        <Sparkles size={18} style={{ flexShrink: 0, stroke: 'url(#ai-grad)' }} />
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-start)" />
              <stop offset="100%" stopColor="var(--color-end)" />
            </linearGradient>
          </defs>
        </svg>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: '#F7F7F7' }}
        />
        <AnimatePresence>
          {input.trim() && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleSubmit}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-start) 0%, var(--color-end) 100%)',
              }}
            >
              <Send size={14} color="var(--color-on-gradient)" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="IA interpretou">
        {result && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs text-[#A8A8A8] mb-1">Intenção detectada</p>
              <p className="text-[#F7F7F7] font-semibold">{INTENT_LABEL[result.intent] ?? result.intent.replace(/_/g, ' ')}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-[#A8A8A8] font-medium">O que vou fazer</p>
              {result.suggestedActions.filter(Boolean).map((action, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-end))' }}
                  />
                  <p className="text-sm text-[#F7F7F7]">{action}</p>
                </div>
              ))}
            </div>

            {done ? (
              <div
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
              >
                <Check size={16} /> {done}
              </div>
            ) : (
              <>
                <PrimaryButton fullWidth onClick={confirm}>
                  <span className="flex items-center gap-2">
                    {primaryLabel}
                    {focusItems.length > 0 ? <Check size={16} color="var(--color-on-gradient)" /> : <ArrowRight size={16} color="var(--color-on-gradient)" />}
                  </span>
                </PrimaryButton>
                {focusItems.length > 0 && dest && (
                  <button
                    onClick={() => { setSheetOpen(false); navigate(dest.route); }}
                    className="text-xs text-[#6F6F6F] text-center py-1"
                  >
                    Só abrir o Foco diário
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Plus, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { ChecklistItem } from '../components/ChecklistItem';
import { useDailyFocus } from '../contexts/DailyFocusContext';
import { logActivity } from '../lib/activityStore';
import type { DailyFocusItem } from '../lib/types';

const CATEGORY_BLOCKS = [
  { key: 'market',  label: 'Mercado', emoji: '🛒', match: ['market'] },
  { key: 'care',    label: 'Cuidado', emoji: '🧴', match: ['care'] },
  { key: 'home',    label: 'Casa',    emoji: '🏠', match: ['home'] },
  { key: 'workout', label: 'Treino',  emoji: '💪', match: ['workout'] },
  { key: 'task',    label: 'Tarefas', emoji: '✅', match: ['task', 'recurring'] },
] as const;

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const WEEKDAYS_LONG = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

function isoLocal(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const categoryOptions = [
  { value: 'market', label: 'Mercado' },
  { value: 'care', label: 'Cuidado' },
  { value: 'home', label: 'Casa' },
  { value: 'workout', label: 'Treino' },
  { value: 'task', label: 'Tarefa' },
] as const;

const recurrenceOptions = [
  { value: 'once', label: 'Só nesse dia' },
  { value: 'daily', label: 'Todo dia' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
] as const;

// ─── Swipe-to-delete ──────────────────────────────────────────────────────────

function SwipeToDelete({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-90, -15], [1, 0]);
  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -600) {
      animate(x, -500, { duration: 0.22, ease: 'easeOut', onComplete: onDelete });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 450, damping: 36 });
    }
  };
  return (
    <div className="relative overflow-hidden">
      <motion.div className="absolute inset-0 flex items-center justify-end pr-5" style={{ background: 'var(--color-danger)', opacity: deleteOpacity }}>
        <Trash2 size={15} color="#fff" />
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -300, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        dragMomentum={false}
        style={{ x, background: '#111', position: 'relative', zIndex: 1 }}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Add item sheet (com data) ────────────────────────────────────────────────

function AddItemSheet({ defaultDate, onClose, onSave }: {
  defaultDate: string;
  onClose: () => void;
  onSave: (item: Omit<DailyFocusItem, 'id' | 'user_id' | 'created_at'>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('task');
  const [recurrence, setRecurrence] = useState<string>('once');
  const [date, setDate] = useState<string>(defaultDate);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category: category as DailyFocusItem['category'],
      status: 'pending',
      priority: 'medium',
      recurrence: recurrence as DailyFocusItem['recurrence'],
      date,
    });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl p-6 overflow-y-auto"
        style={{ background: 'rgba(15,15,15,0.98)', border: '0.5px solid rgba(255,255,255,0.1)', paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))', maxHeight: '90vh' }}
        initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#F7F7F7] font-bold text-lg">Novo item</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}><X size={20} color="#6F6F6F" /></motion.button>
        </div>

        <input
          autoFocus type="text" placeholder="O que precisa fazer?"
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full rounded-2xl px-4 py-3.5 mb-4 text-[#F7F7F7] text-base font-medium outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        />

        <p className="text-[#6F6F6F] text-xs uppercase tracking-wider mb-2">Dia</p>
        <input
          type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full rounded-2xl px-4 py-3 mb-4 text-[#F7F7F7] text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
        />

        <p className="text-[#6F6F6F] text-xs uppercase tracking-wider mb-2">Categoria</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryOptions.map(opt => (
            <motion.button key={opt.value} whileTap={{ scale: 0.95 }} onClick={() => setCategory(opt.value)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{
                background: category === opt.value ? 'rgba(var(--color-accent-rgb),0.2)' : 'rgba(255,255,255,0.06)',
                color: category === opt.value ? 'var(--color-accent)' : '#A8A8A8',
                border: category === opt.value ? '0.5px solid rgba(var(--color-accent-rgb),0.4)' : '0.5px solid transparent',
              }}>
              {opt.label}
            </motion.button>
          ))}
        </div>

        <p className="text-[#6F6F6F] text-xs uppercase tracking-wider mb-2">Repetição</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {recurrenceOptions.map(opt => (
            <motion.button key={opt.value} whileTap={{ scale: 0.95 }} onClick={() => setRecurrence(opt.value)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{
                background: recurrence === opt.value ? 'rgba(var(--color-accent-rgb),0.2)' : 'rgba(255,255,255,0.06)',
                color: recurrence === opt.value ? 'var(--color-accent)' : '#A8A8A8',
                border: recurrence === opt.value ? '0.5px solid rgba(var(--color-accent-rgb),0.4)' : '0.5px solid transparent',
              }}>
              {opt.label}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={!name.trim()}
          className="w-full py-4 rounded-2xl font-bold text-base"
          style={{
            background: name.trim() ? 'linear-gradient(135deg, var(--color-start), var(--color-end))' : 'rgba(255,255,255,0.08)',
            color: name.trim() ? 'var(--color-on-gradient)' : '#6F6F6F',
          }}>
          Adicionar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────

type ViewMode = 'semana' | 'mes';

export function DailyFocus() {
  const { addItem, deleteItem, itemsForDate, isDone, toggleForDate } = useDailyFocus();

  const today = new Date();
  const [selected, setSelected] = useState<Date>(today);
  const [view, setView] = useState<ViewMode>('semana');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const selectedIso = isoLocal(selected);
  const dateLabel = `${WEEKDAYS_LONG[selected.getDay()]}, ${selected.getDate()} de ${MONTHS[selected.getMonth()]}`;

  // Dias exibidos na tira, conforme o modo. Semana = domingo→sábado.
  const stripDays = useMemo(() => {
    if (view === 'semana') {
      const start = new Date(selected);
      start.setDate(selected.getDate() - selected.getDay()); // domingo
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i); return d;
      });
    }
    const daysInMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => new Date(selected.getFullYear(), selected.getMonth(), i + 1));
  }, [view, selected]);

  const dayItems = itemsForDate(selectedIso);
  const pending = dayItems.filter(i => !isDone(i.id, selectedIso));
  const done = dayItems.filter(i => isDone(i.id, selectedIso));

  const handleAdd = (data: Omit<DailyFocusItem, 'id' | 'user_id' | 'created_at'>) => {
    addItem({ ...data, id: `df-${Date.now()}`, user_id: 'user-1', created_at: new Date().toISOString() });
  };

  const handleToggle = (item: DailyFocusItem) => {
    if (!isDone(item.id, selectedIso)) logActivity('focus', `Concluído: ${item.name}`);
    toggleForDate(item.id, selectedIso);
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F7F7F7]">Foco Diário</h1>
          <p className="text-[#6F6F6F] text-sm mt-1">{dateLabel}</p>
          <p className="text-[var(--color-accent)] text-xs mt-1 font-medium">{done.length}/{dayItems.length} concluídos</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddSheet(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: 'linear-gradient(135deg, var(--color-start), var(--color-end))' }}
        >
          <Plus size={20} color="var(--color-on-gradient)" />
        </motion.button>
      </div>

      {/* Alternador semana / mês */}
      <div className="flex gap-2 px-5 mt-4">
        {(['semana', 'mes'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold tap-scale"
            style={{
              background: view === v ? 'rgba(var(--color-accent-rgb),0.16)' : 'rgba(255,255,255,0.05)',
              color: view === v ? 'var(--color-accent)' : '#6F6F6F',
            }}
          >
            {v === 'semana' ? 'Semana' : 'Mês'}
          </button>
        ))}
      </div>

      {/* Tira de dias */}
      <div className="flex gap-2 px-5 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {stripDays.map(d => {
          const iso = isoLocal(d);
          const active = iso === selectedIso;
          const isTodayChip = iso === isoLocal(today);
          const count = itemsForDate(iso).length;
          return (
            <button
              key={iso}
              onClick={() => setSelected(d)}
              className="flex flex-col items-center justify-center rounded-2xl flex-shrink-0 tap-scale relative"
              style={{
                width: view === 'semana' ? 44 : 46, height: 60,
                background: active ? 'linear-gradient(135deg, var(--color-start), var(--color-end))' : 'rgba(255,255,255,0.04)',
              }}
            >
              <span className="text-[10px] font-medium" style={{ color: active ? 'var(--color-on-gradient)' : '#6F6F6F' }}>{WEEKDAYS[d.getDay()]}</span>
              <span className="text-lg font-bold" style={{ color: active ? 'var(--color-on-gradient)' : '#F7F7F7' }}>{d.getDate()}</span>
              {/* ponto do dia de hoje quando não selecionado */}
              {isTodayChip && !active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: 'var(--color-accent)' }} />
              )}
              {/* ponto discreto quando o dia tem itens e não está selecionado */}
              {!isTodayChip && !active && count > 0 && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {dayItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F6F6F] text-sm">Nada para {isoLocal(today) === selectedIso ? 'hoje' : 'este dia'} ainda.</p>
            <p className="text-[#3F3F3F] text-xs mt-1">Toque no + para adicionar.</p>
          </div>
        ) : (
          <>
            {CATEGORY_BLOCKS.map(block => {
              const blockPending = pending.filter(i => (block.match as readonly string[]).includes(i.category));
              if (blockPending.length === 0) return null;
              return (
                <div key={block.key}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span style={{ fontSize: 14 }}>{block.emoji}</span>
                    <span className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider">{block.label}</span>
                    <span className="text-[#3F3F3F] text-xs">{blockPending.length}</span>
                  </div>
                  <GlassCard padding="py-1">
                    {blockPending.map(item => (
                      <SwipeToDelete key={item.id} onDelete={() => deleteItem(item.id)}>
                        <div className="px-4">
                          <ChecklistItem item={item} done={false} onToggle={() => handleToggle(item)} />
                        </div>
                      </SwipeToDelete>
                    ))}
                  </GlassCard>
                </div>
              );
            })}

            {pending.length === 0 && done.length > 0 && (
              <div className="text-center py-6">
                <p className="text-[#22c55e] text-sm font-medium">Tudo concluído! 🎉</p>
              </div>
            )}

            {done.length > 0 && (
              <div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowDone(s => !s)} className="flex items-center gap-2 py-2 w-full">
                  {showDone ? <ChevronUp size={14} color="#6F6F6F" /> : <ChevronDown size={14} color="#6F6F6F" />}
                  <span className="text-[#6F6F6F] text-xs">{done.length} {done.length === 1 ? 'concluído' : 'concluídos'}</span>
                </motion.button>
                <AnimatePresence>
                  {showDone && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                      <GlassCard padding="py-1">
                        {done.map(item => (
                          <div key={item.id} className="px-4">
                            <ChecklistItem item={item} done={true} onToggle={() => handleToggle(item)} />
                          </div>
                        ))}
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showAddSheet && (
          <AddItemSheet defaultDate={selectedIso} onClose={() => setShowAddSheet(false)} onSave={handleAdd} />
        )}
      </AnimatePresence>
    </div>
  );
}

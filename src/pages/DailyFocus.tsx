import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Plus, RefreshCw, ChevronDown, ChevronUp, X, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { ChecklistItem } from '../components/ChecklistItem';
import { useDailyFocus } from '../contexts/DailyFocusContext';
import type { DailyFocusItem } from '../lib/types';

// As tarefas do dia são separadas por categoria em blocos, em vez de abas.
// 'recurring' cai em Tarefas junto com 'task'.
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

const categoryOptions = [
  { value: 'market', label: 'Mercado' },
  { value: 'care', label: 'Cuidado' },
  { value: 'home', label: 'Casa' },
  { value: 'workout', label: 'Treino' },
  { value: 'task', label: 'Tarefa' },
] as const;

const recurrenceOptions = [
  { value: 'once', label: 'Única' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: '15 dias' },
  { value: 'monthly', label: 'Mensal' },
] as const;

function nextRestockDate(recurrence: string): string {
  const d = new Date();
  if (recurrence === 'daily') d.setDate(d.getDate() + 1);
  else if (recurrence === 'weekly') d.setDate(d.getDate() + 7);
  else if (recurrence === 'biweekly') d.setDate(d.getDate() + 15);
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
  const [, m, day] = d.toISOString().split('T')[0].split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}

// ─── Swipe-to-delete row wrapper ─────────────────────────────────────────────

function SwipeToDelete({ children, onDelete }: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-90, -15], [1, 0]);

  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -600) {
      animate(x, -500, {
        duration: 0.22,
        ease: 'easeOut',
        onComplete: onDelete,
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 450, damping: 36 });
    }
  };

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-5"
        style={{ background: 'var(--color-danger)', opacity: deleteOpacity }}
      >
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

// ─── Bottom sheet: Add item ───────────────────────────────────────────────────

function AddItemSheet({ onClose, onSave }: {
  onClose: () => void;
  onSave: (item: Omit<DailyFocusItem, 'id' | 'user_id' | 'created_at'>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('market');
  const [recurrence, setRecurrence] = useState<string>('once');
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category: category as DailyFocusItem['category'],
      status: 'pending',
      priority: 'medium',
      recurrence: recurrence as DailyFocusItem['recurrence'],
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl p-6 overflow-y-auto"
        style={{
          background: 'rgba(15,15,15,0.98)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))',
          maxHeight: '90vh',
        }}
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#F7F7F7] font-bold text-lg">Novo item</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
            <X size={20} color="#6F6F6F" />
          </motion.button>
        </div>

        <input
          autoFocus
          type="text"
          placeholder="Nome do item..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full rounded-2xl px-4 py-3.5 mb-4 text-[#F7F7F7] text-base font-medium outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        />

        <p className="text-[#6F6F6F] text-xs uppercase tracking-wider mb-2">Categoria</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryOptions.map(opt => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(opt.value)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{
                background: category === opt.value ? 'rgba(var(--color-accent-rgb),0.2)' : 'rgba(255,255,255,0.06)',
                color: category === opt.value ? 'var(--color-accent)' : '#A8A8A8',
                border: category === opt.value ? '0.5px solid rgba(var(--color-accent-rgb),0.4)' : '0.5px solid transparent',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        <p className="text-[#6F6F6F] text-xs uppercase tracking-wider mb-2">Repetição</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {recurrenceOptions.map(opt => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRecurrence(opt.value)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{
                background: recurrence === opt.value ? 'rgba(var(--color-accent-rgb),0.2)' : 'rgba(255,255,255,0.06)',
                color: recurrence === opt.value ? 'var(--color-accent)' : '#A8A8A8',
                border: recurrence === opt.value ? '0.5px solid rgba(var(--color-accent-rgb),0.4)' : '0.5px solid transparent',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Observações (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full rounded-2xl px-4 py-3 mb-5 text-[#F7F7F7] text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl font-bold text-base"
          style={{
            background: name.trim()
              ? 'linear-gradient(90deg, var(--color-start), var(--color-accent) 40%, var(--color-mid) 70%, var(--color-end))'
              : 'rgba(255,255,255,0.08)',
            color: name.trim() ? '#000' : '#6F6F6F',
          }}
        >
          Adicionar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Bottom sheet: Restock prompt ─────────────────────────────────────────────

function RestockPrompt({ item, onConfirm, onDismiss }: {
  item: DailyFocusItem;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const recLabel = item.recurrence === 'daily' ? 'amanhã'
    : item.recurrence === 'weekly' ? 'em 7 dias'
    : item.recurrence === 'biweekly' ? 'em 15 dias'
    : item.recurrence === 'monthly' ? 'em 30 dias'
    : '';

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onDismiss}
    >
      <motion.div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl p-6"
        style={{
          background: 'rgba(15,15,15,0.98)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))',
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(var(--color-accent-rgb),0.15)' }}>
            <RefreshCw size={20} color="var(--color-accent)" />
          </div>
          <h3 className="text-[#F7F7F7] font-bold text-base">{item.name} concluído!</h3>
          <p className="text-[#A8A8A8] text-sm mt-1">
            Quer ser lembrado de repor {recLabel}?
          </p>
          {recLabel && (
            <p className="text-[var(--color-accent)] text-xs mt-1 font-medium">
              Próximo lembrete: {nextRestockDate(item.recurrence ?? '')}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDismiss}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#A8A8A8' }}
          >
            Era única vez
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(90deg, var(--color-accent), var(--color-mid))', color: 'var(--color-on-gradient)' }}
          >
            Sim, lembrar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DailyFocus() {
  const { items, addItem, toggleItem, updateItem, deleteItem } = useDailyFocus();

  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const isToday = selectedDay === today.getDate();
  const dayStripRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Dias do mês atual, na tira horizontal. O dia de hoje entra em foco.
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return { day: i + 1, weekday: WEEKDAYS[d.getDay()] };
  });

  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, []);

  const selectedDate = new Date(today.getFullYear(), today.getMonth(), selectedDay);
  const dateLabel = `${WEEKDAYS_LONG[selectedDate.getDay()]}, ${selectedDay} de ${MONTHS[today.getMonth()]}`;

  const [restockQueue, setRestockQueue] = useState<DailyFocusItem[]>(() =>
    items.filter(i => i.recurrence && i.next_restock_date && i.status !== 'done')
  );
  const [showDone, setShowDone] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [restockPrompt, setRestockPrompt] = useState<DailyFocusItem | null>(null);

  // Sem histórico por dia ainda: os itens pertencem a "hoje". Outros dias
  // mostram um estado vazio.
  const dayItems = isToday ? items : [];
  const pendingItems = dayItems.filter(i => i.status === 'pending');
  const doneItems = dayItems.filter(i => i.status === 'done');

  const toggle = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    toggleItem(id);
    if (item.status !== 'done' && item.recurrence && item.recurrence !== 'once') {
      setRestockPrompt(item);
    }
  };

  const handleRestockConfirm = () => {
    if (!restockPrompt) return;
    const restock = nextRestockDate(restockPrompt.recurrence ?? '');
    updateItem(restockPrompt.id, { next_restock_date: restock });
    setRestockQueue(prev => [
      ...prev.filter(r => r.id !== restockPrompt.id),
      { ...restockPrompt, next_restock_date: restock, status: 'pending' },
    ]);
    setRestockPrompt(null);
  };

  const handleAddItem = (data: Omit<DailyFocusItem, 'id' | 'user_id' | 'created_at'>) => {
    addItem({
      ...data,
      id: `df-${Date.now()}`,
      user_id: 'user-1',
      created_at: new Date().toISOString(),
    });
  };

  const handleAddFromRestock = (suggestion: DailyFocusItem) => {
    updateItem(suggestion.id, { status: 'pending' });
    setRestockQueue(prev => prev.filter(r => r.id !== suggestion.id));
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Foco Diário</h1>
        <p className="text-[#6F6F6F] text-sm mt-1">{dateLabel}</p>
        <p className="text-[var(--color-accent)] text-xs mt-1 font-medium">
          {doneItems.length}/{pendingItems.length + doneItems.length} concluídos
        </p>
      </div>

      {/* Tira de dias do mês */}
      <div ref={dayStripRef} className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {monthDays.map(({ day, weekday }) => {
          const active = day === selectedDay;
          const isTodayChip = day === today.getDate();
          return (
            <button
              key={day}
              ref={isTodayChip ? todayRef : undefined}
              onClick={() => setSelectedDay(day)}
              className="flex flex-col items-center justify-center rounded-2xl flex-shrink-0 tap-scale"
              style={{
                width: 46, height: 60,
                background: active ? 'linear-gradient(135deg, var(--color-start), var(--color-end))' : 'rgba(255,255,255,0.05)',
                border: isTodayChip && !active ? '1px solid rgba(var(--color-accent-rgb),0.5)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-[10px] font-medium" style={{ color: active ? 'var(--color-on-gradient)' : '#6F6F6F' }}>{weekday}</span>
              <span className="text-lg font-bold" style={{ color: active ? 'var(--color-on-gradient)' : '#F7F7F7' }}>{day}</span>
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {/* Dias que não são hoje ainda não têm histórico */}
        {!isToday ? (
          <div className="text-center py-12">
            <p className="text-[#6F6F6F] text-sm">Sem itens registrados para este dia.</p>
            <p className="text-[#3F3F3F] text-xs mt-1">O foco de hoje aparece ao selecionar o dia atual.</p>
          </div>
        ) : pendingItems.length === 0 && doneItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F6F6F] text-sm">Nenhum item no foco de hoje.</p>
            <p className="text-[#3F3F3F] text-xs mt-1">Toque em "Novo item" para começar.</p>
          </div>
        ) : (
          <>
            {/* Blocos por categoria — só os que têm itens pendentes */}
            {CATEGORY_BLOCKS.map(block => {
              const blockPending = pendingItems.filter(i => (block.match as readonly string[]).includes(i.category));
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
                          <ChecklistItem item={item} onToggle={toggle} />
                        </div>
                      </SwipeToDelete>
                    ))}
                  </GlassCard>
                </div>
              );
            })}

            {pendingItems.length === 0 && doneItems.length > 0 && (
              <div className="text-center py-6">
                <p className="text-[#22c55e] text-sm font-medium">Tudo concluído hoje! 🎉</p>
              </div>
            )}
          </>
        )}

        {/* Done items — collapsible */}
        {isToday && doneItems.length > 0 && (
          <div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDone(s => !s)}
              className="flex items-center gap-2 py-2 w-full"
            >
              {showDone ? <ChevronUp size={14} color="#6F6F6F" /> : <ChevronDown size={14} color="#6F6F6F" />}
              <span className="text-[#6F6F6F] text-xs">
                {doneItems.length} {doneItems.length === 1 ? 'concluído' : 'concluídos'} hoje
              </span>
            </motion.button>
            <AnimatePresence>
              {showDone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: 'hidden' }}
                >
                  <GlassCard padding="py-1">
                    {doneItems.map(item => (
                      <SwipeToDelete key={item.id} onDelete={() => deleteItem(item.id)}>
                        <div className="px-4">
                          <ChecklistItem key={item.id} item={item} onToggle={toggle} />
                        </div>
                      </SwipeToDelete>
                    ))}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Reposição sugerida */}
        {isToday && restockQueue.length > 0 && (
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={15} color="var(--color-accent)" />
              <span className="text-[#F7F7F7] font-semibold text-sm">Reposição sugerida</span>
            </div>
            <div className="flex flex-col gap-0">
              {restockQueue.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i < restockQueue.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <div>
                    <p className="text-[#F7F7F7] text-sm font-medium">{item.name}</p>
                    <p className="text-[#6F6F6F] text-xs mt-0.5">
                      {item.recurrence === 'weekly' ? 'Semanal'
                        : item.recurrence === 'monthly' ? 'Mensal'
                        : item.recurrence === 'biweekly' ? '15 dias'
                        : item.recurrence}
                      {item.note ? ` · ${item.note}` : ''}
                      {item.next_restock_date ? ` · Próximo: ${item.next_restock_date}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleAddFromRestock(item)}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(var(--color-accent-rgb),0.15)', color: 'var(--color-accent)' }}
                    >
                      Adicionar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRestockQueue(prev => prev.filter(r => r.id !== item.id))}
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(var(--color-danger-rgb),0.12)' }}
                    >
                      <Trash2 size={13} color="var(--color-danger)" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Add button */}
        {isToday && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddSheet(true)}
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5"
            style={{ border: '1.5px dashed rgba(255,255,255,0.13)', color: '#6F6F6F' }}
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Novo item</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showAddSheet && (
          <AddItemSheet
            onClose={() => setShowAddSheet(false)}
            onSave={handleAddItem}
          />
        )}
        {restockPrompt && (
          <RestockPrompt
            item={restockPrompt}
            onConfirm={handleRestockConfirm}
            onDismiss={() => setRestockPrompt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

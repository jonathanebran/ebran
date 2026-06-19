import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GlassCard } from '../components/GlassCard';
import { ChecklistItem } from '../components/ChecklistItem';
import { useDailyFocus } from '../contexts/DailyFocusContext';
import type { DailyFocusItem } from '../lib/types';

const tabs = ['Hoje', 'Mercado', 'Casa', 'Treino', 'Cuidado'] as const;
type Tab = typeof tabs[number];

const tabCategoryMap: Record<Tab, string[]> = {
  Hoje: ['market', 'care', 'home', 'workout', 'task', 'recurring'],
  Mercado: ['market'],
  Casa: ['home'],
  Treino: ['workout'],
  Cuidado: ['care'],
};

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
                background: category === opt.value ? 'rgba(255,159,61,0.2)' : 'rgba(255,255,255,0.06)',
                color: category === opt.value ? '#FF9F3D' : '#A8A8A8',
                border: category === opt.value ? '0.5px solid rgba(255,159,61,0.4)' : '0.5px solid transparent',
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
                background: recurrence === opt.value ? 'rgba(255,159,61,0.2)' : 'rgba(255,255,255,0.06)',
                color: recurrence === opt.value ? '#FF9F3D' : '#A8A8A8',
                border: recurrence === opt.value ? '0.5px solid rgba(255,159,61,0.4)' : '0.5px solid transparent',
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
              ? 'linear-gradient(90deg, #FFD84A, #FF9F3D 40%, #FF6B5F 70%, #FF2F7D)'
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
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(255,159,61,0.15)' }}>
            <RefreshCw size={20} color="#FF9F3D" />
          </div>
          <h3 className="text-[#F7F7F7] font-bold text-base">{item.name} concluído!</h3>
          <p className="text-[#A8A8A8] text-sm mt-1">
            Quer ser lembrado de repor {recLabel}?
          </p>
          {recLabel && (
            <p className="text-[#FF9F3D] text-xs mt-1 font-medium">
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
            style={{ background: 'linear-gradient(90deg, #FF9F3D, #FF6B5F)', color: '#000' }}
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
  const { items, addItem, toggleItem, updateItem } = useDailyFocus();

  const [activeTab, setActiveTab] = useState<Tab>('Hoje');
  const [restockQueue, setRestockQueue] = useState<DailyFocusItem[]>(() =>
    items.filter(i => i.recurrence && i.next_restock_date && i.status !== 'done')
  );
  const [showDone, setShowDone] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [restockPrompt, setRestockPrompt] = useState<DailyFocusItem | null>(null);

  const categories = tabCategoryMap[activeTab];

  const pendingItems = items.filter(i => categories.includes(i.category) && i.status === 'pending');
  const doneItems = items.filter(i => categories.includes(i.category) && i.status === 'done');

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
        <p className="text-[#6F6F6F] text-sm mt-1">
          {doneItems.length}/{pendingItems.length + doneItems.length} concluídos
        </p>
      </div>

      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {/* Active items list */}
        {pendingItems.length > 0 ? (
          <GlassCard padding="px-4 py-1">
            {pendingItems.map(item => (
              <ChecklistItem key={item.id} item={item} onToggle={toggle} />
            ))}
          </GlassCard>
        ) : doneItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F6F6F] text-sm">Nenhum item nesta categoria</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#22c55e] text-sm font-medium">Tudo concluído nesta categoria!</p>
          </div>
        )}

        {/* Done items — collapsible */}
        {doneItems.length > 0 && (
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
                  <GlassCard padding="px-4 py-1">
                    {doneItems.map(item => (
                      <ChecklistItem key={item.id} item={item} onToggle={toggle} />
                    ))}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Reposição sugerida */}
        {restockQueue.length > 0 && (activeTab === 'Hoje' || activeTab === 'Mercado' || activeTab === 'Cuidado') && (
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={15} color="#FF9F3D" />
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
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleAddFromRestock(item)}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl flex-shrink-0"
                    style={{ background: 'rgba(255,159,61,0.15)', color: '#FF9F3D' }}
                  >
                    Adicionar
                  </motion.button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Add button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddSheet(true)}
          className="flex items-center justify-center gap-2 rounded-2xl py-3.5"
          style={{ border: '1.5px dashed rgba(255,255,255,0.13)', color: '#6F6F6F' }}
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Novo item</span>
        </motion.button>
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

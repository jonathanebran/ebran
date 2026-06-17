import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GlassCard } from '../components/GlassCard';
import { ChecklistItem } from '../components/ChecklistItem';
import { AICommandBar } from '../components/AICommandBar';
import { mockDailyFocusItems, mockRestockSuggestions } from '../data/mockData';
import type { DailyFocusItem } from '../lib/types';

const tabs = ['Hoje', 'Mercado', 'Casa', 'Treino', 'Cuidado', 'Recorrentes'] as const;
type Tab = typeof tabs[number];

const tabCategoryMap: Record<Tab, string[]> = {
  Hoje: ['market', 'care', 'home', 'workout', 'task', 'recurring'],
  Mercado: ['market'],
  Casa: ['home'],
  Treino: ['workout'],
  Cuidado: ['care'],
  Recorrentes: ['recurring'],
};

export function DailyFocus() {
  const [activeTab, setActiveTab] = useState<Tab>('Hoje');
  const [items, setItems] = useState<DailyFocusItem[]>(mockDailyFocusItems);

  const toggle = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'done' ? 'pending' : 'done' }
          : item
      )
    );
  };

  const categories = tabCategoryMap[activeTab];
  const filtered = items.filter(i => categories.includes(i.category));

  const done = filtered.filter(i => i.status === 'done').length;
  const total = filtered.length;

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Foco Diário</h1>
        <p className="text-[#6F6F6F] text-sm mt-1">{done}/{total} concluídos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5 mt-4 flex flex-col gap-4">
        {/* AI Bar */}
        <AICommandBar placeholder="Adicionar item rápido..." compact />

        {/* Lista */}
        {filtered.length > 0 ? (
          <GlassCard padding="px-4 py-1">
            {filtered.map(item => (
              <ChecklistItem key={item.id} item={item} onToggle={toggle} />
            ))}
          </GlassCard>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#6F6F6F] text-sm">Nenhum item nesta categoria</p>
          </div>
        )}

        {/* Reposição Sugerida */}
        {(activeTab === 'Hoje' || activeTab === 'Recorrentes') && (
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={15} color="#FF9F3D" />
              <span className="text-[#F7F7F7] font-semibold text-sm">Reposição sugerida</span>
            </div>
            <div className="flex flex-col gap-0">
              {mockRestockSuggestions.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div>
                    <p className="text-[#F7F7F7] text-sm font-medium">{item.name}</p>
                    <p className="text-[#6F6F6F] text-xs mt-0.5">
                      {item.recurrence === 'weekly' ? 'Semanal' : item.recurrence === 'monthly' ? 'Mensal' : '45 dias'}
                      {item.estimated_price ? ` · ~R$ ${item.estimated_price}` : ''}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(255,159,61,0.12)', color: '#FF9F3D' }}
                  >
                    Repor em breve
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Add button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center justify-center gap-2 rounded-2xl py-3.5"
          style={{
            border: '1.5px dashed rgba(255,255,255,0.15)',
            color: '#6F6F6F',
          }}
        >
          <Plus size={16} />
          <span className="text-sm">Novo item</span>
        </motion.button>
      </div>
    </div>
  );
}

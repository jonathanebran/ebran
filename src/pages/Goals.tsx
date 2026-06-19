import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GoalCard } from '../components/GoalCard';
import { WishlistCard } from '../components/WishlistCard';
import { CareGoalCard } from '../components/CareGoalCard';
import { GlassCard } from '../components/GlassCard';
import { mockWishlistItems, mockEconomyMode } from '../data/mockData';
import { useGoals } from '../contexts/GoalsContext';

const tabs = ['Grandes', 'Focos', 'Desejos', 'Cuidado', 'Economia'] as const;
type Tab = typeof tabs[number];

const recommendationLabel: Record<string, string> = {
  buy_now: 'Comprar agora',
  buy_later: 'Comprar depois',
  research: 'Pesquisar preço',
  save_as_goal: 'Virar meta',
};

const recommendationColor: Record<string, string> = {
  buy_now: '#22c55e',
  buy_later: '#FF9F3D',
  research: '#A8A8A8',
  save_as_goal: '#FF2F7D',
};

function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <p className="text-[#6F6F6F] text-sm">{label}</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl"
        style={{ background: 'rgba(255,159,61,0.12)', border: '1px dashed rgba(255,159,61,0.35)' }}
      >
        <Plus size={16} color="#FF9F3D" />
        <span className="text-[#FF9F3D] text-sm font-semibold">Nova meta</span>
      </motion.button>
    </div>
  );
}

export function Goals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { goals } = useGoals();

  const paramTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<Tab>(
    tabs.includes(paramTab as Tab) ? (paramTab as Tab) : 'Grandes'
  );

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const largeGoals = goals.filter(g => g.type === 'financial' || g.type === 'travel');
  const focusGoals = goals.filter(g => g.type === 'small');
  const careGoals  = goals.filter(g => g.type === 'care' || g.type === 'health');
  const wishGoals  = goals.filter(g => g.type === 'wish');

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Metas</h1>
        <p className="text-[#6F6F6F] text-sm mt-0.5">Tudo o que você quer conquistar, organizado.</p>
      </div>

      <div className="px-5 mt-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/metas/nova')}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4"
          style={{ background: 'linear-gradient(90deg, #FFD84A, #FF9F3D 40%, #FF6B5F 70%, #FF2F7D)' }}
        >
          <Plus size={20} color="#000" strokeWidth={2.5} />
          <span className="text-black font-bold text-base">Nova meta</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">

        {activeTab === 'Grandes' && (
          largeGoals.length > 0
            ? largeGoals.map(g => <GoalCard key={g.id} goal={g} variant="ring" />)
            : <EmptyState label="Nenhuma meta grande ainda." onAdd={() => navigate('/metas/nova')} />
        )}

        {activeTab === 'Focos' && (
          focusGoals.length > 0
            ? focusGoals.map(g => <GoalCard key={g.id} goal={g} />)
            : <EmptyState label="Nenhum foco cadastrado." onAdd={() => navigate('/metas/nova')} />
        )}

        {activeTab === 'Desejos' && (
          <>
            {wishGoals.length > 0
              ? wishGoals.map(g => <GoalCard key={g.id} goal={g} variant="compact" />)
              : <EmptyState label="Nenhum desejo cadastrado." onAdd={() => navigate('/metas/nova')} />
            }
            {mockWishlistItems.length > 0 && (
              <div className="mt-2">
                <p className="text-[#A8A8A8] text-xs font-medium mb-2">Lista de desejos</p>
                {mockWishlistItems.map(w => <WishlistCard key={w.id} item={w} />)}
              </div>
            )}
          </>
        )}

        {activeTab === 'Cuidado' && (
          careGoals.length > 0
            ? careGoals.map(g => (
                <CareGoalCard key={g.id} goal={g} onClick={() => navigate(`/metas/${g.id}`)} />
              ))
            : <EmptyState label="Nenhuma meta de cuidado." onAdd={() => navigate('/metas/nova')} />
        )}

        {activeTab === 'Economia' && (
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={15} color="#FFD84A" />
              <span className="text-[#F7F7F7] font-semibold text-sm">Modo Economia — IA prioriza</span>
            </div>
            <div className="flex flex-col gap-3">
              {mockEconomyMode.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-3 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F7F7F7] text-sm font-medium">{item.title}</p>
                    <p className="text-[#6F6F6F] text-xs mt-0.5">{item.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl"
                      style={{
                        background: `${recommendationColor[item.recommendation]}22`,
                        color: recommendationColor[item.recommendation],
                      }}
                    >
                      {recommendationLabel[item.recommendation]}
                    </span>
                    {item.price && (
                      <span className="text-[#A8A8A8] text-xs">R$ {item.price.toLocaleString('pt-BR')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GoalCard } from '../components/GoalCard';
import { WishlistCard } from '../components/WishlistCard';
import { CareGoalCard } from '../components/CareGoalCard';
import { GlassCard } from '../components/GlassCard';
import { mockGoals, mockWishlistItems, mockEconomyMode } from '../data/mockData';

const tabs = ['Grandes', 'Pequenas', 'Desejos', 'Cuidado', 'Economia'] as const;
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

export function Goals() {
  const [activeTab, setActiveTab] = useState<Tab>('Grandes');
  const navigate = useNavigate();

  const largeGoals = mockGoals.filter(g => g.type === 'financial' || g.type === 'travel');
  const smallGoals = mockGoals.filter(g => g.type === 'small');
  const careGoals = mockGoals.filter(g => g.type === 'care');
  const wishGoals = mockGoals.filter(g => g.type === 'wish');

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Metas</h1>
        <p className="text-[#6F6F6F] text-sm mt-0.5">Tudo o que você quer conquistar, organizado.</p>
      </div>

      {/* Prominent Nova Meta button — matches design */}
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
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {activeTab === 'Grandes' && largeGoals.map(g => (
          <GoalCard key={g.id} goal={g} variant="ring" />
        ))}

        {activeTab === 'Pequenas' && (
          <>
            {smallGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </>
        )}

        {activeTab === 'Desejos' && (
          <>
            {wishGoals.map(g => <GoalCard key={g.id} goal={g} variant="compact" />)}
            <div className="mt-2">
              <p className="text-[#A8A8A8] text-xs font-medium mb-2">Lista de desejos</p>
              {mockWishlistItems.map(w => <WishlistCard key={w.id} item={w} />)}
            </div>
          </>
        )}

        {activeTab === 'Cuidado' && careGoals.map(g => (
          <CareGoalCard key={g.id} goal={g} onClick={() => navigate(`/metas/${g.id}`)} />
        ))}

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

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { mockEconomyMode } from '../data/mockData';
import { formatCurrency } from '../lib/utils';

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

const criteriaList = [
  'Impacto na rotina diária',
  'Impacto no treino e saúde',
  'Impacto no trabalho',
  'Urgência real',
  'Preço e orçamento disponível',
  'Metas financeiras ativas',
  'Frequência de uso',
  'Desejo emocional vs. necessidade',
];

export function EconomyMode() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <div className="flex items-center gap-2">
          <Zap size={20} color="#FFD84A" />
          <h1 className="text-xl font-bold text-[#F7F7F7]">Modo Economia</h1>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4">
        <GlassCard>
          <p className="text-[#A8A8A8] text-sm mb-3">A IA avalia seus itens com base em:</p>
          <div className="flex flex-wrap gap-2">
            {criteriaList.map(c => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-xl text-[11px]"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#A8A8A8' }}
              >
                {c}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-[#F7F7F7] font-semibold text-sm mb-4">Priorização atual</p>
          {mockEconomyMode.length === 0 ? (
            <p className="text-[#6F6F6F] text-sm text-center py-6">
              Nenhum item para priorizar ainda.
            </p>
          ) : (
          <div className="flex flex-col gap-0">
            {mockEconomyMode.map((item, i) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #FFD84A, #FF2F7D)' : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? '#000' : '#6F6F6F',
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[#F7F7F7] text-sm font-semibold">{item.title}</p>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl flex-shrink-0"
                      style={{
                        background: `${recommendationColor[item.recommendation]}18`,
                        color: recommendationColor[item.recommendation],
                      }}
                    >
                      {recommendationLabel[item.recommendation]}
                    </span>
                  </div>
                  <p className="text-[#6F6F6F] text-xs mt-1">{item.reason}</p>
                  <p className="text-[#A8A8A8] text-xs mt-1">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Wallet, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { mockFinanceSummary, mockFinanceRecords, mockWorkSummary, mockWorkRecords } from '../data/mockData';
import { formatCurrency, getPercentage } from '../lib/utils';

const tabs = ['Resumo', 'Lançamentos', 'Categorias', 'Trabalho', 'Cuidado', 'Planejamento'] as const;
type Tab = typeof tabs[number];

const categoryLabels: Record<string, string> = {
  work: '💼 Trabalho', food: '🍽 Alimentação', transport: '🚗 Transporte',
  home: '🏠 Casa', subscriptions: '📱 Assinaturas', care: '✨ Cuidado',
  products: '🛍 Produtos', consultations: '👨‍⚕️ Consultas', procedures: '💉 Procedimentos',
  medications: '💊 Medicamentos', therapy: '🧠 Terapia', leisure: '🎮 Lazer',
  travel: '✈️ Viagem', investments: '📈 Investimentos',
};

function ResumoTab() {
  const { income, expenses, balance, savings_rate } = mockFinanceSummary;
  return (
    <div className="flex flex-col gap-3">
      {/* Integration note */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'rgba(255,159,61,0.08)', border: '0.5px solid rgba(255,159,61,0.2)' }}
      >
        <span style={{ fontSize: 18 }}>🔗</span>
        <div>
          <p className="text-[#F7F7F7] text-xs font-semibold">Resumo do Ebran</p>
          <p className="text-[#6F6F6F] text-xs">Lançamentos detalhados no app do Breno · Este painel é seu resumo pessoal</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <GlassCard padding="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} color="#22c55e" />
            <span className="text-xs text-[#A8A8A8]">Entradas</span>
          </div>
          <p className="text-[#22c55e] font-bold text-lg">{formatCurrency(income)}</p>
        </GlassCard>
        <GlassCard padding="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} color="#FF6B5F" />
            <span className="text-xs text-[#A8A8A8]">Saídas</span>
          </div>
          <p className="text-[#FF6B5F] font-bold text-lg">{formatCurrency(expenses)}</p>
        </GlassCard>
      </div>
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={16} color="#FF9F3D" />
            <span className="text-[#F7F7F7] font-semibold text-sm">Saldo estimado</span>
          </div>
          <p className="text-[#FF9F3D] font-bold text-lg">{formatCurrency(balance)}</p>
        </div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[#A8A8A8]">Taxa de economia</span>
          <span className="text-[#FF9F3D] font-bold">{savings_rate}%</span>
        </div>
        <ProgressBar value={savings_rate} height={5} />
      </GlassCard>
    </div>
  );
}

function LancamentosTab() {
  const allRecords = [...mockFinanceRecords].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <GlassCard>
      <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Junho 2025</p>
      {allRecords.map(rec => (
        <div key={rec.id} className="flex items-center gap-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: rec.type === 'income' ? '#22c55e18' : '#FF6B5F18' }}
          >
            {rec.type === 'income'
              ? <TrendingUp size={15} color="#22c55e" />
              : <TrendingDown size={15} color="#FF6B5F" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#F7F7F7] text-sm font-medium truncate">{rec.description}</p>
            <p className="text-[#6F6F6F] text-xs">{categoryLabels[rec.category] ?? rec.category} · {rec.date}</p>
          </div>
          <p className="font-bold text-sm flex-shrink-0" style={{ color: rec.type === 'income' ? '#22c55e' : '#FF6B5F' }}>
            {rec.type === 'income' ? '+' : '-'}{formatCurrency(rec.amount)}
          </p>
        </div>
      ))}
    </GlassCard>
  );
}

function CategoriasTab() {
  const categories = [
    { cat: 'work', amount: 8750, pct: 89 },
    { cat: 'food', amount: 1200, pct: 22 },
    { cat: 'care', amount: 600, pct: 12 },
    { cat: 'transport', amount: 350, pct: 7 },
    { cat: 'subscriptions', amount: 250, pct: 5 },
    { cat: 'therapy', amount: 300, pct: 6 },
  ];

  return (
    <GlassCard>
      {categories.map(({ cat, amount, pct }) => (
        <div key={cat} className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-[#A8A8A8]">{categoryLabels[cat] ?? cat}</span>
            <span className="text-[#F7F7F7] font-semibold">{formatCurrency(amount)}</span>
          </div>
          <ProgressBar value={pct} height={4} />
        </div>
      ))}
    </GlassCard>
  );
}

function TrabalhoTab() {
  const workPct = getPercentage(mockWorkSummary.monthly_revenue, mockWorkSummary.monthly_goal);
  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Briefcase size={16} color="#FF9F3D" />
          <span className="text-[#F7F7F7] font-semibold text-sm">Faturamento junho</span>
        </div>
        <p className="text-[#F7F7F7] font-bold text-3xl">{formatCurrency(mockWorkSummary.monthly_revenue)}</p>
        <p className="text-[#6F6F6F] text-xs mt-1">Meta: {formatCurrency(mockWorkSummary.monthly_goal)}</p>
        <ProgressBar value={workPct} height={6} className="mt-3" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div><p className="text-[#6F6F6F] text-xs">Serviços</p><p className="text-[#F7F7F7] font-bold">{mockWorkSummary.services_count}</p></div>
          <div><p className="text-[#6F6F6F] text-xs">Ticket médio</p><p className="text-[#F7F7F7] font-bold">{formatCurrency(mockWorkSummary.average_ticket)}</p></div>
        </div>
      </GlassCard>
      <GlassCard>
        <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Registros recentes</p>
        {mockWorkRecords.slice(0, 3).map(r => (
          <div key={r.id} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-[#F7F7F7] text-sm font-medium">{r.description}</p>
              <p className="text-[#6F6F6F] text-xs">{r.date} · {r.payment_method?.toUpperCase()}</p>
            </div>
            <p className="text-[#22c55e] font-bold text-sm">+{formatCurrency(r.amount)}</p>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function CuidadoTab() {
  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[#F7F7F7] font-semibold text-sm">Gastos cuidado pessoal</p>
          <p className="text-[#FF9F3D] font-bold">{formatCurrency(600)}</p>
        </div>
        {[
          { label: 'Produtos', value: 188 },
          { label: 'Consultas', value: 300 },
          { label: 'Medicamentos', value: 80 },
          { label: 'Procedimentos', value: 0 },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-[#A8A8A8] text-sm">{label}</span>
            <span className="text-[#F7F7F7] text-sm font-semibold">{formatCurrency(value)}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

export function Finance() {
  const [activeTab, setActiveTab] = useState<Tab>('Resumo');
  const navigate = useNavigate();

  const tabContent: Record<Tab, React.ReactElement> = {
    Resumo: <ResumoTab />,
    Lançamentos: <LancamentosTab />,
    Categorias: <CategoriasTab />,
    Trabalho: <TrabalhoTab />,
    Cuidado: <CuidadoTab />,
    Planejamento: (
      <GlassCard>
        <p className="text-[#A8A8A8] text-sm">Planejamento financeiro em breve.</p>
      </GlassCard>
    ),
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Finanças</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/novo-registro')}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFD84A, #FF2F7D)' }}
        >
          <Plus size={18} color="#000" />
        </motion.button>
      </div>

      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5 mt-4">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}

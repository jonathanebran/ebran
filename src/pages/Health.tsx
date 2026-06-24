import React, { useState } from 'react';
import { Droplets, Dumbbell, Moon, Heart, Pill, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { mockHealthToday, mockAppointments, mockMedications, mockCareProducts } from '../data/mockData';

const tabs = ['Rotina', 'Treino', 'Macros', 'Estética', 'Mente', 'Consultas', 'Medicamentos'] as const;
type Tab = typeof tabs[number];

function DotProgress({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex gap-1 flex-wrap mt-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: i < value ? color : 'rgba(255,255,255,0.1)' }}
        />
      ))}
    </div>
  );
}

function GoogleFitBanner() {
  const [connected] = React.useState(false);
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-3"
      style={{
        background: connected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
        border: `0.5px solid ${connected ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <span style={{ fontSize: 22 }}>🏃</span>
      <div className="flex-1">
        <p className="text-[#F7F7F7] text-xs font-semibold">Google Fit {connected ? '· Conectado' : ''}</p>
        <p className="text-[#6F6F6F] text-xs">
          {connected
            ? 'Passos, frequência cardíaca e treinos sincronizados'
            : 'Conecte para importar passos, sono e treinos automaticamente'}
        </p>
      </div>
      {!connected && (
        <button
          className="text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(66,133,244,0.15)', color: '#4285F4', border: '0.5px solid rgba(66,133,244,0.3)' }}
        >
          Conectar
        </button>
      )}
      {connected && <span style={{ fontSize: 16 }}>✅</span>}
    </div>
  );
}

function RoutineTab() {
  const waterPct = (mockHealthToday.water.current / mockHealthToday.water.target) * 100;

  return (
    <div className="flex flex-col gap-3">
      <GoogleFitBanner />
      {/* Água */}
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets size={16} color="#FF9F3D" />
            <span className="text-[#F7F7F7] font-semibold text-sm">Água</span>
          </div>
          <span className="text-[#FF9F3D] font-bold text-sm">{mockHealthToday.water.current}L / {mockHealthToday.water.target}L</span>
        </div>
        <ProgressBar value={waterPct} height={6} />
        <DotProgress value={Math.round(mockHealthToday.water.current * 4)} max={Math.round(mockHealthToday.water.target * 4)} color="#FF9F3D" />
      </GlassCard>

      {/* Sono */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-2">
          <Moon size={16} color="#a78bfa" />
          <span className="text-[#F7F7F7] font-semibold text-sm">Sono</span>
          <span className="text-[#a78bfa] font-bold text-sm ml-auto">{mockHealthToday.sleep.hours}h {mockHealthToday.sleep.minutes}min</span>
        </div>
        <DotProgress value={mockHealthToday.sleep.hours} max={9} color="#a78bfa" />
      </GlassCard>

      {/* Hábitos do dia */}
      <GlassCard>
        <p className="text-[#F7F7F7] font-semibold text-sm mb-3">Hábitos do dia</p>
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <p className="text-[#6F6F6F] text-sm">Nenhum hábito cadastrado.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{ background: 'rgba(255,159,61,0.10)', border: '1px dashed rgba(255,159,61,0.35)' }}
          >
            <Plus size={14} color="#FF9F3D" />
            <span className="text-[#FF9F3D] text-xs font-semibold">Adicionar hábito</span>
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
}

function WorkoutTab() {
  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell size={16} color="#22c55e" />
          <span className="text-[#F7F7F7] font-semibold text-sm">Treino de Hoje</span>
        </div>
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <p className="text-[#6F6F6F] text-sm">Nenhum treino registrado hoje.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{ background: 'rgba(34,197,94,0.10)', border: '1px dashed rgba(34,197,94,0.35)' }}
          >
            <Plus size={14} color="#22c55e" />
            <span className="text-[#22c55e] text-xs font-semibold">Registrar treino</span>
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
}

function MacrosTab() {
  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <p className="text-[#F7F7F7] font-semibold text-sm mb-3">Macros do dia</p>
        {[
          { label: 'Proteína', value: 0, target: 180, unit: 'g', color: '#FF9F3D' },
          { label: 'Água', value: mockHealthToday.water.current, target: mockHealthToday.water.target, unit: 'L', color: '#4285F4' },
          { label: 'Calorias', value: 0, target: 2400, unit: 'kcal', color: '#22c55e' },
        ].map(m => (
          <div key={m.label} className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#A8A8A8]">{m.label}</span>
              <span style={{ color: m.color }}>{m.value}/{m.target}{m.unit}</span>
            </div>
            <ProgressBar value={(m.value / m.target) * 100} height={5} />
          </div>
        ))}
      </GlassCard>
      <GlassCard>
        <p className="text-[#F7F7F7] font-semibold text-sm mb-3">Suplementos</p>
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <p className="text-[#6F6F6F] text-sm">Nenhum suplemento cadastrado.</p>
        </div>
      </GlassCard>
    </div>
  );
}

function EsteticaTab() {
  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <p className="text-[#F7F7F7] font-semibold text-sm mb-3">Produtos em uso</p>
        {mockCareProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <p className="text-[#6F6F6F] text-sm">Nenhum produto cadastrado.</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={{ background: 'rgba(255,159,61,0.10)', border: '1px dashed rgba(255,159,61,0.35)' }}
            >
              <Plus size={14} color="#FF9F3D" />
              <span className="text-[#FF9F3D] text-xs font-semibold">Adicionar produto</span>
            </motion.button>
          </div>
        ) : (
          mockCareProducts.map(p => (
            <div key={p.id} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-[#F7F7F7] text-sm">{p.name}</p>
                <p className="text-[#6F6F6F] text-xs">{p.category}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-xl text-[#22c55e]" style={{ background: '#22c55e18' }}>Em uso</span>
            </div>
          ))
        )}
      </GlassCard>
      <GlassCard>
        <p className="text-[#F7F7F7] font-semibold text-sm mb-3">Procedimentos planejados</p>
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <p className="text-[#6F6F6F] text-sm">Nenhum procedimento planejado.</p>
        </div>
      </GlassCard>
    </div>
  );
}

function MenteTab() {
  return (
    <div className="flex flex-col gap-3">
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} color="#FF2F7D" />
          <span className="text-[#F7F7F7] font-semibold text-sm">Saúde Mental</span>
        </div>
        <div className="flex gap-3 mb-3">
          {['😔', '😐', '🙂', '😊', '😁'].map((emoji, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.8 }}
              className="text-2xl"
              style={{ opacity: 0.4 }}
            >{emoji}</motion.button>
          ))}
        </div>
        <p className="text-[#6F6F6F] text-xs">Como você está hoje?</p>
      </GlassCard>
      <GlassCard>
        <p className="text-[#F7F7F7] font-semibold text-sm mb-3">Profissionais</p>
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <p className="text-[#6F6F6F] text-sm">Nenhum profissional cadastrado.</p>
        </div>
      </GlassCard>
    </div>
  );
}

function ConsultasTab() {
  return (
    <div className="flex flex-col gap-3">
      {mockAppointments.length === 0 ? (
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Calendar size={28} color="#6F6F6F" />
            <p className="text-[#6F6F6F] text-sm">Nenhuma consulta agendada.</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={{ background: 'rgba(255,159,61,0.10)', border: '1px dashed rgba(255,159,61,0.35)' }}
            >
              <Plus size={14} color="#FF9F3D" />
              <span className="text-[#FF9F3D] text-xs font-semibold">Agendar consulta</span>
            </motion.button>
          </div>
        </GlassCard>
      ) : (
        mockAppointments.map(ap => (
          <GlassCard key={ap.id} padding="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,111,95,0.12)' }}>
                <Calendar size={18} color="#FF9F3D" />
              </div>
              <div className="flex-1">
                <p className="text-[#F7F7F7] font-semibold text-sm">{ap.title}</p>
                {ap.professional && <p className="text-[#A8A8A8] text-xs">{ap.professional}</p>}
                <p className="text-[#6F6F6F] text-xs">{ap.date} · {ap.time}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-xl text-[#FF9F3D]" style={{ background: 'rgba(255,159,61,0.12)' }}>Agendada</span>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}

function MedicamentosTab() {
  return (
    <div className="flex flex-col gap-3">
      {mockMedications.length === 0 ? (
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Pill size={28} color="#6F6F6F" />
            <p className="text-[#6F6F6F] text-sm">Nenhum medicamento cadastrado.</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={{ background: 'rgba(255,159,61,0.10)', border: '1px dashed rgba(255,159,61,0.35)' }}
            >
              <Plus size={14} color="#FF9F3D" />
              <span className="text-[#FF9F3D] text-xs font-semibold">Adicionar medicamento</span>
            </motion.button>
          </div>
        </GlassCard>
      ) : (
        mockMedications.map(med => (
          <GlassCard key={med.id} padding="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,111,95,0.12)' }}>
                <Pill size={18} color="#FF9F3D" />
              </div>
              <div className="flex-1">
                <p className="text-[#F7F7F7] font-semibold text-sm">{med.name}</p>
                <p className="text-[#A8A8A8] text-xs">{med.dose} · {med.frequency === 'daily' ? 'Diário' : med.frequency}</p>
                {med.reminder_time && <p className="text-[#6F6F6F] text-xs">Lembrete: {med.reminder_time}</p>}
              </div>
              <span className="text-xs px-2 py-1 rounded-xl text-[#22c55e]" style={{ background: '#22c55e18' }}>Ativo</span>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}

export function Health() {
  const [activeTab, setActiveTab] = useState<Tab>('Rotina');

  const tabContent: Record<Tab, React.ReactElement> = {
    Rotina: <RoutineTab />,
    Treino: <WorkoutTab />,
    Macros: <MacrosTab />,
    Estética: <EsteticaTab />,
    Mente: <MenteTab />,
    Consultas: <ConsultasTab />,
    Medicamentos: <MedicamentosTab />,
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Saúde</h1>
        <p className="text-[#6F6F6F] text-sm mt-1">Cuide do corpo e da mente</p>
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

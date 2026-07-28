import { useState } from 'react';
import { Droplets, Dumbbell, Moon, Pill, Calendar, Plus, Minus, X, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { loadHealth, saveHealth, type HealthData } from '../lib/healthStore';
import type { Appointment, Medication } from '../lib/types';

const tabs = ['Rotina', 'Consultas', 'Medicamentos'] as const;
type Tab = typeof tabs[number];

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
// índice do array acima → getDay() (0=Dom..6=Sáb)
const WEEKDAY_TO_DOW = [1, 2, 3, 4, 5, 6, 0];

// ─── Rotina ─────────────────────────────────────────────────────────────────

function RoutineTab({ data, update }: { data: HealthData; update: (patch: Partial<HealthData>) => void }) {
  const [habitName, setHabitName] = useState('');
  const waterPct = Math.min(100, (data.water / data.waterTarget) * 100);
  const todayDow = new Date().getDay();

  const addHabit = () => {
    if (!habitName.trim()) return;
    update({ habits: [...data.habits, { id: `h-${Date.now()}`, name: habitName.trim(), done: false }] });
    setHabitName('');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Água */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={16} color="var(--color-accent)" />
            <span className="text-[#F7F7F7] font-semibold text-sm">Água</span>
          </div>
          <span className="text-[var(--color-accent)] font-bold text-sm">
            {data.water.toFixed(1)}L / {data.waterTarget}L
          </span>
        </div>
        <ProgressBar value={waterPct} height={6} />
        <div className="flex items-center justify-center gap-3 mt-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => update({ water: Math.max(0, +(data.water - 0.25).toFixed(2)) })}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Minus size={18} color="#A8A8A8" />
          </motion.button>
          <span className="text-[#6F6F6F] text-xs w-24 text-center">Copo de 250ml</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => update({ water: +(data.water + 0.25).toFixed(2) })}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(var(--color-accent-rgb),0.15)' }}
          >
            <Plus size={18} color="var(--color-accent)" />
          </motion.button>
        </div>
      </GlassCard>

      {/* Sono */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Moon size={16} color="#a78bfa" />
          <span className="text-[#F7F7F7] font-semibold text-sm">Sono</span>
          <span className="text-[#a78bfa] font-bold text-sm ml-auto">{data.sleepHours}h {data.sleepMinutes}min</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[#6F6F6F] text-xs mb-1">Horas</p>
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => update({ sleepHours: Math.max(0, data.sleepHours - 1) })}
                className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Minus size={14} color="#A8A8A8" />
              </motion.button>
              <span className="text-[#F7F7F7] font-bold text-base flex-1 text-center">{data.sleepHours}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => update({ sleepHours: Math.min(14, data.sleepHours + 1) })}
                className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.15)' }}>
                <Plus size={14} color="#a78bfa" />
              </motion.button>
            </div>
          </div>
          <div>
            <p className="text-[#6F6F6F] text-xs mb-1">Minutos</p>
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => update({ sleepMinutes: (data.sleepMinutes + 45) % 60 })}
                className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Minus size={14} color="#A8A8A8" />
              </motion.button>
              <span className="text-[#F7F7F7] font-bold text-base flex-1 text-center">{data.sleepMinutes}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => update({ sleepMinutes: (data.sleepMinutes + 15) % 60 })}
                className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.15)' }}>
                <Plus size={14} color="#a78bfa" />
              </motion.button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Treino da semana */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={16} color="#22c55e" />
          <span className="text-[#F7F7F7] font-semibold text-sm">Treino da semana</span>
          <span className="text-[#22c55e] text-xs ml-auto font-medium">{data.workoutDays.length}/7</span>
        </div>
        <div className="flex justify-between gap-1.5">
          {WEEKDAYS.map((label, i) => {
            const dow = WEEKDAY_TO_DOW[i];
            const done = data.workoutDays.includes(dow);
            const isToday = dow === todayDow;
            return (
              <button
                key={label}
                onClick={() => update({
                  workoutDays: done ? data.workoutDays.filter(d => d !== dow) : [...data.workoutDays, dow],
                })}
                className="flex flex-col items-center gap-1 flex-1 tap-scale"
              >
                <span className="text-[10px]" style={{ color: isToday ? '#22c55e' : '#6F6F6F' }}>{label}</span>
                <div
                  className="w-full rounded-xl flex items-center justify-center"
                  style={{
                    height: 34,
                    background: done ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.05)',
                    border: isToday && !done ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {done && <Check size={16} color="#fff" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[#3F3F3F] text-[10px] mt-2 text-center">Marque os dias em que treinou</p>
      </GlassCard>

      {/* Hábitos */}
      <GlassCard>
        <p className="text-[#F7F7F7] font-semibold text-sm mb-3">Hábitos do dia</p>
        {data.habits.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {data.habits.map(h => (
              <div key={h.id} className="flex items-center gap-3">
                <button
                  onClick={() => update({ habits: data.habits.map(x => x.id === h.id ? { ...x, done: !x.done } : x) })}
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: h.done ? 'linear-gradient(135deg, var(--color-start), var(--color-end))' : 'transparent',
                    border: h.done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {h.done && <Check size={13} color="var(--color-on-gradient)" strokeWidth={3} />}
                </button>
                <span className="flex-1 text-sm" style={{ color: h.done ? '#6F6F6F' : '#F7F7F7', textDecoration: h.done ? 'line-through' : 'none' }}>
                  {h.name}
                </span>
                <button
                  onClick={() => update({ habits: data.habits.filter(x => x.id !== h.id) })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(var(--color-danger-rgb),0.1)' }}
                >
                  <Trash2 size={12} color="var(--color-danger)" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={habitName}
            onChange={e => setHabitName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
            placeholder="Novo hábito (ex.: tomar vitamina)"
            className="flex-1 rounded-xl px-3 py-2.5 text-sm text-[#F7F7F7] outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={addHabit}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(var(--color-accent-rgb),0.15)' }}
          >
            <Plus size={18} color="var(--color-accent)" />
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Consultas ────────────────────────────────────────────────────────────────

function AppointmentSheet({ onClose, onSave }: { onClose: () => void; onSave: (a: Appointment) => void }) {
  const [title, setTitle] = useState('');
  const [professional, setProfessional] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const save = () => {
    if (!title.trim()) return;
    onSave({
      id: `ap-${Date.now()}`, user_id: 'user-1', title: title.trim(),
      professional: professional.trim() || undefined, specialty: title.trim(),
      date: date || 'A definir', time: time || '', status: 'scheduled',
      created_at: new Date().toISOString(),
    });
    onClose();
  };

  return <FormSheet title="Nova consulta" onClose={onClose} onSave={save} canSave={!!title.trim()}>
    <SheetInput label="Consulta / especialidade" value={title} onChange={setTitle} placeholder="Ex.: Dermatologista" autoFocus />
    <SheetInput label="Profissional (opcional)" value={professional} onChange={setProfessional} placeholder="Ex.: Dra. Ana" />
    <div className="grid grid-cols-2 gap-3">
      <SheetInput label="Data" value={date} onChange={setDate} placeholder="Ex.: 12 dez" />
      <SheetInput label="Horário" value={time} onChange={setTime} placeholder="Ex.: 15:00" />
    </div>
  </FormSheet>;
}

function ConsultasTab({ data, update }: { data: HealthData; update: (patch: Partial<HealthData>) => void }) {
  const [sheet, setSheet] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[#6F6F6F] text-xs px-1">Consultas que você precisa fazer ou já agendou.</p>
      {data.appointments.map(ap => (
        <GlassCard key={ap.id} padding="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-mid-rgb),0.12)' }}>
              <Calendar size={18} color="var(--color-accent)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F7F7F7] font-semibold text-sm">{ap.title}</p>
              {ap.professional && <p className="text-[#A8A8A8] text-xs">{ap.professional}</p>}
              <p className="text-[#6F6F6F] text-xs">{ap.date}{ap.time ? ` · ${ap.time}` : ''}</p>
            </div>
            <button onClick={() => update({ appointments: data.appointments.filter(x => x.id !== ap.id) })}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-danger-rgb),0.1)' }}>
              <Trash2 size={13} color="var(--color-danger)" />
            </button>
          </div>
        </GlassCard>
      ))}
      <AddButton label="Adicionar consulta" onClick={() => setSheet(true)} />
      <AnimatePresence>
        {sheet && <AppointmentSheet onClose={() => setSheet(false)} onSave={a => update({ appointments: [...data.appointments, a] })} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Medicamentos ─────────────────────────────────────────────────────────────

function MedicationSheet({ onClose, onSave }: { onClose: () => void; onSave: (m: Medication) => void }) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('');

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: `med-${Date.now()}`, user_id: 'user-1', name: name.trim(),
      dose: dose.trim() || '—', frequency: 'daily', reminder_time: time.trim() || undefined,
      status: 'active', created_at: new Date().toISOString(),
    });
    onClose();
  };

  return <FormSheet title="Novo medicamento" onClose={onClose} onSave={save} canSave={!!name.trim()}>
    <SheetInput label="Nome" value={name} onChange={setName} placeholder="Ex.: Vitamina D" autoFocus />
    <SheetInput label="Dose (opcional)" value={dose} onChange={setDose} placeholder="Ex.: 2000 UI" />
    <SheetInput label="Horário do lembrete (opcional)" value={time} onChange={setTime} placeholder="Ex.: 08:00" />
  </FormSheet>;
}

function MedicamentosTab({ data, update }: { data: HealthData; update: (patch: Partial<HealthData>) => void }) {
  const [sheet, setSheet] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      {data.medications.map(med => (
        <GlassCard key={med.id} padding="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-mid-rgb),0.12)' }}>
              <Pill size={18} color="var(--color-accent)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F7F7F7] font-semibold text-sm">{med.name}</p>
              <p className="text-[#A8A8A8] text-xs">{med.dose} · Diário</p>
              {med.reminder_time && <p className="text-[#6F6F6F] text-xs">Lembrete: {med.reminder_time}</p>}
            </div>
            <button onClick={() => update({ medications: data.medications.filter(x => x.id !== med.id) })}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-danger-rgb),0.1)' }}>
              <Trash2 size={13} color="var(--color-danger)" />
            </button>
          </div>
        </GlassCard>
      ))}
      <AddButton label="Adicionar medicamento" onClick={() => setSheet(true)} />
      <AnimatePresence>
        {sheet && <MedicationSheet onClose={() => setSheet(false)} onSave={m => update({ medications: [...data.medications, m] })} />}
      </AnimatePresence>
    </div>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl py-3.5"
      style={{ border: '1.5px dashed rgba(var(--color-accent-rgb),0.35)' }}
    >
      <Plus size={16} color="var(--color-accent)" />
      <span className="text-[var(--color-accent)] text-sm font-semibold">{label}</span>
    </motion.button>
  );
}

function SheetInput({ label, value, onChange, placeholder, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="text-[#6F6F6F] text-xs mb-1.5 block">{label}</label>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-3 text-[#F7F7F7] text-sm outline-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
      />
    </div>
  );
}

function FormSheet({ title, onClose, onSave, canSave, children }: {
  title: string; onClose: () => void; onSave: () => void; canSave: boolean; children: React.ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl p-6 flex flex-col gap-4"
        style={{ background: 'rgba(15,15,15,0.98)', border: '0.5px solid rgba(255,255,255,0.1)', paddingBottom: 'max(32px, env(safe-area-inset-bottom, 0px))' }}
        initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[#F7F7F7] font-bold text-lg">{title}</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}><X size={20} color="#6F6F6F" /></motion.button>
        </div>
        {children}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={!canSave}
          className="w-full py-3.5 rounded-2xl font-bold text-sm mt-1"
          style={{
            background: canSave ? 'linear-gradient(135deg, var(--color-start), var(--color-end))' : 'rgba(255,255,255,0.08)',
            color: canSave ? 'var(--color-on-gradient)' : '#6F6F6F',
          }}
        >
          Salvar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────

export function Health() {
  const [activeTab, setActiveTab] = useState<Tab>('Rotina');
  const [data, setData] = useState<HealthData>(() => loadHealth());

  const update = (patch: Partial<HealthData>) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      saveHealth(next);
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Saúde</h1>
        <p className="text-[#6F6F6F] text-sm mt-1">Rotina, consultas e medicamentos</p>
      </div>

      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Chip key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      <div className="px-5 mt-4">
        {activeTab === 'Rotina' && <RoutineTab data={data} update={update} />}
        {activeTab === 'Consultas' && <ConsultasTab data={data} update={update} />}
        {activeTab === 'Medicamentos' && <MedicamentosTab data={data} update={update} />}
      </div>
    </div>
  );
}

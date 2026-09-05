import { useState, useRef } from 'react';
import { Droplets, Dumbbell, Pill, Calendar, Plus, Minus, X, Check, Trash2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { type HealthData } from '../lib/healthStore';
import { useHealth } from '../contexts/HealthContext';
import { useActivity } from '../contexts/ActivityContext';
import type { Appointment, Medication } from '../lib/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Tamanhos rápidos de água (em litros).
const WATER_SIZES = [
  { label: 'Copo', ml: '250 ml', v: 0.25 },
  { label: 'Caneca', ml: '350 ml', v: 0.35 },
  { label: 'Garrafa', ml: '500 ml', v: 0.5 },
  { label: 'Garrafão', ml: '1 L', v: 1 },
];

// ─── Água ─────────────────────────────────────────────────────────────────────

function WaterCard({ data, update }: { data: HealthData; update: (patch: Partial<HealthData>) => void }) {
  const [editing, setEditing] = useState(false);
  const [targetInput, setTargetInput] = useState(String(data.waterTarget));
  const reachedRef = useRef(data.water >= data.waterTarget);
  const [celebrate, setCelebrate] = useState(false);
  const pct = Math.min(100, (data.water / data.waterTarget) * 100);
  const reached = data.water >= data.waterTarget;

  const add = (v: number) => {
    const next = Math.max(0, +(data.water + v).toFixed(2));
    update({ water: next });
    // Cruzou a meta agora → comemora.
    if (!reachedRef.current && next >= data.waterTarget) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1600);
    }
    reachedRef.current = next >= data.waterTarget;
  };

  const saveTarget = () => {
    const t = parseFloat(targetInput.replace(',', '.'));
    if (!isNaN(t) && t > 0) update({ waterTarget: +t.toFixed(2) });
    setEditing(false);
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Droplets size={16} color="var(--color-accent)" />
          <span className="text-[#F7F7F7] font-semibold text-sm">Água</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: reached ? '#22c55e' : 'var(--color-accent)' }}>
            {data.water.toFixed(2).replace(/\.?0+$/, '')}L / {data.waterTarget}L
          </span>
          <button onClick={() => { setTargetInput(String(data.waterTarget)); setEditing(true); }} className="tap-scale">
            <Pencil size={13} color="#6F6F6F" />
          </button>
        </div>
      </div>

      <div className="relative">
        <ProgressBar value={pct} height={8} />
        <AnimatePresence>
          {celebrate && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.6, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -22 }}
              exit={{ opacity: 0, y: -34 }}
            >
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#22c55e', color: '#000' }}>
                Meta batida! 🎉
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {reached && !celebrate && (
        <p className="text-[#22c55e] text-xs mt-2 flex items-center gap-1">
          <Check size={12} strokeWidth={3} /> Meta do dia concluída
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 mt-3">
        {WATER_SIZES.map(s => (
          <motion.button
            key={s.label} whileTap={{ scale: 0.93 }} onClick={() => add(s.v)}
            className="flex flex-col items-center gap-0.5 rounded-2xl py-2.5"
            style={{ background: 'rgba(var(--color-accent-rgb),0.1)', border: '0.5px solid rgba(var(--color-accent-rgb),0.2)' }}
          >
            <Plus size={13} color="var(--color-accent)" />
            <span className="text-[#F7F7F7] text-[11px] font-semibold">{s.label}</span>
            <span className="text-[#6F6F6F] text-[9px]">{s.ml}</span>
          </motion.button>
        ))}
      </div>

      {data.water > 0 && (
        <button
          onClick={() => { update({ water: Math.max(0, +(data.water - 0.25).toFixed(2)) }); reachedRef.current = (data.water - 0.25) >= data.waterTarget; }}
          className="flex items-center justify-center gap-1 mt-2 w-full py-1.5 text-[#6F6F6F] text-xs"
        >
          <Minus size={12} /> Tirar um copo
        </button>
      )}

      <AnimatePresence>
        {editing && (
          <FormSheet title="Meta de água por dia" onClose={() => setEditing(false)} onSave={saveTarget} canSave={!!targetInput}>
            <div>
              <label className="text-[#6F6F6F] text-xs mb-1.5 block">Litros por dia</label>
              <input
                autoFocus type="number" inputMode="decimal" step="0.25"
                value={targetInput} onChange={e => setTargetInput(e.target.value)}
                className="w-full rounded-xl px-3 py-3 text-[#F7F7F7] text-base font-bold outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
              />
            </div>
          </FormSheet>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ─── Treino da semana ─────────────────────────────────────────────────────────

function WorkoutCard({ data, update }: { data: HealthData; update: (patch: Partial<HealthData>) => void }) {
  const [editGoal, setEditGoal] = useState(false);
  const todayDow = new Date().getDay();
  const count = data.workoutDays.length;
  const reached = count >= data.workoutGoal;

  const toggle = (dow: number) => {
    const done = data.workoutDays.includes(dow);
    update({ workoutDays: done ? data.workoutDays.filter(d => d !== dow) : [...data.workoutDays, dow] });
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-3">
        <Dumbbell size={16} color="#22c55e" />
        <span className="text-[#F7F7F7] font-semibold text-sm">Treino da semana</span>
        <button onClick={() => setEditGoal(true)} className="ml-auto flex items-center gap-1 tap-scale">
          <span className="text-xs font-medium" style={{ color: reached ? '#22c55e' : '#6F6F6F' }}>{count}/{data.workoutGoal}</span>
          <Pencil size={11} color="#6F6F6F" />
        </button>
      </div>
      <div className="flex justify-between gap-1.5">
        {WEEKDAYS.map((label, dow) => {
          const done = data.workoutDays.includes(dow);
          const isToday = dow === todayDow;
          return (
            <button key={label} onClick={() => toggle(dow)} className="flex flex-col items-center gap-1 flex-1 tap-scale">
              <span className="text-[10px]" style={{ color: isToday ? '#22c55e' : '#6F6F6F' }}>{label}</span>
              <div className="w-full rounded-xl flex items-center justify-center"
                style={{
                  height: 34,
                  background: done ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.05)',
                  border: isToday && !done ? '1px solid rgba(34,197,94,0.5)' : '1px solid transparent',
                }}>
                {done && <Check size={16} color="#fff" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
      {reached ? (
        <p className="text-[#22c55e] text-xs mt-2 text-center font-medium">Meta da semana batida! 💪</p>
      ) : (
        <p className="text-[#3F3F3F] text-[10px] mt-2 text-center">Marque os dias em que treinou</p>
      )}

      <AnimatePresence>
        {editGoal && (
          <FormSheet title="Meta de treinos na semana" onClose={() => setEditGoal(false)} onSave={() => setEditGoal(false)} canSave>
            <div className="flex items-center justify-center gap-4">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => update({ workoutGoal: Math.max(1, data.workoutGoal - 1) })}
                className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Minus size={18} color="#A8A8A8" />
              </motion.button>
              <span className="text-[#F7F7F7] font-bold text-3xl w-16 text-center">{data.workoutGoal}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => update({ workoutGoal: Math.min(7, data.workoutGoal + 1) })}
                className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <Plus size={18} color="#22c55e" />
              </motion.button>
            </div>
            <p className="text-[#6F6F6F] text-xs text-center">dias por semana</p>
          </FormSheet>
        )}
      </AnimatePresence>
    </GlassCard>
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
      <SheetInput label="Data" value={date} onChange={setDate} type="date" />
      <SheetInput label="Horário" value={time} onChange={setTime} type="time" />
    </div>
  </FormSheet>;
}

function fmtDate(iso: string): string {
  if (!iso || iso === 'A definir') return 'A definir';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${parseInt(m[3])} ${months[parseInt(m[2]) - 1]}`;
}

function ConsultasCard({ data, update }: { data: HealthData; update: (patch: Partial<HealthData>) => void }) {
  const { log } = useActivity();
  const [sheet, setSheet] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Calendar size={14} color="var(--color-accent)" />
        <span className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider">Consultas</span>
      </div>
      <div className="flex flex-col gap-2">
        {data.appointments.map(ap => (
          <GlassCard key={ap.id} padding="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-mid-rgb),0.12)' }}>
                <Calendar size={18} color="var(--color-accent)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F7F7F7] font-semibold text-sm">{ap.title}</p>
                {ap.professional && <p className="text-[#A8A8A8] text-xs">{ap.professional}</p>}
                <p className="text-[#6F6F6F] text-xs">{fmtDate(ap.date)}{ap.time ? ` · ${ap.time}` : ''}</p>
              </div>
              <button onClick={() => update({ appointments: data.appointments.filter(x => x.id !== ap.id) })}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--color-danger-rgb),0.1)' }}>
                <Trash2 size={13} color="var(--color-danger)" />
              </button>
            </div>
          </GlassCard>
        ))}
        <AddButton label="Adicionar consulta" onClick={() => setSheet(true)} />
      </div>
      <AnimatePresence>
        {sheet && <AppointmentSheet onClose={() => setSheet(false)} onSave={a => { update({ appointments: [...data.appointments, a] }); log('appointment', `Consulta agendada: ${a.title}`); }} />}
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
    <SheetInput label="Horário do lembrete (opcional)" value={time} onChange={setTime} type="time" />
  </FormSheet>;
}

function MedicamentosCard({ data, update }: { data: HealthData; update: (patch: Partial<HealthData>) => void }) {
  const { log } = useActivity();
  const [sheet, setSheet] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Pill size={14} color="var(--color-accent)" />
        <span className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider">Medicamentos</span>
      </div>
      <div className="flex flex-col gap-2">
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
      </div>
      <AnimatePresence>
        {sheet && <MedicationSheet onClose={() => setSheet(false)} onSave={m => { update({ medications: [...data.medications, m] }); log('medication', `Medicamento: ${m.name}`); }} />}
      </AnimatePresence>
    </div>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl py-3"
      style={{ border: '1.5px dashed rgba(var(--color-accent-rgb),0.35)' }}>
      <Plus size={15} color="var(--color-accent)" />
      <span className="text-[var(--color-accent)] text-sm font-semibold">{label}</span>
    </motion.button>
  );
}

function SheetInput({ label, value, onChange, placeholder, autoFocus, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="text-[#6F6F6F] text-xs mb-1.5 block">{label}</label>
      <input
        autoFocus={autoFocus} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl px-3 py-3 text-[#F7F7F7] text-sm outline-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
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
          whileTap={{ scale: 0.97 }} onClick={onSave} disabled={!canSave}
          className="w-full py-3.5 rounded-2xl font-bold text-sm mt-1"
          style={{
            background: canSave ? 'linear-gradient(135deg, var(--color-start), var(--color-end))' : 'rgba(255,255,255,0.08)',
            color: canSave ? 'var(--color-on-gradient)' : '#6F6F6F',
          }}>
          Salvar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────

export function Health() {
  const { data, update } = useHealth();

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#000' }}>
      <Header />

      <div className="px-5 pt-3">
        <h1 className="text-2xl font-bold text-[#F7F7F7]">Saúde</h1>
        <p className="text-[#6F6F6F] text-sm mt-1">Água, treino, consultas e medicamentos</p>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-4">
        <WaterCard data={data} update={update} />
        <WorkoutCard data={data} update={update} />
        <ConsultasCard data={data} update={update} />
        <MedicamentosCard data={data} update={update} />
      </div>
    </div>
  );
}

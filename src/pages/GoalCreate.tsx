import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { PrimaryButton } from '../components/PrimaryButton';
import { Chip } from '../components/Chip';
import { GlassCard } from '../components/GlassCard';

const goalTypeOptions = [
  { value: 'financial', label: '💰 Financeira', desc: 'Reserva, poupança, investimento' },
  { value: 'small', label: '🎯 Pequena', desc: 'Compra menor, item do dia a dia' },
  { value: 'wish', label: '✨ Desejo', desc: 'Algo que você quer muito' },
  { value: 'care', label: '🌿 Cuidado', desc: 'Procedimento, tratamento, estética' },
  { value: 'health', label: '❤️ Saúde', desc: 'Consulta, exame, medicamento' },
];

export function GoalCreate() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');

  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ];

  const recurrenceOptions = [
    { value: 'once', label: 'Única' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'weekly', label: 'Semanal' },
  ];
  const [recurrence, setRecurrence] = useState('once');

  const canSave = selectedType && title && targetAmount;

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7] flex-1">Nova Meta</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Type selector */}
        {!selectedType && (
          <>
            <p className="text-[#A8A8A8] text-sm">Que tipo de meta você quer criar?</p>
            <div className="flex flex-col gap-2">
              {goalTypeOptions.map(opt => (
                <GlassCard
                  key={opt.value}
                  onClick={() => setSelectedType(opt.value)}
                  padding="p-4"
                >
                  <p className="text-[#F7F7F7] font-semibold">{opt.label}</p>
                  <p className="text-[#6F6F6F] text-xs mt-0.5">{opt.desc}</p>
                </GlassCard>
              ))}
            </div>
          </>
        )}

        {selectedType && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#A8A8A8]">Tipo:</span>
              <Chip
                label={goalTypeOptions.find(o => o.value === selectedType)?.label ?? selectedType}
                active
                onClick={() => setSelectedType('')}
                size="sm"
              />
            </div>

            <TextField label="Nome da meta" value={title} onChange={setTitle} placeholder="Ex: Botox" />
            <TextField label="Descrição (opcional)" value={description} onChange={setDescription} multiline rows={2} />

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Valor alvo (R$)" value={targetAmount} onChange={setTargetAmount} type="number" placeholder="0,00" />
              <TextField label="Valor inicial (R$)" value={initialAmount} onChange={setInitialAmount} type="number" placeholder="0,00" />
            </div>

            <TextField label="Data desejada" value={desiredDate} onChange={setDesiredDate} type="date" />

            <div>
              <p className="text-sm text-[#A8A8A8] font-medium mb-2">Prioridade</p>
              <div className="flex gap-2 flex-wrap">
                {priorityOptions.map(p => (
                  <Chip key={p.value} label={p.label} active={priority === p.value} onClick={() => setPriority(p.value)} size="sm" />
                ))}
              </div>
            </div>

            <SelectField label="Recorrência" value={recurrence} onChange={setRecurrence} options={recurrenceOptions} />

            <PrimaryButton fullWidth disabled={!canSave} onClick={() => navigate('/metas')}>
              Criar Meta
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}

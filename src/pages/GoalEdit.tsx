import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { PrimaryButton } from '../components/PrimaryButton';
import { Chip } from '../components/Chip';
import { useGoals } from '../contexts/GoalsContext';

const goalTypes = [
  { value: 'financial', label: 'Financeira' },
  { value: 'small', label: 'Pequena meta' },
  { value: 'wish', label: 'Desejo' },
  { value: 'care', label: 'Cuidado' },
  { value: 'health', label: 'Saúde' },
  { value: 'work', label: 'Trabalho' },
  { value: 'travel', label: 'Viagem' },
  { value: 'purchase', label: 'Compra' },
  { value: 'routine', label: 'Rotina' },
  { value: 'recurring', label: 'Recorrente' },
];

const statusOptions = [
  { value: 'planning', label: 'Planejando' },
  { value: 'active', label: 'Ativa' },
  { value: 'paused', label: 'Pausada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'archived', label: 'Arquivada' },
];

const priorityOptions = ['low', 'medium', 'high', 'urgent'] as const;
const priorityLabels: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };

const recurrenceOptions = [
  { value: 'once', label: 'Única' },
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'custom', label: 'Personalizada' },
];

export function GoalEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goals, updateGoal } = useGoals();
  const goal = goals.find(g => g.id === id) ?? goals[0];

  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? '');
  const [type, setType] = useState(goal.type);
  const [status, setStatus] = useState(goal.status);
  const [priority, setPriority] = useState(goal.priority);
  const [targetAmount, setTargetAmount] = useState(String(goal.target_amount));
  const [currentAmount, setCurrentAmount] = useState(String(goal.current_amount));
  const [desiredDate, setDesiredDate] = useState(goal.desired_date ?? '');
  const [recurrence, setRecurrence] = useState(goal.recurrence);
  const [notes, setNotes] = useState(goal.notes ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateGoal(goal.id, {
      title,
      description,
      type,
      status,
      priority,
      target_amount: parseFloat(targetAmount) || goal.target_amount,
      current_amount: parseFloat(currentAmount) || goal.current_amount,
      reserved_amount: parseFloat(currentAmount) || goal.current_amount,
      desired_date: desiredDate || undefined,
      recurrence,
      notes,
    });
    setSaved(true);
    setTimeout(() => { navigate(-1); }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7] flex-1">Editar Meta</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        <TextField label="Nome da meta" value={title} onChange={setTitle} placeholder="Ex: Londres 2026" />
        <TextField label="Descrição" value={description} onChange={setDescription} multiline rows={2} placeholder="Descreva sua meta..." />

        <SelectField label="Tipo" value={type} onChange={v => setType(v as typeof type)} options={goalTypes} />
        <SelectField label="Status" value={status} onChange={v => setStatus(v as typeof status)} options={statusOptions} />

        <div>
          <p className="text-sm text-[#A8A8A8] font-medium mb-2">Prioridade</p>
          <div className="flex gap-2">
            {priorityOptions.map(p => (
              <Chip key={p} label={priorityLabels[p]} active={priority === p} onClick={() => setPriority(p)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Valor alvo (R$)" value={targetAmount} onChange={setTargetAmount} type="number" />
          <TextField label="Valor atual (R$)" value={currentAmount} onChange={setCurrentAmount} type="number" />
        </div>

        <TextField label="Data desejada" value={desiredDate} onChange={setDesiredDate} type="date" />

        <SelectField label="Recorrência" value={recurrence} onChange={v => setRecurrence(v as typeof recurrence)} options={recurrenceOptions} />

        <TextField label="Observações" value={notes} onChange={setNotes} multiline rows={3} placeholder="Notas adicionais..." />

        <PrimaryButton fullWidth onClick={handleSave} loading={saved}>
          {saved ? <><Check size={16} /> Salvo!</> : 'Salvar alterações'}
        </PrimaryButton>
      </div>
    </div>
  );
}

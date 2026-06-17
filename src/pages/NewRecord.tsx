import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chip } from '../components/Chip';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { PrimaryButton } from '../components/PrimaryButton';
import { GlassCard } from '../components/GlassCard';

const recordTypes = ['Trabalho', 'Financeiro', 'Meta', 'Saúde', 'Cuidado'] as const;
type RecordType = typeof recordTypes[number];

const paymentOptions = [
  { value: 'pix', label: 'Pix' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'transfer', label: 'Transferência' },
];

const categoryOptions = [
  { value: 'work', label: 'Trabalho' },
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'care', label: 'Cuidado' },
  { value: 'health', label: 'Saúde' },
  { value: 'leisure', label: 'Lazer' },
];

export function NewRecord() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<RecordType>('Trabalho');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [category, setCategory] = useState('work');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Novo Registro</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Type selector */}
        <GlassCard>
          <p className="text-[#A8A8A8] text-xs font-medium mb-3">Tipo de registro</p>
          <div className="flex gap-2 flex-wrap">
            {recordTypes.map(t => (
              <Chip key={t} label={t} active={selectedType === t} onClick={() => setSelectedType(t)} size="sm" />
            ))}
          </div>
        </GlassCard>

        {/* Trabalho fields */}
        {selectedType === 'Trabalho' && (
          <>
            <TextField label="Descrição do serviço" value={description} onChange={setDescription} placeholder="Ex: Projeto Website — Empresa ABC" />
            <TextField label="Valor (R$)" value={amount} onChange={setAmount} type="number" placeholder="0,00" />
            <SelectField label="Forma de pagamento" value={paymentMethod} onChange={setPaymentMethod} options={paymentOptions} />
            <TextField label="Data" value={date} onChange={setDate} type="date" />
            <TextField label="Observação (opcional)" value={note} onChange={setNote} multiline rows={2} />
          </>
        )}

        {/* Financeiro fields */}
        {selectedType === 'Financeiro' && (
          <>
            <GlassCard padding="p-3">
              <div className="flex gap-3">
                {['Entrada', 'Saída'].map(t => (
                  <Chip key={t} label={t} active={t === 'Entrada'} size="sm" />
                ))}
              </div>
            </GlassCard>
            <TextField label="Descrição" value={description} onChange={setDescription} placeholder="Ex: Supermercado" />
            <TextField label="Valor (R$)" value={amount} onChange={setAmount} type="number" />
            <SelectField label="Categoria" value={category} onChange={setCategory} options={categoryOptions} />
            <SelectField label="Forma de pagamento" value={paymentMethod} onChange={setPaymentMethod} options={paymentOptions} />
            <TextField label="Data" value={date} onChange={setDate} type="date" />
          </>
        )}

        {/* Meta fields */}
        {selectedType === 'Meta' && (
          <>
            <TextField label="Observação" value={note} onChange={setNote} multiline rows={2} placeholder="Sobre este aporte..." />
            <TextField label="Valor (R$)" value={amount} onChange={setAmount} type="number" />
            <TextField label="Data" value={date} onChange={setDate} type="date" />
          </>
        )}

        {/* Saúde fields */}
        {selectedType === 'Saúde' && (
          <>
            <GlassCard padding="p-3">
              <div className="flex gap-2 flex-wrap">
                {['Rotina', 'Consulta', 'Medicação', 'Treino'].map(t => (
                  <Chip key={t} label={t} active={t === 'Rotina'} size="sm" />
                ))}
              </div>
            </GlassCard>
            <TextField label="Observação" value={note} onChange={setNote} multiline rows={3} />
            <TextField label="Data" value={date} onChange={setDate} type="date" />
          </>
        )}

        {/* Cuidado fields */}
        {selectedType === 'Cuidado' && (
          <>
            <GlassCard padding="p-3">
              <div className="flex gap-2 flex-wrap">
                {['Produto', 'Procedimento'].map(t => (
                  <Chip key={t} label={t} active={t === 'Produto'} size="sm" />
                ))}
              </div>
            </GlassCard>
            <TextField label="Nome do produto / procedimento" value={description} onChange={setDescription} />
            <TextField label="Valor (R$)" value={amount} onChange={setAmount} type="number" />
            <TextField label="Clínica / Profissional" value={note} onChange={setNote} />
            <TextField label="Data" value={date} onChange={setDate} type="date" />
          </>
        )}

        <PrimaryButton fullWidth onClick={() => navigate(-1)}>
          Salvar registro
        </PrimaryButton>
      </div>
    </div>
  );
}

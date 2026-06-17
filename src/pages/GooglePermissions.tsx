import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Calendar, Plus, Lightbulb, CheckCircle2, Folder, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PermissionRow } from '../components/PermissionRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';


type SyncFrequency = 'manual' | 'daily' | 'realtime';

export function GooglePermissions() {
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState({
    readCalendar: true,
    createEvents: true,
    importKeep: true,
    syncTasks: true,
    driveUpload: true,
    readGmail: true,
  });

  const [syncFreq, setSyncFreq] = useState<SyncFrequency>('realtime');

  const toggle = (key: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const freqOptions: { value: SyncFrequency; label: string; desc: string }[] = [
    { value: 'manual', label: 'Manual', desc: 'Sincronizar quando quiser' },
    { value: 'daily', label: 'Diária', desc: 'Uma vez por dia' },
    { value: 'realtime', label: 'Em tempo real', desc: 'Sincroniza instantaneamente' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Permissões Google</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        <p className="text-[#A8A8A8] text-sm">Escolha o que sincronizar</p>

        {/* Connected account */}
        <GlassCard active padding="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#4285F418' }}>
              <span className="text-xl">G</span>
            </div>
            <div className="flex-1">
              <p className="text-[#F7F7F7] font-semibold text-sm">jonathan1704.si@gmail.com</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-xs text-[#22c55e]">Conta vinculada</span>
              </div>
            </div>
            <ChevronRight size={16} color="#6F6F6F" />
          </div>
        </GlassCard>

        {/* Permissions */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: '#FF9F3D', fontSize: 14 }}>✦</span>
            <p className="text-[#F7F7F7] font-semibold text-sm">Permissões e sincronização</p>
          </div>
          <PermissionRow
            icon={<Calendar size={16} color="#FF9F3D" />}
            label="Ler agenda do Calendar"
            description="Visualize seus eventos"
            value={permissions.readCalendar}
            onChange={() => toggle('readCalendar')}
          />
          <PermissionRow
            icon={<Plus size={16} color="#FF9F3D" />}
            label="Criar eventos"
            description="Permitir que o Ebran crie eventos"
            value={permissions.createEvents}
            onChange={() => toggle('createEvents')}
          />
          <PermissionRow
            icon={<Lightbulb size={16} color="#FF9F3D" />}
            label="Importar listas do Keep"
            description="Sincronize suas notas e listas"
            value={permissions.importKeep}
            onChange={() => toggle('importKeep')}
          />
          <PermissionRow
            icon={<CheckCircle2 size={16} color="#FF9F3D" />}
            label="Sincronizar tarefas"
            description="Sincronize tarefas e lembretes"
            value={permissions.syncTasks}
            onChange={() => toggle('syncTasks')}
          />
          <PermissionRow
            icon={<Folder size={16} color="#FF9F3D" />}
            label="Upload no Drive"
            description="Armazene anexos e documentos"
            value={permissions.driveUpload}
            onChange={() => toggle('driveUpload')}
          />
          <PermissionRow
            icon={<Mail size={16} color="#FF9F3D" />}
            label="Ler recibos do Gmail"
            description="Busque e organize seus recibos"
            value={permissions.readGmail}
            onChange={() => toggle('readGmail')}
          />
        </GlassCard>

        {/* Default folder */}
        <GlassCard padding="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Folder size={15} color="#A8A8A8" />
            <p className="text-[#A8A8A8] text-sm font-medium">Pasta padrão do Drive</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Folder size={16} color="#FF9F3D" />
            <p className="text-[#F7F7F7] text-sm flex-1">Ebran / Anexos</p>
            <ChevronRight size={16} color="#6F6F6F" />
          </div>
        </GlassCard>

        {/* Sync frequency */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#A8A8A8]">⟳</span>
            <p className="text-[#A8A8A8] text-sm font-medium">Frequência</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {freqOptions.map(opt => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSyncFreq(opt.value)}
                className="rounded-2xl py-3 px-2 text-center"
                style={{
                  background: syncFreq === opt.value
                    ? 'rgba(255,111,95,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  border: syncFreq === opt.value
                    ? '1.5px solid rgba(255,111,95,0.65)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-[#F7F7F7] text-xs font-semibold">{opt.label}</p>
                <p className="text-[#6F6F6F] text-[10px] mt-0.5 leading-tight">{opt.desc}</p>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        <PrimaryButton fullWidth onClick={() => navigate(-1)}>
          Confirmar acesso
        </PrimaryButton>
        <SecondaryButton fullWidth onClick={() => navigate(-1)}>
          Depois
        </SecondaryButton>

        <p className="text-[#6F6F6F] text-xs text-center px-4">
          O Ebran nunca altera, envia ou move dados em serviços externos sem sua confirmação.
        </p>
      </div>
    </div>
  );
}

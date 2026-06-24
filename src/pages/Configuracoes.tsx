import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { ToggleSwitch } from '../components/ToggleSwitch';

export function Configuracoes() {
  const navigate = useNavigate();
  const [notifFoco, setNotifFoco] = useState(true);
  const [notifMetas, setNotifMetas] = useState(true);
  const [notifFinancas, setNotifFinancas] = useState(false);
  const [notifSaude, setNotifSaude] = useState(true);

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Configurações</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Notificações */}
        <GlassCard>
          <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-4">Notificações</p>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Foco diário', desc: 'Lembretes de itens pendentes', value: notifFoco, onChange: setNotifFoco },
              { label: 'Metas', desc: 'Atualizações de progresso', value: notifMetas, onChange: setNotifMetas },
              { label: 'Finanças', desc: 'Alertas de lançamentos', value: notifFinancas, onChange: setNotifFinancas },
              { label: 'Saúde', desc: 'Lembretes de hábitos e medicamentos', value: notifSaude, onChange: setNotifSaude },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[#F7F7F7] text-sm font-medium">{item.label}</p>
                  <p className="text-[#6F6F6F] text-xs mt-0.5">{item.desc}</p>
                </div>
                <ToggleSwitch value={item.value} onChange={item.onChange} size="sm" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* App */}
        <GlassCard>
          <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-3">Sobre o app</p>
          {[
            { label: 'Versão', value: '1.0.0' },
            { label: 'Idioma', value: 'Português (BR)' },
            { label: 'Tema', value: 'Escuro' },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
            >
              <span className="text-[#A8A8A8] text-sm">{label}</span>
              <span className="text-[#F7F7F7] text-sm">{value}</span>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

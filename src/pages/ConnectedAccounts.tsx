import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { IntegrationCard } from '../components/IntegrationCard';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { mockGoogleIntegrations } from '../data/mockData';
import type { GoogleIntegration } from '../lib/types';

export function ConnectedAccounts() {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<GoogleIntegration[]>(mockGoogleIntegrations);
  const [smartSync, setSmartSync] = useState(true);

  const handleConnect = (service: string) => {
    setIntegrations(prev =>
      prev.map(i => i.service === service
        ? { ...i, connected: true, account_email: 'jonathan1704.si@gmail.com' }
        : i
      )
    );
  };

  const handleManage = (_service: string) => {
    navigate('/permissoes-google');
  };

  const connectedAccount = integrations.find(i => i.connected);

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Conectar contas</h1>
      </div>

      <div className="px-5 flex flex-col gap-3">
        <p className="text-[#A8A8A8] text-sm">Integre seu ecossistema</p>

        {/* Google master account */}
        {connectedAccount && (
          <GlassCard active>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#4285F418' }}>
                <span className="text-xl">G</span>
              </div>
              <div className="flex-1">
                <p className="text-[#F7F7F7] font-semibold text-sm">Google conectada</p>
                <p className="text-[#A8A8A8] text-xs">{connectedAccount.account_email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-xs text-[#22c55e]">Sincronização ativa</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ border: '1px solid rgba(255,111,95,0.5)', color: '#FF6B5F' }}
              >
                Gerenciar
              </motion.button>
            </div>
          </GlassCard>
        )}

        {/* Services */}
        <div className="flex flex-col gap-2">
          {integrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={() => handleConnect(integration.service)}
              onManage={() => handleManage(integration.service)}
            />
          ))}
        </div>

        {/* Smart sync toggle */}
        <GlassCard>
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,211,74,0.12)' }}
            >
              <Sparkles size={18} color="#FFD84A" />
            </div>
            <div className="flex-1">
              <p className="text-[#F7F7F7] font-semibold text-sm">Sincronização inteligente</p>
              <p className="text-[#6F6F6F] text-xs mt-0.5">
                Ative para conectar e organizar: agenda, checklist, uploads, notas e comprovantes.
              </p>
            </div>
            <ToggleSwitch value={smartSync} onChange={setSmartSync} size="sm" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { IntegrationCard } from '../components/IntegrationCard';
import { mockGoogleIntegrations } from '../data/mockData';
import type { GoogleIntegration } from '../lib/types';

const CONNECTIONS_KEY = 'ebran:connections:v1';

function loadConnections(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CONNECTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveConnections(map: Record<string, boolean>) {
  try { localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(map)); } catch {}
}

export function ConnectedAccounts() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState<Record<string, boolean>>(loadConnections);

  const [integrations] = useState<GoogleIntegration[]>(mockGoogleIntegrations);

  const hydratedIntegrations = integrations.map(i => ({
    ...i,
    connected: connections[i.service] ?? false,
    account_email: connections[i.service] ? 'jonathan1704.si@gmail.com' : undefined,
  }));

  const handleConnect = (service: string) => {
    const next = { ...connections, [service]: true };
    setConnections(next);
    saveConnections(next);
  };

  const handleManage = (_service: string) => {
    navigate('/permissoes-google');
  };

  const anyConnected = Object.values(connections).some(Boolean);

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Conectar contas</h1>
      </div>

      <div className="px-5 flex flex-col gap-3">
        <p className="text-[#A8A8A8] text-sm">Integre seu ecossistema Google</p>

        {/* Notice about OAuth setup */}
        <div
          className="flex gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(255,216,74,0.07)', border: '1px solid rgba(255,216,74,0.2)' }}
        >
          <Info size={16} color="#FFD84A" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#FFD84A] text-xs font-semibold mb-1">Integração em configuração</p>
            <p className="text-[#A8A8A8] text-xs leading-relaxed">
              A conexão real com Google requer um <span className="text-[#F7F7F7]">Google OAuth Client ID</span>.
              Por enquanto, as seleções aqui são salvas localmente. Para ativar a sincronização real,
              é necessário configurar o projeto no Google Cloud Console.
            </p>
          </div>
        </div>

        {/* Connected account header */}
        {anyConnected && (
          <GlassCard>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base"
                style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}
              >
                G
              </div>
              <div className="flex-1">
                <p className="text-[#F7F7F7] font-semibold text-sm">Conta Google</p>
                <p className="text-[#A8A8A8] text-xs">jonathan1704.si@gmail.com</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-xs text-[#22c55e]">Serviços selecionados</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const cleared = Object.fromEntries(Object.keys(connections).map(k => [k, false]));
                  setConnections(cleared);
                  saveConnections(cleared);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ border: '1px solid rgba(255,107,95,0.4)', color: '#FF6B5F' }}
              >
                Desconectar
              </motion.button>
            </div>
          </GlassCard>
        )}

        {/* Services */}
        <div className="flex flex-col gap-2">
          {hydratedIntegrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={() => handleConnect(integration.service)}
              onManage={() => handleManage(integration.service)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

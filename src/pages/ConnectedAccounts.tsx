import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { mockGoogleIntegrations } from '../data/mockData';
import type { GoogleIntegration } from '../lib/types';
import {
  preInitClients,
  requestTokenSync,
  disconnectService,
  isServiceConnected,
  getStoredToken,
  hasPublicApi,
} from '../lib/googleAuth';

function hydrateIntegrations(base: GoogleIntegration[]): GoogleIntegration[] {
  return base.map(i => {
    const token = getStoredToken(i.service);
    return { ...i, connected: !!token, account_email: token?.email };
  });
}

const serviceInfo: Record<string, { label: string; desc: string; emoji: string; color: string }> = {
  calendar: { label: 'Google Calendar', desc: 'Sincronize consultas, treinos e compromissos.', emoji: '📅', color: '#4285F4' },
  drive:    { label: 'Google Drive',    desc: 'Organize arquivos, comprovantes e anexos.',    emoji: '📂', color: '#0F9D58' },
  tasks:    { label: 'Google Tasks',    desc: 'Sincronize foco diário, checklist e lembretes.', emoji: '✅', color: '#F4B400' },
  gmail:    { label: 'Gmail',           desc: 'Detecte recibos e documentos financeiros.',     emoji: '📧', color: '#EA4335' },
  keep:     { label: 'Google Keep',     desc: 'API pública indisponível no momento.',          emoji: '📝', color: '#FBBC04' },
};

export function ConnectedAccounts() {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<GoogleIntegration[]>(
    () => hydrateIntegrations(mockGoogleIntegrations)
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [clientsReady, setClientsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setIntegrations(hydrateIntegrations(mockGoogleIntegrations));
  }, []);

  // Pre-init GIS clients on mount so requestAccessToken can be called synchronously on tap
  useEffect(() => {
    preInitClients((service, result) => {
      setLoading(prev => prev === service ? null : prev);
      if (result.success) {
        refresh();
        setError(null);
      } else {
        setError('Não foi possível conectar. Tente novamente.');
      }
    }).then(() => setClientsReady(true));
  }, [refresh]);

  // This is called directly from the tap handler — synchronous to satisfy iOS Safari
  const handleConnect = (service: string) => {
    if (!clientsReady) {
      setError('Aguarde um momento e tente novamente.');
      return;
    }
    setLoading(service);
    setError(null);
    const firstTime = !isServiceConnected(service);
    const triggered = requestTokenSync(service, firstTime);
    if (!triggered) {
      setLoading(null);
      setError('Erro ao abrir autenticação. Recarregue a página.');
    }
  };

  const handleDisconnect = (service: string) => {
    disconnectService(service);
    refresh();
  };

  const connectedCount = integrations.filter(i => isServiceConnected(i.service)).length;
  const connectedEmail = integrations.find(i => i.connected)?.account_email;

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Conectar contas</h1>
      </div>

      <div className="px-5 flex flex-col gap-3">
        <p className="text-[#A8A8A8] text-sm mb-1">Integre seu ecossistema Google</p>

        {connectedCount > 0 && connectedEmail && (
          <GlassCard>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}
              >
                G
              </div>
              <div className="flex-1">
                <p className="text-[#F7F7F7] font-semibold text-sm">Conta Google</p>
                <p className="text-[#A8A8A8] text-xs">{connectedEmail}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-xs text-[#22c55e]">
                    {connectedCount} serviço{connectedCount > 1 ? 's' : ''} conectado{connectedCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {error && (
          <div
            className="px-4 py-3 rounded-2xl text-xs"
            style={{ background: 'rgba(255,107,95,0.1)', border: '1px solid rgba(255,107,95,0.25)', color: '#FF6B5F' }}
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {integrations.map(integration => {
            const info = serviceInfo[integration.service];
            const isConnected = integration.connected;
            const isLoading = loading === integration.service;
            const noApi = !hasPublicApi(integration.service);

            return (
              <div
                key={integration.id}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: 'rgba(18,18,18,0.72)',
                  border: `1px solid ${isConnected ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  opacity: noApi ? 0.45 : 1,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: `${info.color}22` }}
                >
                  {info.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[#F7F7F7] font-semibold text-sm">{info.label}</p>
                  {isConnected && integration.account_email ? (
                    <>
                      <p className="text-[#A8A8A8] text-xs truncate">{integration.account_email}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                        <span className="text-[10px] text-[#22c55e]">Conectado</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[#6F6F6F] text-xs mt-0.5">{info.desc}</p>
                  )}
                </div>

                {noApi ? (
                  <span
                    className="text-[10px] text-[#3F3F3F] font-medium px-2 py-1 rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    Em breve
                  </span>
                ) : isLoading ? (
                  <div className="px-3 py-1.5 flex-shrink-0">
                    <Loader2 size={16} color="#FF9F3D" className="animate-spin" />
                  </div>
                ) : isConnected ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDisconnect(integration.service)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
                    style={{ border: '1px solid rgba(255,107,95,0.4)', color: '#FF6B5F' }}
                  >
                    Desconectar
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleConnect(integration.service)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
                    style={{ background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.3)', color: '#4285F4' }}
                  >
                    Conectar
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[#3F3F3F] text-[10px] text-center px-4 mt-1">
          Ao conectar, o Google solicitará permissão. Você pode revogar o acesso a qualquer momento.
        </p>
      </div>
    </div>
  );
}

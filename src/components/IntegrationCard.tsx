import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { GoogleIntegration } from '../lib/types';

const serviceInfo: Record<string, { label: string; desc: string; color: string }> = {
  calendar: { label: 'Google Calendar', desc: 'Sincronize agenda, treinos, prazos e compromissos.', color: '#4285F4' },
  drive: { label: 'Google Drive', desc: 'Envie e organize arquivos, comprovantes e anexos.', color: '#0F9D58' },
  tasks: { label: 'Google Tasks', desc: 'Sincronize foco diário, checklist e lembretes.', color: '#F4B400' },
  keep: { label: 'Google Keep', desc: 'Importe notas e listas do Google Keep.', color: '#F4B400' },
  gmail: { label: 'Gmail', desc: 'Detecte recibos, comprovantes e documentos financeiros.', color: '#EA4335' },
};

interface IntegrationCardProps {
  integration: GoogleIntegration;
  onConnect?: () => void;
  onManage?: () => void;
}

export function IntegrationCard({ integration, onConnect, onManage }: IntegrationCardProps) {
  const info = serviceInfo[integration.service];
  const isConnected = integration.connected;

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: 'rgba(18,18,18,0.72)',
        border: `1px solid ${isConnected ? 'rgba(255,111,95,0.3)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${info.color}22` }}
      >
        <span className="text-xl">
          {integration.service === 'calendar' ? '📅'
            : integration.service === 'drive' ? '📂'
            : integration.service === 'tasks' ? '✅'
            : integration.service === 'keep' ? '📝'
            : '📧'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[#F7F7F7] font-semibold text-sm">{info.label}</p>
        {isConnected && integration.account_email && (
          <p className="text-[#A8A8A8] text-xs">{integration.account_email}</p>
        )}
        {isConnected ? (
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-xs text-[#22c55e]">Sincronizado</span>
          </div>
        ) : (
          <p className="text-[#6F6F6F] text-xs mt-0.5">{info.desc}</p>
        )}
      </div>

      {isConnected ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onManage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{
            border: '1px solid rgba(255,111,95,0.5)',
            color: '#FF6B5F',
          }}
        >
          Gerenciar
          <ChevronRight size={14} />
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onConnect}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{
            border: '1px solid rgba(255,111,95,0.5)',
            color: '#FF6B5F',
          }}
        >
          Conectar
        </motion.button>
      )}
    </motion.div>
  );
}

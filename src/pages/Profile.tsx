import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Target, Bell, Shield, Lock, Link2, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { mockUser } from '../data/mockData';

const menuItems = [
  { icon: User, label: 'Meu perfil', to: '/perfil', color: '#FF9F3D' },
  { icon: Settings, label: 'Configurações', to: '/perfil', color: '#A8A8A8' },
  { icon: Target, label: 'Metas financeiras', to: '/metas', color: '#FF6B5F' },
  { icon: Bell, label: 'Notificações', to: '/perfil', color: '#FFD84A' },
  { icon: Shield, label: 'Privacidade', to: '/perfil', color: '#a78bfa' },
  { icon: Lock, label: 'Segurança', to: '/perfil', color: '#A8A8A8' },
  { icon: Link2, label: 'Conectar contas', to: '/contas', color: '#4285F4' },
  { icon: HelpCircle, label: 'Ajuda e suporte', to: '/perfil', color: '#A8A8A8' },
];

export function Profile() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Perfil</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div
            className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-3"
            style={{
              background: 'rgba(28,28,30,0.85)',
              border: '2px solid rgba(255,111,95,0.5)',
              boxShadow: '0 0 24px rgba(255,111,95,0.2)',
            }}
          >
            <User size={32} color="#A8A8A8" />
          </div>
          <h2 className="text-[#F7F7F7] font-bold text-xl">{mockUser.name}</h2>
          <p className="text-[#A8A8A8] text-sm mt-1">{mockUser.email}</p>
          <div
            className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(255,216,74,0.15), rgba(255,47,125,0.15))',
              border: '1px solid rgba(255,111,95,0.3)',
              color: '#FF9F3D',
            }}
          >
            {mockUser.brand}
          </div>
        </div>

        {/* Menu */}
        <GlassCard padding="p-0">
          {menuItems.map(({ icon: Icon, label, to, color }, i) => (
            <motion.button
              key={label}
              whileTap={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left"
              style={{ borderBottom: i < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon size={16} color={color} />
              </div>
              <span className="text-[#F7F7F7] text-sm flex-1">{label}</span>
              <ChevronRight size={14} color="#6F6F6F" />
            </motion.button>
          ))}
        </GlassCard>

        {/* Logout */}
        <GlassCard padding="p-0">
          <motion.button
            whileTap={{ backgroundColor: 'rgba(255,47,125,0.05)' }}
            onClick={() => navigate('/entrar')}
            className="w-full flex items-center gap-3 px-4 py-4"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FF2F7D18' }}>
              <LogOut size={16} color="#FF2F7D" />
            </div>
            <span className="text-[#FF2F7D] text-sm font-medium">Sair da conta</span>
          </motion.button>
        </GlassCard>
      </div>
    </div>
  );
}

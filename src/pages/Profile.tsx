import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Target, Link2, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { mockUser } from '../data/mockData';

const PROFILE_KEY = 'ebran:profile:v1';
const AVATAR_KEY = 'ebran:avatar:v1';

const menuItems = [
  { icon: User, label: 'Meu perfil', to: '/meu-perfil', color: 'var(--color-accent)' },
  { icon: Settings, label: 'Configurações', to: '/configuracoes', color: '#A8A8A8' },
  { icon: Target, label: 'Metas financeiras', to: '/metas', color: 'var(--color-danger)' },
  { icon: Link2, label: 'Conectar contas', to: '/contas', color: '#4285F4' },
];

export function Profile() {
  const navigate = useNavigate();
  // Lidos no inicializador (e não num efeito) para foto e nome já aparecerem
  // no primeiro render, sem piscar os valores padrão antes.
  const [avatar] = useState<string | null>(() => {
    try { return localStorage.getItem(AVATAR_KEY); } catch { return null; }
  });
  const [displayName] = useState(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { name: string };
        if (data.name) return data.name;
      }
    } catch { /* usa o padrão abaixo */ }
    return mockUser.name;
  });

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
            className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-3 overflow-hidden"
            style={{
              background: 'rgba(28,28,30,0.85)',
              border: '2px solid rgba(var(--color-mid-rgb),0.5)',
              boxShadow: '0 0 24px rgba(var(--color-mid-rgb),0.2)',
            }}
          >
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} color="#A8A8A8" />
            )}
          </div>
          <h2 className="text-[#F7F7F7] font-bold text-xl">{displayName}</h2>
          <p className="text-[#A8A8A8] text-sm mt-1">{mockUser.email}</p>
          <div
            className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--color-start-rgb),0.15), rgba(var(--color-end-rgb),0.15))',
              border: '1px solid rgba(var(--color-mid-rgb),0.3)',
              color: 'var(--color-accent)',
            }}
          >
            Ebran
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
                style={{ background: `color-mix(in srgb, ${color} 9%, transparent)` }}
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
            whileTap={{ backgroundColor: 'rgba(var(--color-end-rgb),0.05)' }}
            onClick={() => navigate('/entrar')}
            className="w-full flex items-center gap-3 px-4 py-4"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--color-end-rgb), 0.09)' }}>
              <LogOut size={16} color="var(--color-end)" />
            </div>
            <span className="text-[var(--color-end)] text-sm font-medium">Sair da conta</span>
          </motion.button>
        </GlassCard>
      </div>
    </div>
  );
}

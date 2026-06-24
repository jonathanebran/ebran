import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { mockUser } from '../data/mockData';

export function MeuPerfil() {
  const navigate = useNavigate();
  const [name, setName] = useState(mockUser.name);
  const [brand, setBrand] = useState(mockUser.brand ?? '');

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Meu perfil</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-[22px] flex items-center justify-center"
              style={{
                background: 'rgba(28,28,30,0.85)',
                border: '2px solid rgba(255,111,95,0.5)',
                boxShadow: '0 0 24px rgba(255,111,95,0.15)',
              }}
            >
              <User size={32} color="#A8A8A8" />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFD84A, #FF2F7D)' }}
            >
              <Camera size={13} color="#000" />
            </motion.button>
          </div>
        </div>

        {/* Fields */}
        <GlassCard>
          <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-4">Informações</p>

          <div className="mb-4">
            <label className="text-[#6F6F6F] text-xs mb-2 block">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl px-3 py-3 text-[#F7F7F7] text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Seu nome"
            />
          </div>

          <div className="mb-4">
            <label className="text-[#6F6F6F] text-xs mb-2 block">Email</label>
            <div
              className="w-full rounded-xl px-3 py-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[#6F6F6F] text-sm">{mockUser.email}</p>
            </div>
            <p className="text-[#6F6F6F] text-[10px] mt-1 px-1">Email não pode ser alterado aqui</p>
          </div>

          <div>
            <label className="text-[#6F6F6F] text-xs mb-2 block">Marca / Identidade</label>
            <input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="w-full rounded-xl px-3 py-3 text-[#F7F7F7] text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Sua marca"
            />
          </div>
        </GlassCard>

        <PrimaryButton fullWidth onClick={() => navigate(-1)}>
          Salvar alterações
        </PrimaryButton>
      </div>
    </div>
  );
}

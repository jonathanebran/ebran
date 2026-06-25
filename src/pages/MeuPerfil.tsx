import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { mockUser } from '../data/mockData';

const PROFILE_KEY = 'ebran:profile:v1';
const AVATAR_KEY = 'ebran:avatar:v1';

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) as { name: string } : null;
  } catch { return null; }
}

export function MeuPerfil() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedProfile = loadProfile();
  const [name, setName] = useState(savedProfile?.name ?? mockUser.name);
  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem(AVATAR_KEY));
  const [saved, setSaved] = useState(false);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      localStorage.setItem(AVATAR_KEY, base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name }));
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate(-1); }, 900);
  };

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
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePhotoClick}
              className="w-24 h-24 rounded-[26px] flex items-center justify-center overflow-hidden"
              style={{
                background: 'rgba(28,28,30,0.85)',
                border: '2px solid rgba(255,111,95,0.5)',
                boxShadow: '0 0 24px rgba(255,111,95,0.15)',
              }}
            >
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={36} color="#A8A8A8" />
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePhotoClick}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFD84A, #FF2F7D)' }}
            >
              <Camera size={14} color="#000" />
            </motion.button>
          </div>
          <p className="text-[#6F6F6F] text-xs mt-3">Toque na foto para alterar</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

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

          <div>
            <label className="text-[#6F6F6F] text-xs mb-2 block">Email</label>
            <div
              className="w-full rounded-xl px-3 py-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[#6F6F6F] text-sm">{mockUser.email}</p>
            </div>
            <p className="text-[#6F6F6F] text-[10px] mt-1 px-1">O email é vinculado à sua conta e não pode ser alterado</p>
          </div>
        </GlassCard>

        <PrimaryButton fullWidth onClick={handleSave}>
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Check size={16} color="#000" />
                Salvo!
              </motion.span>
            ) : (
              <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Salvar alterações
              </motion.span>
            )}
          </AnimatePresence>
        </PrimaryButton>
      </div>
    </div>
  );
}

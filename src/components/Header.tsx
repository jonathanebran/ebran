import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLogo } from './AppLogo';
import { mockUser } from '../data/mockData';

const AVATAR_KEY = 'ebran:avatar:v1';
const PROFILE_KEY = 'ebran:profile:v1';

interface HeaderProps {
  showGreeting?: boolean;
}

export function Header({ showGreeting = false }: HeaderProps) {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(mockUser.name.split(' ')[0]);

  useEffect(() => {
    setAvatar(localStorage.getItem(AVATAR_KEY));
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { name: string };
        if (data.name) setFirstName(data.name.split(' ')[0]);
      }
    } catch { /* keep default */ }
  }, []);

  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => navigate('/')}>
          <AppLogo size={38} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/perfil')}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{
            background: 'rgba(28,28,30,0.85)',
            border: '1.5px solid rgba(255,111,95,0.5)',
          }}
        >
          {avatar ? (
            <img src={avatar} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <User size={18} color="#A8A8A8" />
          )}
        </motion.button>
      </div>

      {showGreeting && (
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-[#F7F7F7] leading-tight">
            Boa noite, {firstName}.
          </h1>
          <p className="text-[#A8A8A8] text-sm mt-1">Tudo sob controle. Vamos em frente.</p>
        </div>
      )}
    </div>
  );
}

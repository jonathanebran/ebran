import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLogo } from '../components/AppLogo';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

const googleFeatures = [
  { emoji: '📅', label: 'Google Calendar', desc: 'Agenda e compromissos' },
  { emoji: '📂', label: 'Google Drive', desc: 'Arquivos e anexos' },
  { emoji: '✅', label: 'Google Tasks', desc: 'Tarefas e lembretes' },
  { emoji: '📝', label: 'Google Keep', desc: 'Notas e listas' },
  { emoji: '📧', label: 'Gmail', desc: 'Recibos e comprovantes' },
];

export function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) return;
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      navigate('/');
      return;
    }

    const { error: err } = await signUp(email, password, name);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5" style={{ background: '#000' }}>
        <AppLogo size={56} className="mb-6" />
        <h2 className="text-2xl font-bold text-[#F7F7F7] mb-3">Verifique seu e-mail</h2>
        <p className="text-[#A8A8A8] text-sm text-center mb-8">
          Enviamos um link de confirmação para <span style={{ color: '#FF9F3D' }}>{email}</span>.
          Clique no link e depois faça login.
        </p>
        <PrimaryButton onClick={() => navigate('/entrar')}>Ir para o login</PrimaryButton>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center min-h-screen px-5 pt-16 pb-10"
      style={{ background: '#000' }}
    >
      <AppLogo size={56} className="mb-6" />
      <h1 className="text-3xl font-bold text-[#F7F7F7] mb-1">Criar conta</h1>
      <p className="text-[#A8A8A8] text-sm mb-8">Seu ecossistema pessoal começa aqui</p>

      <div className="w-full flex flex-col gap-3 max-w-sm">
        <TextField label="Nome" value={name} onChange={setName} placeholder="Jonathan Matheus" />
        <TextField label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seu@email.com" />
        <TextField label="Senha" value={password} onChange={setPassword} type="password" placeholder="••••••••" />

        {error && (
          <p className="text-xs text-center" style={{ color: '#FF6B5F' }}>{error}</p>
        )}

        <PrimaryButton
          fullWidth
          onClick={handleSignup}
          disabled={!name || !email || !password || loading}
        >
          {loading ? 'Criando conta…' : 'Criar conta'}
        </PrimaryButton>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[#6F6F6F] text-xs">ou</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <SecondaryButton fullWidth onClick={() => navigate('/')}>
          <span>G</span> Continuar com Google
        </SecondaryButton>

        <GlassCard className="mt-2">
          <p className="text-[#A8A8A8] text-xs font-medium mb-3">
            Ao conectar o Google, você integra automaticamente:
          </p>
          <div className="flex flex-col gap-2">
            {googleFeatures.map(f => (
              <div key={f.label} className="flex items-center gap-2">
                <span className="text-base">{f.emoji}</span>
                <div>
                  <span className="text-[#F7F7F7] text-xs font-semibold">{f.label}</span>
                  <span className="text-[#6F6F6F] text-xs"> — {f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <motion.button
          onClick={() => navigate('/entrar')}
          className="text-sm text-center mt-2"
          style={{ color: '#A8A8A8' }}
        >
          Já tem conta? <span style={{ color: '#FF9F3D' }}>Entrar</span>
        </motion.button>
      </div>
    </div>
  );
}

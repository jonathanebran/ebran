import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLogo } from '../components/AppLogo';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      navigate('/');
      return;
    }

    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.includes('Invalid') ? 'E-mail ou senha incorretos.' : err);
    } else {
      navigate('/');
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-5 pb-10"
      style={{ background: '#000' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        <AppLogo size={64} className="mb-6" />
        <h1 className="text-3xl font-bold text-[#F7F7F7] mb-1">Bem-vindo</h1>
        <p className="text-[#A8A8A8] text-sm mb-10">Entre na sua conta Ebran</p>

        <div className="w-full flex flex-col gap-3">
          <TextField
            label="E-mail"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="jonathan@email.com"
          />
          <TextField
            label="Senha"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="••••••••"
          />

          <motion.button className="text-right text-xs mb-1" style={{ color: '#FF9F3D' }}>
            Esqueci a senha
          </motion.button>

          {error && (
            <p className="text-xs text-center" style={{ color: '#FF6B5F' }}>{error}</p>
          )}

          <PrimaryButton
            fullWidth
            onClick={handleLogin}
            disabled={!email || !password || loading}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </PrimaryButton>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-[#6F6F6F] text-xs">ou</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <SecondaryButton fullWidth onClick={() => navigate('/')}>
            <span className="font-bold">G</span> Continuar com Google
          </SecondaryButton>

          <motion.button
            onClick={() => navigate('/cadastro')}
            className="text-sm text-center mt-3"
            style={{ color: '#A8A8A8' }}
          >
            Não tem conta? <span style={{ color: '#FF9F3D' }}>Criar agora</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

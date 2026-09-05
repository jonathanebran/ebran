import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { AppLogo } from './components/AppLogo';
import { GoalsProvider } from './contexts/GoalsContext';
import { DailyFocusProvider } from './contexts/DailyFocusContext';
import { HealthProvider } from './contexts/HealthContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { WorkProvider } from './contexts/WorkContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PinLockProvider, usePinLock } from './contexts/PinLockContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PinLock } from './pages/PinLock';
import { useGoogleAutoRefresh } from './hooks/useGoogleAutoRefresh';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { DailyFocus } from './pages/DailyFocus';
import { Goals } from './pages/Goals';
import { GoalDetail } from './pages/GoalDetail';
import { GoalEdit } from './pages/GoalEdit';
import { GoalCreate } from './pages/GoalCreate';
import { Health } from './pages/Health';
import { Finance } from './pages/Finance';
import { Work } from './pages/Work';
import { NewRecord } from './pages/NewRecord';
import { AIHub } from './pages/AIHub';
import { Profile } from './pages/Profile';
import { ConnectedAccounts } from './pages/ConnectedAccounts';
import { GooglePermissions } from './pages/GooglePermissions';
import { EconomyMode } from './pages/EconomyMode';
import { MeuPerfil } from './pages/MeuPerfil';
import { Configuracoes } from './pages/Configuracoes';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// O assistente (/ai-hub) fica de fora: tem barra de mensagem própria embaixo,
// e a barra flutuante ficaria por cima dela.
const mainRoutes = ['/', '/metas', '/trabalho', '/financas', '/foco', '/saude', '/perfil'];

function AppContent() {
  useGoogleAutoRefresh();
  const location = useLocation();
  const showNav = mainRoutes.some(r => location.pathname === r);

  return (
    <div className="relative min-h-screen" style={{ background: '#000', maxWidth: 430, margin: '0 auto', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/foco" element={<DailyFocus />} />
            <Route path="/metas" element={<Goals />} />
            <Route path="/metas/nova" element={<GoalCreate />} />
            <Route path="/metas/:id" element={<GoalDetail />} />
            <Route path="/metas/:id/editar" element={<GoalEdit />} />
            <Route path="/saude" element={<Health />} />
            <Route path="/financas" element={<Finance />} />
            <Route path="/trabalho" element={<Work />} />
            <Route path="/novo-registro" element={<NewRecord />} />
            <Route path="/ai" element={<AIHub />} />
            <Route path="/ai-hub" element={<AIHub />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/contas" element={<ConnectedAccounts />} />
            <Route path="/permissoes-google" element={<GooglePermissions />} />
            <Route path="/modo-economia" element={<EconomyMode />} />
            <Route path="/meu-perfil" element={<MeuPerfil />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/cadastro" element={<Signup />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav />}
    </div>
  );
}

function PinGate({ children }: { children: React.ReactNode }) {
  const { isLocked } = usePinLock();
  if (isLocked) return <PinLock />;
  return <>{children}</>;
}

function AuthSplash() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#000' }}>
      <AppLogo size={56} />
    </div>
  );
}

/**
 * Portão de autenticação. Quando o Supabase está configurado, exige login:
 * usuário deslogado só enxerga Login/Cadastro. Sem Supabase (dev local sem
 * variáveis), deixa passar direto para não quebrar o modo local.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured) return <>{children}</>;
  if (loading) return <AuthSplash />;
  if (!user) {
    return (
      <Routes>
        <Route path="/cadastro" element={<Signup />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <PinLockProvider>
        <PinGate>
          <BrowserRouter>
            <AuthProvider>
              <AuthGate>
                <ThemeProvider>
                  <ProfileProvider>
                  <ActivityProvider>
                    <FinanceProvider>
                      <WorkProvider>
                      <HealthProvider>
                        <GoalsProvider>
                          <DailyFocusProvider>
                            <AppContent />
                          </DailyFocusProvider>
                        </GoalsProvider>
                      </HealthProvider>
                      </WorkProvider>
                    </FinanceProvider>
                  </ActivityProvider>
                  </ProfileProvider>
                </ThemeProvider>
              </AuthGate>
            </AuthProvider>
          </BrowserRouter>
        </PinGate>
      </PinLockProvider>
    </ErrorBoundary>
  );
}

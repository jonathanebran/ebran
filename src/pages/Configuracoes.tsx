import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Delete, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { usePinLock } from '../contexts/PinLockContext';

// ─── Inline PIN setup numpad ───────────────────────────────────────────────────

type SetupStep = 'enter' | 'confirm';

function PinSetupOverlay({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { setPin } = usePinLock();
  const [step, setStep] = useState<SetupStep>('enter');
  const [first, setFirst] = useState('');
  const [current, setCurrent] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (current.length >= 4) return;
    const next = current + d;
    setCurrent(next);
    if (next.length === 4) {
      if (step === 'enter') {
        setTimeout(() => { setFirst(next); setCurrent(''); setStep('confirm'); }, 200);
      } else {
        if (next === first) {
          setPin(next).then(onDone);
        } else {
          setShake(true);
          setTimeout(() => { setShake(false); setCurrent(''); }, 600);
        }
      }
    }
  };

  const handleDelete = () => setCurrent(p => p.slice(0, -1));

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.96)', maxWidth: 430, margin: '0 auto' }}
    >
      <div className="mb-8 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(255,159,61,0.15)' }}
        >
          <Shield size={22} color="#FF9F3D" />
        </div>
        <p className="text-[#F7F7F7] font-bold text-lg">
          {step === 'enter' ? 'Crie um PIN de 4 dígitos' : 'Confirme seu PIN'}
        </p>
        <p className="text-[#6F6F6F] text-sm mt-1">
          {step === 'enter'
            ? 'Escolha um PIN para proteger o app'
            : 'Digite o mesmo PIN novamente'}
        </p>
      </div>

      <motion.div
        className="flex gap-5 mb-8"
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-4 h-4 rounded-full transition-all duration-150"
            style={{
              background: current.length > i
                ? 'linear-gradient(135deg, #FFD84A, #FF2F7D)'
                : 'rgba(255,255,255,0.15)',
              boxShadow: current.length > i ? '0 0 12px rgba(255,159,61,0.7)' : 'none',
              transform: current.length > i ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </motion.div>

      {shake && (
        <p className="text-[#FF6B5F] text-sm mb-4">PINs não coincidem. Tente novamente.</p>
      )}
      {!shake && <div className="mb-4 h-5" />}

      <div className="grid grid-cols-3 gap-3 w-full px-8" style={{ maxWidth: 300 }}>
        {keys.map((k, i) => {
          if (k === '') return <div key={i} />;
          if (k === 'del') return (
            <motion.button
              key="del"
              whileTap={{ scale: 0.85 }}
              onClick={handleDelete}
              className="h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <Delete size={20} color="#A8A8A8" />
            </motion.button>
          );
          return (
            <motion.button
              key={k}
              whileTap={{ scale: 0.85, backgroundColor: 'rgba(255,159,61,0.15)' }}
              onClick={() => handleDigit(k)}
              className="h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <span className="text-[#F7F7F7] text-xl font-semibold">{k}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        className="mt-10 text-[#6F6F6F] text-sm"
      >
        Cancelar
      </motion.button>
    </div>
  );
}

// ─── Notification prefs storage ───────────────────────────────────────────────

const NOTIF_KEY = 'ebran:notif:v1';

interface NotifPrefs { foco: boolean; metas: boolean; financas: boolean; saude: boolean }

function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : { foco: true, metas: true, financas: false, saude: true };
  } catch { return { foco: true, metas: true, financas: false, saude: true }; }
}

function saveNotifPrefs(prefs: NotifPrefs) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs)); } catch {}
}

// ─── Main settings page ────────────────────────────────────────────────────────

const AUTO_LOCK_OPTIONS = [
  { label: '1 min', value: 1 },
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: 'Nunca', value: 0 },
];

export function Configuracoes() {
  const navigate = useNavigate();
  const { hasPinSet, removePin, setAutoLockMinutes, autoLockMinutes } = usePinLock();

  const [notifs, setNotifs] = useState<NotifPrefs>(loadNotifPrefs);

  const updateNotif = (key: keyof NotifPrefs, value: boolean) => {
    const next = { ...notifs, [key]: value };
    setNotifs(next);
    saveNotifPrefs(next);
  };

  const [setupMode, setSetupMode] = useState<'create' | 'change' | null>(null);

  // Keep local toggle state in sync with context
  const [pinEnabled, setPinEnabled] = useState(hasPinSet);
  useEffect(() => { setPinEnabled(hasPinSet); }, [hasPinSet]);

  const handlePinToggle = (enabled: boolean) => {
    if (enabled) {
      setSetupMode('create');
    } else {
      removePin();
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-10" style={{ background: '#000' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} color="#F7F7F7" />
        </motion.button>
        <h1 className="text-xl font-bold text-[#F7F7F7]">Configurações</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Notificações */}
        <GlassCard>
          <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider mb-4">Notificações</p>
          <div className="flex flex-col gap-4">
            {([
              { key: 'foco' as const, label: 'Foco diário', desc: 'Lembretes de itens pendentes' },
              { key: 'metas' as const, label: 'Metas', desc: 'Atualizações de progresso' },
              { key: 'financas' as const, label: 'Finanças', desc: 'Alertas de lançamentos' },
              { key: 'saude' as const, label: 'Saúde', desc: 'Lembretes de hábitos e medicamentos' },
            ]).map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[#F7F7F7] text-sm font-medium">{item.label}</p>
                  <p className="text-[#6F6F6F] text-xs mt-0.5">{item.desc}</p>
                </div>
                <ToggleSwitch
                  value={notifs[item.key]}
                  onChange={v => updateNotif(item.key, v)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Segurança */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} color="#FF9F3D" />
            <p className="text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider">Segurança</p>
          </div>

          {/* PIN toggle */}
          <div className="flex items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1">
              <p className="text-[#F7F7F7] text-sm font-medium">Bloqueio por PIN</p>
              <p className="text-[#6F6F6F] text-xs mt-0.5">Protege o app com um PIN de 4 dígitos</p>
            </div>
            <ToggleSwitch value={pinEnabled} onChange={handlePinToggle} size="sm" />
          </div>

          {/* PIN options — shown only when PIN is set */}
          {hasPinSet && (
            <div className="flex flex-col gap-3 pt-4">
              {/* Change PIN */}
              <motion.button
                whileTap={{ backgroundColor: 'rgba(255,159,61,0.08)' }}
                onClick={() => setSetupMode('change')}
                className="flex items-center justify-between w-full pb-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-[#F7F7F7] text-sm">Alterar PIN</span>
                <span className="text-[#FF9F3D] text-sm font-medium">Alterar</span>
              </motion.button>

              {/* Auto-lock time */}
              <div>
                <p className="text-[#F7F7F7] text-sm mb-3">Bloqueio automático</p>
                <div className="flex flex-wrap gap-2">
                  {AUTO_LOCK_OPTIONS.map(opt => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAutoLockMinutes(opt.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{
                        background: autoLockMinutes === opt.value
                          ? 'rgba(255,159,61,0.18)'
                          : 'rgba(255,255,255,0.05)',
                        color: autoLockMinutes === opt.value ? '#FF9F3D' : '#6F6F6F',
                        border: autoLockMinutes === opt.value
                          ? '0.5px solid rgba(255,159,61,0.35)'
                          : '0.5px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Versão */}
        <p className="text-center text-[#3F3F3F] text-xs pb-2">ebran v1.0.0</p>
      </div>

      {/* PIN Setup Overlay */}
      {setupMode && (
        <PinSetupOverlay
          onDone={() => setSetupMode(null)}
          onCancel={() => setSetupMode(null)}
        />
      )}
    </div>
  );
}

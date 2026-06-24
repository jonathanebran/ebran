import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import { usePinLock } from '../contexts/PinLockContext';

export function PinLock() {
  const { unlock, failCount, lockoutUntil } = usePinLock();
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (lockoutUntil <= Date.now()) { setTimeLeft(0); return; }
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  const isLockedOut = lockoutUntil > Date.now() && timeLeft > 0;

  const handleDigit = (d: string) => {
    if (isLockedOut || pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      unlock(next).then(ok => {
        if (!ok) {
          setShake(true);
          setTimeout(() => { setShake(false); setPin(''); }, 600);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!isLockedOut) setPin(p => p.slice(0, -1));
  };

  const handleForgot = () => {
    if (showConfirm) {
      localStorage.clear();
      window.location.reload();
    } else {
      setShowConfirm(true);
    }
  };

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: '#000', maxWidth: 430, margin: '0 auto' }}
    >
      <div className="mb-10 text-center">
        <p
          className="font-bold text-2xl tracking-tight"
          style={{
            background: 'linear-gradient(90deg, #FFD84A, #FF9F3D 40%, #FF6B5F 70%, #FF2F7D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ebran
        </p>
        <p className="text-[#6F6F6F] text-sm mt-2">Digite seu PIN para entrar</p>
      </div>

      {/* Dots */}
      <motion.div
        className="flex gap-5 mb-10"
        animate={shake ? { x: [-10, 10, -10, 10, -6, 6, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-4 h-4 rounded-full transition-all duration-150"
            style={{
              background: pin.length > i
                ? 'linear-gradient(135deg, #FFD84A, #FF2F7D)'
                : 'rgba(255,255,255,0.15)',
              boxShadow: pin.length > i ? '0 0 12px rgba(255,159,61,0.7)' : 'none',
              transform: pin.length > i ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </motion.div>

      {/* Lockout / error message */}
      {isLockedOut ? (
        <div
          className="mb-6 px-6 py-3 rounded-2xl text-center"
          style={{ background: 'rgba(255,47,125,0.1)', border: '1px solid rgba(255,47,125,0.25)' }}
        >
          <p className="text-[#FF2F7D] text-sm font-medium">Muitas tentativas incorretas</p>
          <p className="text-[#FF2F7D] text-xs mt-0.5">Aguarde {timeLeft}s para tentar novamente</p>
        </div>
      ) : failCount > 0 ? (
        <p className="text-[#FF6B5F] text-xs mb-6">
          PIN incorreto — {5 - failCount} tentativa{5 - failCount !== 1 ? 's' : ''} restante{5 - failCount !== 1 ? 's' : ''}
        </p>
      ) : (
        <div className="mb-6 h-5" />
      )}

      {/* Numpad */}
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
              disabled={isLockedOut}
              className="h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.06)',
                opacity: isLockedOut ? 0.4 : 1,
              }}
            >
              <span className="text-[#F7F7F7] text-xl font-semibold">{k}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Forgot PIN */}
      <div className="mt-10">
        {showConfirm ? (
          <div className="text-center px-6">
            <p className="text-[#A8A8A8] text-sm mb-4">
              Isso apagará <span className="text-[#FF2F7D] font-semibold">todos os dados</span> do app. Tem certeza?
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#A8A8A8' }}
              >
                Cancelar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleForgot}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,47,125,0.15)', color: '#FF2F7D', border: '1px solid rgba(255,47,125,0.3)' }}
              >
                Apagar tudo
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleForgot}
          >
            <span className="text-[#6F6F6F] text-sm">Esqueci o PIN</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

const PIN_KEY = 'ebran:pin:v1';
const LAST_ACTIVE_KEY = 'ebran:lastactive:v1';
const AUTO_LOCK_KEY = 'ebran:autolock:v1';
const FAIL_COUNT_KEY = 'ebran:pinfail:v1';
const LOCKOUT_UNTIL_KEY = 'ebran:pinlockout:v1';

async function hashPin(pin: string): Promise<string> {
  const encoded = new TextEncoder().encode(pin);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface PinLockContextValue {
  isLocked: boolean;
  hasPinSet: boolean;
  autoLockMinutes: number;
  failCount: number;
  lockoutUntil: number;
  lock: () => void;
  unlock: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  removePin: () => void;
  setAutoLockMinutes: (minutes: number) => void;
}

const PinLockContext = createContext<PinLockContextValue | null>(null);

export function PinLockProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(() => {
    const hasPinStored = !!localStorage.getItem(PIN_KEY);
    if (!hasPinStored) return false;
    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) ?? '0');
    const minutes = parseInt(localStorage.getItem(AUTO_LOCK_KEY) ?? '5');
    if (minutes === 0) return false;
    return Date.now() - lastActive > minutes * 60_000;
  });

  const [hasPinSet, setHasPinSet] = useState(() => !!localStorage.getItem(PIN_KEY));

  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => {
    const stored = localStorage.getItem(AUTO_LOCK_KEY);
    return stored ? parseInt(stored) : 5;
  });

  const [failCount, setFailCount] = useState(() =>
    parseInt(localStorage.getItem(FAIL_COUNT_KEY) ?? '0')
  );

  const [lockoutUntil, setLockoutUntil] = useState(() =>
    parseInt(localStorage.getItem(LOCKOUT_UNTIL_KEY) ?? '0')
  );

  const lastActiveRef = useRef(Date.now());

  // Track user activity
  useEffect(() => {
    if (!hasPinSet) return;
    const update = () => {
      lastActiveRef.current = Date.now();
      localStorage.setItem(LAST_ACTIVE_KEY, String(lastActiveRef.current));
    };
    const events = ['click', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach(e => window.addEventListener(e, update, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, update));
  }, [hasPinSet]);

  // Lock on visibility change (app goes to background)
  useEffect(() => {
    if (!hasPinSet) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
      } else {
        const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) ?? '0');
        const ms = autoLockMinutes === 0 ? Infinity : autoLockMinutes * 60_000;
        if (Date.now() - lastActive > ms) setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [hasPinSet, autoLockMinutes]);

  const lock = useCallback(() => setIsLocked(true), []);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    if (lockoutUntil > Date.now()) return false;
    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) return false;
    const hash = await hashPin(pin);
    if (hash === stored) {
      setIsLocked(false);
      setFailCount(0);
      localStorage.setItem(FAIL_COUNT_KEY, '0');
      localStorage.removeItem(LOCKOUT_UNTIL_KEY);
      setLockoutUntil(0);
      localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
      return true;
    }
    const next = failCount + 1;
    if (next >= 5) {
      const until = Date.now() + 30_000;
      setLockoutUntil(until);
      localStorage.setItem(LOCKOUT_UNTIL_KEY, String(until));
      setFailCount(0);
      localStorage.setItem(FAIL_COUNT_KEY, '0');
    } else {
      setFailCount(next);
      localStorage.setItem(FAIL_COUNT_KEY, String(next));
    }
    return false;
  }, [failCount, lockoutUntil]);

  const setPin = useCallback(async (pin: string) => {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_KEY, hash);
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    setHasPinSet(true);
    setIsLocked(false);
  }, []);

  const removePin = useCallback(() => {
    localStorage.removeItem(PIN_KEY);
    setHasPinSet(false);
    setIsLocked(false);
  }, []);

  const setAutoLockMinutes = useCallback((minutes: number) => {
    setAutoLockMinutesState(minutes);
    localStorage.setItem(AUTO_LOCK_KEY, String(minutes));
  }, []);

  return (
    <PinLockContext.Provider value={{
      isLocked, hasPinSet, autoLockMinutes, failCount, lockoutUntil,
      lock, unlock, setPin, removePin, setAutoLockMinutes,
    }}>
      {children}
    </PinLockContext.Provider>
  );
}

export function usePinLock() {
  const ctx = useContext(PinLockContext);
  if (!ctx) throw new Error('usePinLock must be used inside PinLockProvider');
  return ctx;
}

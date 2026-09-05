import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { loadHealth, saveHealth, normalizeHealth, type HealthData } from '../lib/healthStore';
import { useCloudBlob } from '../hooks/useCloudBlob';

interface HealthContextValue {
  data: HealthData;
  update: (patch: Partial<HealthData>) => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HealthData>(() => loadHealth());

  const update = useCallback((patch: Partial<HealthData>) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      saveHealth(next);
      return next;
    });
  }, []);

  const applyRemote = useCallback((remote: Partial<HealthData>) => {
    const next = normalizeHealth(remote);
    saveHealth(next);
    setData(next);
  }, []);

  useCloudBlob('health', data, applyRemote);

  return (
    <HealthContext.Provider value={{ data, update }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used inside HealthProvider');
  return ctx;
}

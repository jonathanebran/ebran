import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { loadActivity, type Activity, type ActivityIcon } from '../lib/activityStore';
import { useCloudBlob } from '../hooks/useCloudBlob';

const MAX = 20;

interface ActivityContextValue {
  items: Activity[];
  log: (icon: ActivityIcon, title: string, subtitle?: string) => void;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Activity[]>(() => loadActivity());

  const persist = useCallback((list: Activity[]) => {
    try { localStorage.setItem('ebran:activity:v1', JSON.stringify(list)); } catch { /* cheio */ }
  }, []);

  const log = useCallback((icon: ActivityIcon, title: string, subtitle?: string) => {
    setItems(prev => {
      const next = [{ id: `act-${Date.now()}`, icon, title, subtitle, at: new Date().toISOString() }, ...prev].slice(0, MAX);
      persist(next);
      return next;
    });
  }, [persist]);

  const applyRemote = useCallback((remote: Activity[]) => {
    const list = (remote ?? []).slice(0, MAX);
    persist(list);
    setItems(list);
  }, [persist]);

  useCloudBlob('activity', items, applyRemote);

  return (
    <ActivityContext.Provider value={{ items, log }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used inside ActivityProvider');
  return ctx;
}

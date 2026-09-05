import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { PhotoSession } from '../lib/types';
import { useCloudBlob } from '../hooks/useCloudBlob';

const WORK_KEY = 'ebran:work:v1';

interface WorkContextValue {
  sessions: PhotoSession[];
  addSession: (session: PhotoSession) => void;
  deleteSession: (id: string) => void;
}

function load(): PhotoSession[] {
  try {
    const raw = localStorage.getItem(WORK_KEY);
    return raw ? (JSON.parse(raw) as PhotoSession[]) : [];
  } catch { return []; }
}

const WorkContext = createContext<WorkContextValue | null>(null);

export function WorkProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<PhotoSession[]>(() => load());

  useEffect(() => {
    try { localStorage.setItem(WORK_KEY, JSON.stringify(sessions)); } catch { /* cheio */ }
  }, [sessions]);

  const applyRemote = useCallback((remote: PhotoSession[]) => {
    setSessions(remote ?? []);
  }, []);
  useCloudBlob('work', sessions, applyRemote);

  const addSession = useCallback((session: PhotoSession) => {
    setSessions(prev => [session, ...prev]);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <WorkContext.Provider value={{ sessions, addSession, deleteSession }}>
      {children}
    </WorkContext.Provider>
  );
}

export function useWork() {
  const ctx = useContext(WorkContext);
  if (!ctx) throw new Error('useWork must be used inside WorkProvider');
  return ctx;
}

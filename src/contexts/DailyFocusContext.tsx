import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { DailyFocusItem } from '../lib/types';

const FOCUS_KEY = 'ebran:dailyfocus:v2';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

interface DailyFocusContextValue {
  items: DailyFocusItem[];
  addItem: (item: DailyFocusItem) => void;
  toggleItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<DailyFocusItem>) => void;
  deleteItem: (id: string) => void;
}

const DailyFocusContext = createContext<DailyFocusContextValue | null>(null);

export function DailyFocusProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DailyFocusItem[]>(() =>
    loadFromStorage<DailyFocusItem[]>(FOCUS_KEY, [])
  );

  useEffect(() => { saveToStorage(FOCUS_KEY, items); }, [items]);

  function addItem(item: DailyFocusItem) {
    setItems(prev => [item, ...prev]);
  }

  function toggleItem(id: string) {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: i.status === 'done' ? 'pending' : ('done' as const) } : i
    ));
  }

  function updateItem(id: string, updates: Partial<DailyFocusItem>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }

  function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <DailyFocusContext.Provider value={{ items, addItem, toggleItem, updateItem, deleteItem }}>
      {children}
    </DailyFocusContext.Provider>
  );
}

export function useDailyFocus() {
  const ctx = useContext(DailyFocusContext);
  if (!ctx) throw new Error('useDailyFocus must be used inside DailyFocusProvider');
  return ctx;
}

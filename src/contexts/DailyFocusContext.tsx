import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DailyFocusItem } from '../lib/types';
import { useCloudBlob } from '../hooks/useCloudBlob';

const FOCUS_KEY = 'ebran:dailyfocus:v2';
const DONE_KEY = 'ebran:focusdone:v1';

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
  } catch { /* localStorage indisponível — segue com o padrão */ }
}

function anchorOf(item: DailyFocusItem): string {
  return item.date ?? item.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
}

// Um item aparece em determinado dia conforme sua recorrência.
export function visibleOn(item: DailyFocusItem, dateStr: string): boolean {
  const anchor = anchorOf(item);
  const rec = item.recurrence ?? 'once';
  if (rec === 'once') return dateStr === anchor;
  if (dateStr < anchor) return false;
  if (rec === 'daily') return true;
  const d = new Date(dateStr + 'T00:00');
  const a = new Date(anchor + 'T00:00');
  const diffDays = Math.round((d.getTime() - a.getTime()) / 86_400_000);
  if (rec === 'weekly') return diffDays % 7 === 0;
  if (rec === 'biweekly') return diffDays % 14 === 0;
  if (rec === 'monthly') return d.getDate() === a.getDate();
  return dateStr === anchor;
}

const doneKey = (id: string, date: string) => `${id}|${date}`;

interface DailyFocusContextValue {
  items: DailyFocusItem[];
  addItem: (item: DailyFocusItem) => void;
  updateItem: (id: string, updates: Partial<DailyFocusItem>) => void;
  deleteItem: (id: string) => void;
  /** Itens que aparecem no dia informado (YYYY-MM-DD). */
  itemsForDate: (date: string) => DailyFocusItem[];
  isDone: (id: string, date: string) => boolean;
  toggleForDate: (id: string, date: string) => void;
}

const DailyFocusContext = createContext<DailyFocusContextValue | null>(null);

export function DailyFocusProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DailyFocusItem[]>(() =>
    loadFromStorage<DailyFocusItem[]>(FOCUS_KEY, [])
  );
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    loadFromStorage<Record<string, boolean>>(DONE_KEY, {})
  );

  useEffect(() => { saveToStorage(FOCUS_KEY, items); }, [items]);
  useEffect(() => { saveToStorage(DONE_KEY, done); }, [done]);

  // Sincroniza itens + conclusões com a nuvem (mesmo bloco).
  const blob = useMemo(() => ({ items, done }), [items, done]);
  const applyRemote = useCallback((remote: { items?: DailyFocusItem[]; done?: Record<string, boolean> }) => {
    setItems(remote.items ?? []);
    setDone(remote.done ?? {});
  }, []);
  useCloudBlob('dailyfocus', blob, applyRemote);

  function addItem(item: DailyFocusItem) {
    setItems(prev => [item, ...prev]);
  }

  function updateItem(id: string, updates: Partial<DailyFocusItem>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }

  function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
    // Limpa conclusões desse item em qualquer dia.
    setDone(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (k.startsWith(`${id}|`)) delete next[k];
      return next;
    });
  }

  function itemsForDate(date: string) {
    return items.filter(i => visibleOn(i, date));
  }

  function isDone(id: string, date: string) {
    return !!done[doneKey(id, date)];
  }

  function toggleForDate(id: string, date: string) {
    setDone(prev => {
      const key = doneKey(id, date);
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = true;
      return next;
    });
  }

  return (
    <DailyFocusContext.Provider value={{ items, addItem, updateItem, deleteItem, itemsForDate, isDone, toggleForDate }}>
      {children}
    </DailyFocusContext.Provider>
  );
}

export function useDailyFocus() {
  const ctx = useContext(DailyFocusContext);
  if (!ctx) throw new Error('useDailyFocus must be used inside DailyFocusProvider');
  return ctx;
}

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type { FinanceRecord } from '../lib/types';
import { useCloudBlob } from '../hooks/useCloudBlob';

const FINANCE_KEY = 'ebran:finance:v1';

export interface FinanceSummary {
  income: number;
  expenses: number;
  balance: number;
  savings_rate: number;
}

interface FinanceContextValue {
  records: FinanceRecord[];
  summary: FinanceSummary;
  addRecord: (record: FinanceRecord) => void;
  deleteRecord: (id: string) => void;
}

function load(): FinanceRecord[] {
  try {
    const raw = localStorage.getItem(FINANCE_KEY);
    return raw ? (JSON.parse(raw) as FinanceRecord[]) : [];
  } catch { return []; }
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<FinanceRecord[]>(() => load());

  useEffect(() => {
    try { localStorage.setItem(FINANCE_KEY, JSON.stringify(records)); } catch { /* cheio */ }
  }, [records]);

  const applyRemote = useCallback((remote: FinanceRecord[]) => {
    setRecords(remote ?? []);
  }, []);
  useCloudBlob('finance', records, applyRemote);

  const addRecord = useCallback((record: FinanceRecord) => {
    setRecords(prev => [record, ...prev]);
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const summary = useMemo<FinanceSummary>(() => {
    let income = 0, expenses = 0;
    for (const r of records) {
      if (r.status === 'cancelled') continue;
      if (r.type === 'income') income += r.amount;
      else expenses += r.amount;
    }
    const balance = income - expenses;
    const savings_rate = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expenses, balance, savings_rate };
  }, [records]);

  return (
    <FinanceContext.Provider value={{ records, summary, addRecord, deleteRecord }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider');
  return ctx;
}

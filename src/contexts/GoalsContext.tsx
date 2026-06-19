import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Goal, GoalContribution } from '../lib/types';
import { mockGoals, mockGoalContributions } from '../data/mockData';

const GOALS_KEY = 'ebran:goals';
const CONTRIBUTIONS_KEY = 'ebran:contributions';

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
  } catch {
    // storage quota exceeded — silently ignore
  }
}

interface GoalsContextValue {
  goals: Goal[];
  contributions: GoalContribution[];
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  addContribution: (contribution: GoalContribution) => void;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(() =>
    loadFromStorage(GOALS_KEY, mockGoals)
  );
  const [contributions, setContributions] = useState<GoalContribution[]>(() =>
    loadFromStorage(CONTRIBUTIONS_KEY, mockGoalContributions)
  );

  useEffect(() => { saveToStorage(GOALS_KEY, goals); }, [goals]);
  useEffect(() => { saveToStorage(CONTRIBUTIONS_KEY, contributions); }, [contributions]);

  function updateGoal(id: string, updates: Partial<Goal>) {
    setGoals(prev =>
      prev.map(g => g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g)
    );
  }

  function addContribution(contribution: GoalContribution) {
    setContributions(prev => [contribution, ...prev]);
  }

  return (
    <GoalsContext.Provider value={{ goals, contributions, updateGoal, addContribution }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used inside GoalsProvider');
  return ctx;
}

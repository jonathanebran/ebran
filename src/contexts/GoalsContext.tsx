import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Goal, GoalContribution } from '../lib/types';

const GOALS_KEY = 'ebran:goals:v2';
const CONTRIBUTIONS_KEY = 'ebran:contributions:v2';

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
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (contribution: GoalContribution) => void;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(() => loadFromStorage(GOALS_KEY, []));
  const [contributions, setContributions] = useState<GoalContribution[]>(() =>
    loadFromStorage(CONTRIBUTIONS_KEY, [])
  );

  useEffect(() => { saveToStorage(GOALS_KEY, goals); }, [goals]);
  useEffect(() => { saveToStorage(CONTRIBUTIONS_KEY, contributions); }, [contributions]);

  function addGoal(goal: Goal) {
    setGoals(prev => [goal, ...prev]);
  }

  function updateGoal(id: string, updates: Partial<Goal>) {
    setGoals(prev =>
      prev.map(g => g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g)
    );
  }

  function deleteGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id));
    setContributions(prev => prev.filter(c => c.goal_id !== id));
  }

  function addContribution(contribution: GoalContribution) {
    setContributions(prev => [contribution, ...prev]);
  }

  return (
    <GoalsContext.Provider value={{ goals, contributions, addGoal, updateGoal, deleteGoal, addContribution }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used inside GoalsProvider');
  return ctx;
}

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Goal, GoalContribution } from '../lib/types';
import { mockGoals, mockGoalContributions } from '../data/mockData';

interface GoalsContextValue {
  goals: Goal[];
  contributions: GoalContribution[];
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  addContribution: (contribution: GoalContribution) => void;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [contributions, setContributions] = useState<GoalContribution[]>(mockGoalContributions);

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

import type {
  User, Goal, WorkRecord, FinanceRecord, DailyFocusItem,
  Appointment, Medication, WishlistItem,
  CareProduct, GoogleIntegration, GoalContribution, PhotoSession
} from '../lib/types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Jonathan Matheus',
  email: 'jonathan1704.si@gmail.com',
  avatar_url: undefined,
  brand: 'Ebran',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockGoals: Goal[] = [];
export const mockGoalContributions: GoalContribution[] = [];
export const mockWorkRecords: WorkRecord[] = [];

export const mockWorkSummary = {
  monthly_revenue: 0,
  monthly_goal: 0,
  services_count: 0,
  average_ticket: 0,
};

export const mockPhotoSessions: PhotoSession[] = [];

export const mockFinanceRecords: FinanceRecord[] = [];

export const mockFinanceSummary = {
  income: 0,
  expenses: 0,
  balance: 0,
  savings_rate: 0,
};

export const mockDailyFocusItems: DailyFocusItem[] = [];
export const mockRestockSuggestions = mockDailyFocusItems.filter(i => i.recurrence && i.next_restock_date);

export const mockHealthToday: {
  water: { current: number; target: number; unit: string };
  workout: { done: boolean; type: string };
  sleep: { hours: number; minutes: number };
  skincare_morning: { done: boolean };
  skincare_night: { done: boolean };
  next_appointment: { title: string; date: string; time: string } | null;
} = {
  water: { current: 0, target: 3.0, unit: 'L' },
  workout: { done: false, type: '' },
  sleep: { hours: 0, minutes: 0 },
  skincare_morning: { done: false },
  skincare_night: { done: false },
  next_appointment: null,
};

export const mockAppointments: Appointment[] = [];
export const mockMedications: Medication[] = [];
export const mockWishlistItems: WishlistItem[] = [];
export const mockCareProducts: CareProduct[] = [];

export const mockGoogleIntegrations: GoogleIntegration[] = [
  { id: 'gi-1', user_id: 'user-1', service: 'calendar', connected: false, permissions: [], sync_frequency: 'manual', created_at: '2025-01-01T00:00:00Z' },
  { id: 'gi-2', user_id: 'user-1', service: 'drive', connected: false, permissions: [], sync_frequency: 'manual', created_at: '2025-01-01T00:00:00Z' },
  { id: 'gi-3', user_id: 'user-1', service: 'tasks', connected: false, permissions: [], sync_frequency: 'manual', created_at: '2025-01-01T00:00:00Z' },
  { id: 'gi-4', user_id: 'user-1', service: 'keep', connected: false, permissions: [], sync_frequency: 'manual', created_at: '2025-01-01T00:00:00Z' },
  { id: 'gi-5', user_id: 'user-1', service: 'gmail', connected: false, permissions: [], sync_frequency: 'manual', created_at: '2025-01-01T00:00:00Z' },
];

export const mockRecentActivity: { id: string; icon: string; title: string; subtitle: string; time: string; color: string }[] = [];

export const mockEconomyMode: { id: string; title: string; category: string; price: number; recommendation: 'buy_now' | 'buy_later' | 'research' | 'save_as_goal'; reason: string; priority: 'high' | 'medium' | 'low' }[] = [];

export type GoalType =
  | 'financial' | 'small' | 'wish' | 'care' | 'health'
  | 'work' | 'travel' | 'purchase' | 'routine' | 'recurring';

export type GoalStatus =
  | 'planning' | 'active' | 'paused' | 'in_progress' | 'completed' | 'cancelled' | 'archived';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Recurrence =
  | 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
  | 'quarterly' | 'semiannual' | 'annual' | 'custom';

export type FinanceCategory =
  | 'work' | 'food' | 'transport' | 'home' | 'subscriptions'
  | 'care' | 'products' | 'consultations' | 'procedures'
  | 'medications' | 'therapy' | 'leisure' | 'travel' | 'investments';

export type PaymentMethod = 'pix' | 'cash' | 'debit' | 'credit' | 'transfer' | 'boleto';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  brand: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: GoalType;
  category: string;
  target_amount: number;
  current_amount: number;
  reserved_amount: number;
  start_date?: string;
  end_date?: string;
  desired_date?: string;
  desired_time?: string;
  recurrence: Recurrence;
  priority: Priority;
  status: GoalStatus;
  image_url?: string;
  external_link?: string;
  notes?: string;
  tags: string[];
  linked_account_id?: string;
  linked_google_calendar_event_id?: string;
  linked_google_drive_folder_id?: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  note?: string;
  created_at: string;
}

export interface GoalReminder {
  id: string;
  goal_id: string;
  remind_at: string;
  message?: string;
  sent: boolean;
}

export interface GoalAttachment {
  id: string;
  goal_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface WorkRecord {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  payment_method: PaymentMethod;
  date: string;
  time?: string;
  status: 'pending' | 'received' | 'cancelled';
  note?: string;
  tags: string[];
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: FinanceCategory;
  subcategory?: string;
  account?: string;
  payment_method?: PaymentMethod;
  date: string;
  time?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  attachment_url?: string;
  note?: string;
  created_at: string;
}

export interface DailyFocusItem {
  id: string;
  user_id: string;
  name: string;
  category: 'market' | 'care' | 'home' | 'workout' | 'task' | 'recurring';
  status: 'pending' | 'done' | 'skipped';
  priority: Priority;
  recurrence?: Recurrence;
  next_restock_date?: string;
  estimated_price?: number;
  note?: string;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  type: 'water' | 'sleep' | 'workout' | 'skincare' | 'medication' | 'habit' | 'mood';
  value?: number;
  unit?: string;
  note?: string;
  date: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  professional?: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  linked_goal_id?: string;
  linked_calendar_event_id?: string;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dose: string;
  frequency: Recurrence;
  reminder_time?: string;
  status: 'active' | 'paused' | 'completed';
  note?: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  estimated_price?: number;
  priority: Priority;
  image_url?: string;
  link?: string;
  note?: string;
  created_at: string;
}

export interface CareProduct {
  id: string;
  user_id: string;
  name: string;
  category: string;
  price?: number;
  frequency?: Recurrence;
  next_purchase_date?: string;
  status: 'in_use' | 'finished' | 'wishlist';
  note?: string;
  created_at: string;
}

export interface CareGoal {
  id: string;
  user_id: string;
  title: string;
  type: 'procedure' | 'product' | 'consultation' | 'routine';
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  priority: Priority;
  status: GoalStatus;
  professional?: string;
  clinic?: string;
  created_at: string;
}

export interface AICommand {
  id: string;
  user_id: string;
  input: string;
  intent: string;
  module: string;
  action: string;
  extracted_data: Record<string, unknown>;
  suggested_destination: string;
  confirmation_required: boolean;
  suggested_actions: string[];
  processed: boolean;
  created_at: string;
}

export interface AIMemory {
  id: string;
  user_id: string;
  key: string;
  value: string;
  context: string;
  created_at: string;
  updated_at: string;
}

export interface PriorityDecision {
  id: string;
  user_id: string;
  item_title: string;
  item_type: string;
  score: number;
  recommendation: 'buy_now' | 'buy_later' | 'research' | 'save_as_goal';
  reason: string;
  created_at: string;
}

export interface GoogleIntegration {
  id: string;
  user_id: string;
  service: 'calendar' | 'drive' | 'tasks' | 'keep' | 'gmail';
  connected: boolean;
  account_email?: string;
  permissions: string[];
  sync_frequency: 'manual' | 'daily' | 'realtime';
  default_folder?: string;
  last_sync_at?: string;
  created_at: string;
}

export interface GoogleCalendarEvent {
  id: string;
  user_id: string;
  google_event_id: string;
  title: string;
  date: string;
  time?: string;
  linked_goal_id?: string;
  linked_appointment_id?: string;
  created_at: string;
}

export interface GoogleTask {
  id: string;
  user_id: string;
  google_task_id: string;
  title: string;
  completed: boolean;
  linked_focus_item_id?: string;
  created_at: string;
}

export interface AIClassifierResult {
  intent: string;
  module: string;
  action: string;
  extractedData: Record<string, unknown>;
  suggestedDestination: string;
  confirmationRequired: boolean;
  suggestedActions: string[];
}

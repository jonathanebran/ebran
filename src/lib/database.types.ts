export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          brand: string | null;
          monthly_income_goal: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          avatar_url?: string | null;
          brand?: string | null;
          monthly_income_goal?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
          brand?: string | null;
          monthly_income_goal?: number | null;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: 'financial' | 'travel' | 'care' | 'small' | 'wish';
          category: string;
          target_amount: number;
          current_amount: number;
          reserved_amount: number | null;
          start_date: string | null;
          end_date: string | null;
          desired_date: string | null;
          recurrence: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'active' | 'paused' | 'completed' | 'archived' | 'planning';
          image_url: string | null;
          tags: string[] | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type: 'financial' | 'travel' | 'care' | 'small' | 'wish';
          category: string;
          target_amount?: number;
          current_amount?: number;
          reserved_amount?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          desired_date?: string | null;
          recurrence?: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'active' | 'paused' | 'completed' | 'archived' | 'planning';
          image_url?: string | null;
          tags?: string[] | null;
          notes?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          type?: 'financial' | 'travel' | 'care' | 'small' | 'wish';
          category?: string;
          target_amount?: number;
          current_amount?: number;
          reserved_amount?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          desired_date?: string | null;
          recurrence?: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'active' | 'paused' | 'completed' | 'archived' | 'planning';
          image_url?: string | null;
          tags?: string[] | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      goal_contributions: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          amount: number;
          description: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          amount: number;
          description?: string | null;
          date?: string;
        };
        Update: {
          amount?: number;
          description?: string | null;
          date?: string;
        };
      };
      finance_records: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          description: string;
          category: string;
          date: string;
          payment_method: 'pix' | 'card' | 'cash' | 'transfer' | 'boleto' | null;
          recurrence: 'once' | 'weekly' | 'monthly' | 'yearly' | null;
          is_recurring: boolean | null;
          tags: string[] | null;
          notes: string | null;
          linked_goal_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          description: string;
          category: string;
          date?: string;
          payment_method?: 'pix' | 'card' | 'cash' | 'transfer' | 'boleto' | null;
          recurrence?: 'once' | 'weekly' | 'monthly' | 'yearly' | null;
          is_recurring?: boolean | null;
          tags?: string[] | null;
          notes?: string | null;
          linked_goal_id?: string | null;
        };
        Update: {
          type?: 'income' | 'expense';
          amount?: number;
          description?: string;
          category?: string;
          date?: string;
          payment_method?: 'pix' | 'card' | 'cash' | 'transfer' | 'boleto' | null;
          recurrence?: 'once' | 'weekly' | 'monthly' | 'yearly' | null;
          is_recurring?: boolean | null;
          tags?: string[] | null;
          notes?: string | null;
          linked_goal_id?: string | null;
        };
      };
      work_records: {
        Row: {
          id: string;
          user_id: string;
          client: string | null;
          description: string;
          amount: number;
          payment_method: 'pix' | 'card' | 'cash' | 'transfer' | 'boleto' | null;
          status: 'paid' | 'pending' | 'overdue';
          date: string;
          service_type: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client?: string | null;
          description: string;
          amount: number;
          payment_method?: 'pix' | 'card' | 'cash' | 'transfer' | 'boleto' | null;
          status?: 'paid' | 'pending' | 'overdue';
          date?: string;
          service_type?: string | null;
          notes?: string | null;
        };
        Update: {
          client?: string | null;
          description?: string;
          amount?: number;
          payment_method?: 'pix' | 'card' | 'cash' | 'transfer' | 'boleto' | null;
          status?: 'paid' | 'pending' | 'overdue';
          date?: string;
          service_type?: string | null;
          notes?: string | null;
        };
      };
      daily_focus_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: 'market' | 'care' | 'home' | 'workout' | 'task' | 'recurring';
          status: 'pending' | 'done' | 'skipped';
          priority: 'low' | 'medium' | 'high';
          estimated_price: number | null;
          recurrence: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
          is_recurring: boolean | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: 'market' | 'care' | 'home' | 'workout' | 'task' | 'recurring';
          status?: 'pending' | 'done' | 'skipped';
          priority?: 'low' | 'medium' | 'high';
          estimated_price?: number | null;
          recurrence?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
          is_recurring?: boolean | null;
          due_date?: string | null;
        };
        Update: {
          name?: string;
          category?: 'market' | 'care' | 'home' | 'workout' | 'task' | 'recurring';
          status?: 'pending' | 'done' | 'skipped';
          priority?: 'low' | 'medium' | 'high';
          estimated_price?: number | null;
          recurrence?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
          is_recurring?: boolean | null;
          due_date?: string | null;
          updated_at?: string;
        };
      };
      health_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          water_ml: number | null;
          sleep_hours: number | null;
          mood: number | null;
          workout_done: boolean | null;
          workout_type: string | null;
          weight_kg: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          water_ml?: number | null;
          sleep_hours?: number | null;
          mood?: number | null;
          workout_done?: boolean | null;
          workout_type?: string | null;
          weight_kg?: number | null;
          notes?: string | null;
        };
        Update: {
          water_ml?: number | null;
          sleep_hours?: number | null;
          mood?: number | null;
          workout_done?: boolean | null;
          workout_type?: string | null;
          weight_kg?: number | null;
          notes?: string | null;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          professional: string | null;
          specialty: string | null;
          date: string;
          time: string | null;
          location: string | null;
          notes: string | null;
          reminder_before_minutes: number | null;
          google_event_id: string | null;
          status: 'scheduled' | 'done' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          professional?: string | null;
          specialty?: string | null;
          date: string;
          time?: string | null;
          location?: string | null;
          notes?: string | null;
          reminder_before_minutes?: number | null;
          google_event_id?: string | null;
          status?: 'scheduled' | 'done' | 'cancelled';
        };
        Update: {
          title?: string;
          professional?: string | null;
          specialty?: string | null;
          date?: string;
          time?: string | null;
          location?: string | null;
          notes?: string | null;
          reminder_before_minutes?: number | null;
          google_event_id?: string | null;
          status?: 'scheduled' | 'done' | 'cancelled';
        };
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dose: string | null;
          frequency: string;
          reminder_time: string | null;
          start_date: string | null;
          end_date: string | null;
          active: boolean | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          dose?: string | null;
          frequency: string;
          reminder_time?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          dose?: string | null;
          frequency?: string;
          reminder_time?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean | null;
          notes?: string | null;
        };
      };
      care_products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand: string | null;
          category: string;
          in_use: boolean | null;
          price: number | null;
          restock_days: number | null;
          last_purchased: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          brand?: string | null;
          category: string;
          in_use?: boolean | null;
          price?: number | null;
          restock_days?: number | null;
          last_purchased?: string | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          brand?: string | null;
          category?: string;
          in_use?: boolean | null;
          price?: number | null;
          restock_days?: number | null;
          last_purchased?: string | null;
          notes?: string | null;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          price: number | null;
          url: string | null;
          image_url: string | null;
          priority: 'low' | 'medium' | 'high';
          saved_amount: number | null;
          notes: string | null;
          purchased: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string | null;
          price?: number | null;
          url?: string | null;
          image_url?: string | null;
          priority?: 'low' | 'medium' | 'high';
          saved_amount?: number | null;
          notes?: string | null;
          purchased?: boolean | null;
        };
        Update: {
          name?: string;
          category?: string | null;
          price?: number | null;
          url?: string | null;
          image_url?: string | null;
          priority?: 'low' | 'medium' | 'high';
          saved_amount?: number | null;
          notes?: string | null;
          purchased?: boolean | null;
        };
      };
      ai_commands: {
        Row: {
          id: string;
          user_id: string;
          input: string;
          intent: string | null;
          module: string | null;
          action: string | null;
          result: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          input: string;
          intent?: string | null;
          module?: string | null;
          action?: string | null;
          result?: Json | null;
        };
        Update: {
          intent?: string | null;
          module?: string | null;
          action?: string | null;
          result?: Json | null;
        };
      };
      google_integrations: {
        Row: {
          id: string;
          user_id: string;
          service: 'calendar' | 'drive' | 'tasks' | 'keep' | 'gmail';
          connected: boolean | null;
          account_email: string | null;
          access_token: string | null;
          refresh_token: string | null;
          last_sync: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service: 'calendar' | 'drive' | 'tasks' | 'keep' | 'gmail';
          connected?: boolean | null;
          account_email?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          last_sync?: string | null;
        };
        Update: {
          connected?: boolean | null;
          account_email?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          last_sync?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

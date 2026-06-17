-- ============================================================
-- EBRAN — Schema completo
-- Execute no SQL Editor do Supabase (supabase.com/dashboard)
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (estende o auth.users do Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  brand TEXT DEFAULT 'Ebran',
  monthly_income_goal NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-criar perfil ao registrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('financial','travel','care','small','wish')),
  category TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  reserved_amount NUMERIC(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  desired_date DATE,
  recurrence TEXT CHECK (recurrence IN ('once','weekly','biweekly','monthly','quarterly','yearly')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived','planning')),
  image_url TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOAL CONTRIBUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-atualizar current_amount da meta ao inserir contribuição
CREATE OR REPLACE FUNCTION update_goal_amount()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE goals
  SET current_amount = current_amount + NEW.amount,
      updated_at = NOW()
  WHERE id = NEW.goal_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_contribution_insert ON goal_contributions;
CREATE TRIGGER on_contribution_insert
  AFTER INSERT ON goal_contributions
  FOR EACH ROW EXECUTE FUNCTION update_goal_amount();

-- ============================================================
-- FINANCE RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS finance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('pix','card','cash','transfer','boleto')),
  recurrence TEXT CHECK (recurrence IN ('once','weekly','monthly','yearly')),
  is_recurring BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  notes TEXT,
  linked_goal_id UUID REFERENCES goals(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORK RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS work_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client TEXT,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('pix','card','cash','transfer','boleto')),
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid','pending','overdue')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DAILY FOCUS ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_focus_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('market','care','home','workout','task','recurring')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','done','skipped')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  estimated_price NUMERIC(10,2),
  recurrence TEXT CHECK (recurrence IN ('daily','weekly','biweekly','monthly')),
  is_recurring BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HEALTH RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_ml INTEGER DEFAULT 0,
  sleep_hours NUMERIC(4,2) DEFAULT 0,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  workout_done BOOLEAN DEFAULT FALSE,
  workout_type TEXT,
  weight_kg NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  professional TEXT,
  specialty TEXT,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  notes TEXT,
  reminder_before_minutes INTEGER DEFAULT 60,
  google_event_id TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','done','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEDICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  frequency TEXT NOT NULL,
  reminder_time TEXT,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CARE PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS care_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  in_use BOOLEAN DEFAULT TRUE,
  price NUMERIC(10,2),
  restock_days INTEGER,
  last_purchased DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(12,2),
  url TEXT,
  image_url TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  saved_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI COMMANDS (histórico)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  intent TEXT,
  module TEXT,
  action TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOOGLE INTEGRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS google_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL CHECK (service IN ('calendar','drive','tasks','keep','gmail')),
  connected BOOLEAN DEFAULT FALSE,
  account_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — cada usuário vê apenas seus dados
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_focus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_integrations ENABLE ROW LEVEL SECURITY;

-- Função utilitária
CREATE OR REPLACE FUNCTION uid() RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT auth.uid()
$$;

-- Policies — padrão: usuário acessa apenas seus dados
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles','goals','goal_contributions','finance_records',
    'work_records','daily_focus_items','health_records','appointments',
    'medications','care_products','wishlist_items','ai_commands',
    'google_integrations'
  ]
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "user_own_%s" ON %s;
      CREATE POLICY "user_own_%s" ON %s
        USING (user_id = uid())
        WITH CHECK (user_id = uid());
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END;
$$;

-- profiles usa id em vez de user_id
DROP POLICY IF EXISTS "user_own_profiles" ON profiles;
CREATE POLICY "user_own_profiles" ON profiles
  USING (id = uid())
  WITH CHECK (id = uid());

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_finance_user_date ON finance_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_work_user_date ON work_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_focus_user ON daily_focus_items(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, date);

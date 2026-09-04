-- ============================================================================
-- Ebran — schema do banco (Supabase / PostgreSQL)
-- Cole tudo isto em: Supabase → SQL Editor → New query → Run.
-- É idempotente: pode rodar de novo sem quebrar nada.
--
-- Segurança: TODAS as tabelas têm Row-Level Security (RLS) ligada e políticas
-- que só deixam cada usuário ler/gravar as PRÓPRIAS linhas (user_id = auth.uid()).
-- Mesmo com a chave anon pública, ninguém acessa dados de outra conta.
-- ============================================================================

-- Perfil (1 linha por usuário; id = id do usuário autenticado)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  avatar_url text,
  updated_at timestamptz not null default now()
);

-- Preferências de tema, sincronizadas entre dispositivos.
alter table public.profiles add column if not exists theme_id      text;
alter table public.profiles add column if not exists glass_opacity numeric;

-- Metas
create table if not exists public.goals (
  id             text primary key,
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title          text not null,
  description    text,
  type           text not null,
  category       text not null default '',
  target_amount  numeric not null default 0,
  current_amount numeric not null default 0,
  reserved_amount numeric not null default 0,
  start_date     date,
  end_date       date,
  desired_date   date,
  desired_time   text,
  recurrence     text not null default 'once',
  priority       text not null default 'medium',
  status         text not null default 'active',
  image_url      text,
  external_link  text,
  notes          text,
  tags           text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  archived_at    timestamptz
);

-- Aportes numa meta
create table if not exists public.goal_contributions (
  id         text primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  goal_id    text not null references public.goals(id) on delete cascade,
  amount     numeric not null default 0,
  note       text,
  created_at timestamptz not null default now()
);

-- Itens do Foco diário
create table if not exists public.focus_items (
  id                text primary key,
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name              text not null,
  category          text not null default 'task',
  status            text not null default 'pending',
  priority          text not null default 'medium',
  recurrence        text,
  item_date         date,
  next_restock_date date,
  estimated_price   numeric,
  note              text,
  created_at        timestamptz not null default now()
);

-- Conclusões por dia (item X concluído no dia Y)
create table if not exists public.focus_completions (
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id        text not null references public.focus_items(id) on delete cascade,
  completion_date date not null,
  created_at     timestamptz not null default now(),
  primary key (user_id, item_id, completion_date)
);

-- Estado de saúde (1 linha por usuário)
create table if not exists public.health_state (
  user_id            uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  water              numeric not null default 0,
  water_target       numeric not null default 3,
  workout_week_start date,
  workout_days       int[] not null default '{}',
  workout_goal       int not null default 6,
  day                date,
  updated_at         timestamptz not null default now()
);

-- Consultas
create table if not exists public.appointments (
  id           text primary key,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title        text not null,
  professional text,
  specialty    text not null default '',
  appt_date    date not null,
  appt_time    text not null default '',
  location     text,
  status       text not null default 'scheduled',
  notes        text,
  created_at   timestamptz not null default now()
);

-- Medicamentos
create table if not exists public.medications (
  id            text primary key,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name          text not null,
  dose          text not null default '',
  frequency     text not null default 'daily',
  reminder_time text,
  status        text not null default 'active',
  note          text,
  created_at    timestamptz not null default now()
);

-- Estado do app por área (blob JSON por usuário) — usado pela sincronização.
create table if not exists public.app_state (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key        text not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Feed de atividade
create table if not exists public.activities (
  id       text primary key,
  user_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  icon     text not null,
  title    text not null,
  subtitle text,
  at       timestamptz not null default now()
);

-- ============================================================================
-- Row-Level Security: liga em todas as tabelas e cria as políticas por usuário.
-- ============================================================================
do $$
declare
  t text;
  tbls text[] := array[
    'profiles','goals','goal_contributions','focus_items','focus_completions',
    'health_state','appointments','medications','activities','app_state'
  ];
  owner_col text;
begin
  foreach t in array tbls loop
    execute format('alter table public.%I enable row level security;', t);

    -- profiles usa a coluna "id" como dono; as demais usam "user_id".
    if t = 'profiles' then owner_col := 'id'; else owner_col := 'user_id'; end if;

    execute format('drop policy if exists %I on public.%I;', t || '_select', t);
    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I;', t || '_update', t);
    execute format('drop policy if exists %I on public.%I;', t || '_delete', t);

    execute format(
      'create policy %I on public.%I for select using (auth.uid() = %I);',
      t || '_select', t, owner_col);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = %I);',
      t || '_insert', t, owner_col);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = %I) with check (auth.uid() = %I);',
      t || '_update', t, owner_col, owner_col);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = %I);',
      t || '_delete', t, owner_col);
  end loop;
end $$;

-- ============================================================================
-- Cria automaticamente uma linha em profiles quando um usuário se cadastra.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Índices úteis
create index if not exists idx_goals_user            on public.goals(user_id);
create index if not exists idx_contrib_goal          on public.goal_contributions(goal_id);
create index if not exists idx_focus_user            on public.focus_items(user_id);
create index if not exists idx_completions_user_date on public.focus_completions(user_id, completion_date);
create index if not exists idx_appointments_user     on public.appointments(user_id);
create index if not exists idx_medications_user      on public.medications(user_id);
create index if not exists idx_activities_user_at    on public.activities(user_id, at desc);

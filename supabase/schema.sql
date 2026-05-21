-- ============================================
-- NatacionApp - Esquema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla de usuarios (perfil extendido)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('swimmer', 'coach')) default 'swimmer',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Función sin recursión RLS (las policies no deben hacer SELECT a users para saber si sos coach)
create or replace function public.is_coach()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select u.role = 'coach' from public.users u where u.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_coach() from public;
grant execute on function public.is_coach() to authenticated;
grant execute on function public.is_coach() to service_role;

create policy "Coaches can read all profiles"
  on public.users for select
  using (public.is_coach());

-- Tabla de pruebas de natación
create table if not exists public.swim_tests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  distance integer not null,
  style text not null check (style in ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley')),
  type text not null check (type in ('individual', 'relay')) default 'individual'
);

alter table public.swim_tests enable row level security;

create policy "Anyone authenticated can read swim_tests"
  on public.swim_tests for select
  using (auth.uid() is not null);

-- Tabla de entrenamientos
create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.trainings enable row level security;

create policy "Users can manage own trainings"
  on public.trainings for all
  using (auth.uid() = user_id);

create policy "Coaches can read all trainings"
  on public.trainings for select
  using (public.is_coach());

-- Tabla de resultados de entrenamiento
create table if not exists public.training_results (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings(id) on delete cascade,
  swim_test_id uuid not null references public.swim_tests(id),
  time numeric(12, 3) not null check (time > 0),
  created_at timestamptz not null default now()
);

alter table public.training_results enable row level security;

-- RLS explícita: INSERT necesita WITH CHECK (evita que falle el guardado desde la app)
create policy "training_results_select_own_or_coach"
  on public.training_results for select
  using (
    exists (
      select 1 from public.trainings t
      where t.id = training_results.training_id
      and (t.user_id = auth.uid() or public.is_coach())
    )
  );

create policy "training_results_insert_own_training"
  on public.training_results for insert
  with check (
    exists (
      select 1 from public.trainings t
      where t.id = training_results.training_id and t.user_id = auth.uid()
    )
  );

create policy "training_results_delete_own_or_coach"
  on public.training_results for delete
  using (
    exists (
      select 1 from public.trainings t
      where t.id = training_results.training_id and t.user_id = auth.uid()
    )
    or public.is_coach()
  );

-- Índices para performance
create index if not exists idx_trainings_user_id on public.trainings(user_id);
create index if not exists idx_trainings_date on public.trainings(date desc);
create index if not exists idx_training_results_training_id on public.training_results(training_id);
create index if not exists idx_training_results_swim_test_id on public.training_results(swim_test_id);

-- ============================================
-- Seed: Pruebas oficiales FINA
-- ============================================
insert into public.swim_tests (name, distance, style, type) values
  -- Libre
  ('50m Libre', 50, 'freestyle', 'individual'),
  ('100m Libre', 100, 'freestyle', 'individual'),
  ('200m Libre', 200, 'freestyle', 'individual'),
  ('400m Libre', 400, 'freestyle', 'individual'),
  ('800m Libre', 800, 'freestyle', 'individual'),
  ('1500m Libre', 1500, 'freestyle', 'individual'),
  -- Espalda
  ('50m Espalda', 50, 'backstroke', 'individual'),
  ('100m Espalda', 100, 'backstroke', 'individual'),
  ('200m Espalda', 200, 'backstroke', 'individual'),
  -- Pecho
  ('50m Pecho', 50, 'breaststroke', 'individual'),
  ('100m Pecho', 100, 'breaststroke', 'individual'),
  ('200m Pecho', 200, 'breaststroke', 'individual'),
  -- Mariposa
  ('50m Mariposa', 50, 'butterfly', 'individual'),
  ('100m Mariposa', 100, 'butterfly', 'individual'),
  ('200m Mariposa', 200, 'butterfly', 'individual'),
  -- Combinado
  ('200m Combinado', 200, 'medley', 'individual'),
  ('400m Combinado', 400, 'medley', 'individual'),
  -- Postas
  ('4x100m Libre', 400, 'freestyle', 'relay'),
  ('4x200m Libre', 800, 'freestyle', 'relay'),
  ('4x100m Combinado', 400, 'medley', 'relay')
on conflict do nothing;

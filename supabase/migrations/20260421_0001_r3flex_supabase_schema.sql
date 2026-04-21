create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text,
  last_name text,
  phone text,
  country text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.disruptions (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  geography text,
  severity_score double precision,
  raw_signal text,
  affected_nodes jsonb,
  cascade_nodes jsonb,
  status text not null default 'detected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  disruption_id uuid not null references public.disruptions(id) on delete cascade,
  option_index integer not null,
  label text not null,
  description text,
  cost_delta_usd double precision,
  time_delta_days double precision,
  risk_score double precision,
  composite_score double precision,
  recommended boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  disruption_id uuid not null references public.disruptions(id) on delete cascade,
  scenario_id uuid references public.scenarios(id) on delete set null,
  confidence_score double precision,
  auto_executed boolean not null default false,
  human_approved boolean,
  approver_id text,
  status text not null default 'pending',
  outcome text,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  disruption_id uuid references public.disruptions(id) on delete set null,
  decision_id uuid references public.decisions(id) on delete set null,
  action_type text not null,
  reasoning text,
  signals_used jsonb,
  confidence_score double precision,
  actor text not null,
  company_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists disruptions_created_at_idx on public.disruptions (created_at desc);
create index if not exists disruptions_status_idx on public.disruptions (status);
create index if not exists scenarios_disruption_id_idx on public.scenarios (disruption_id);
create index if not exists decisions_disruption_id_idx on public.decisions (disruption_id);
create index if not exists decisions_status_idx on public.decisions (status);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_disruption_id_idx on public.audit_logs (disruption_id);

alter table public.profiles enable row level security;
alter table public.disruptions enable row level security;
alter table public.scenarios enable row level security;
alter table public.decisions enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles read own row" on public.profiles;
create policy "profiles read own row"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles insert own row" on public.profiles;
create policy "profiles insert own row"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles update own row" on public.profiles;
create policy "profiles update own row"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "authenticated read disruptions" on public.disruptions;
create policy "authenticated read disruptions"
on public.disruptions
for select
to authenticated
using (true);

drop policy if exists "authenticated manage disruptions" on public.disruptions;
create policy "authenticated manage disruptions"
on public.disruptions
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated read scenarios" on public.scenarios;
create policy "authenticated read scenarios"
on public.scenarios
for select
to authenticated
using (true);

drop policy if exists "authenticated manage scenarios" on public.scenarios;
create policy "authenticated manage scenarios"
on public.scenarios
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated read decisions" on public.decisions;
create policy "authenticated read decisions"
on public.decisions
for select
to authenticated
using (true);

drop policy if exists "authenticated manage decisions" on public.decisions;
create policy "authenticated manage decisions"
on public.decisions
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated read audit logs" on public.audit_logs;
create policy "authenticated read audit logs"
on public.audit_logs
for select
to authenticated
using (true);

drop policy if exists "authenticated manage audit logs" on public.audit_logs;
create policy "authenticated manage audit logs"
on public.audit_logs
for all
to authenticated
using (true)
with check (true);
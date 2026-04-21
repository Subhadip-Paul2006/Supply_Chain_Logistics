-- ─────────────────────────────────────────────────────────────────────────────
-- R3FLEX — Supabase Schema
-- Run this entire file in the Supabase SQL Editor once.
-- Dashboard > SQL Editor > New query > Paste > Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Created on signup. Foreign-keyed to auth.users.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  first_name  text,
  last_name   text,
  phone       text,
  country     text default 'India',
  state       text,
  email       text,
  created_at  timestamptz default now()
);

-- Allow authenticated users to read/write their own row only
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ── disruptions ───────────────────────────────────────────────────────────────
create table if not exists public.disruptions (
  id              uuid primary key default gen_random_uuid(),
  event_type      text not null,
  geography       text not null,
  severity_score  numeric(4,1) not null default 0,
  raw_signal      text,
  affected_nodes  jsonb,
  cascade_nodes   jsonb,
  status          text not null default 'detected',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.disruptions enable row level security;

-- Any authenticated user can read/insert disruptions (demo — tighten in prod)
create policy "Authenticated read disruptions"
  on public.disruptions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated insert disruptions"
  on public.disruptions for insert
  with check (auth.role() = 'authenticated');


-- ── scenarios ────────────────────────────────────────────────────────────────
create table if not exists public.scenarios (
  id              uuid primary key default gen_random_uuid(),
  disruption_id   uuid references public.disruptions (id) on delete cascade,
  option_index    int not null default 1,
  label           text not null,
  description     text,
  cost_delta_usd  numeric(12,2),
  time_delta_days int,
  risk_score      numeric(4,2),
  composite_score numeric(4,2),
  recommended     boolean default false,
  created_at      timestamptz default now()
);

alter table public.scenarios enable row level security;

create policy "Authenticated read scenarios"
  on public.scenarios for select
  using (auth.role() = 'authenticated');

create policy "Authenticated insert scenarios"
  on public.scenarios for insert
  with check (auth.role() = 'authenticated');


-- ── decisions ────────────────────────────────────────────────────────────────
create table if not exists public.decisions (
  id              uuid primary key default gen_random_uuid(),
  disruption_id   uuid references public.disruptions (id) on delete cascade,
  scenario_id     uuid references public.scenarios (id) on delete set null,
  confidence_score numeric(4,2),
  auto_executed   boolean default false,
  human_approved  boolean,
  approver_id     text,
  status          text not null default 'pending',  -- pending | approved | rejected
  outcome         text,
  executed_at     timestamptz,
  created_at      timestamptz default now()
);

alter table public.decisions enable row level security;

create policy "Authenticated read decisions"
  on public.decisions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated insert decisions"
  on public.decisions for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated update decisions"
  on public.decisions for update
  using (auth.role() = 'authenticated');


-- ── audit_logs ───────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  disruption_id   uuid references public.disruptions (id) on delete cascade,
  decision_id     uuid references public.decisions (id) on delete set null,
  action_type     text not null,
  reasoning       text,
  signals_used    jsonb,
  confidence_score numeric(4,2),
  actor           text,
  company_id      text default 'pharma-distrib-india',
  created_at      timestamptz default now()
);

alter table public.audit_logs enable row level security;

create policy "Authenticated read audit_logs"
  on public.audit_logs for select
  using (auth.role() = 'authenticated');

create policy "Authenticated insert audit_logs"
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

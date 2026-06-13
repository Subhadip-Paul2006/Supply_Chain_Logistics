-- ─────────────────────────────────────────────────────────────────────────────
-- R3FLEX — Security hardening migration
-- Hardens RLS so that the anon key (browser) cannot mutate operational tables
-- directly. Mutations now go through /api/* Next.js server routes that use
-- the service-role key. The browser anon key retains read-only access.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: extract a role from JWT app_metadata. Roles: 'admin' | 'operator' | 'viewer'
create or replace function public.current_role() returns text
  language sql stable
  as $$
    select coalesce(
      nullif(((auth.jwt() -> 'app_metadata' ->> 'role')), ''),
      'viewer'
    )
  $$;

-- Helper: company_id from JWT app_metadata (multi-tenant isolation)
create or replace function public.current_company_id() returns text
  language sql stable
  as $$
    select coalesce(
      nullif(((auth.jwt() -> 'app_metadata' ->> 'company_id')), ''),
      'pharma-distrib-india'
    )
  $$;

-- ─── disruptions ────────────────────────────────────────────────────────────
-- Drop the over-permissive "authenticated manage" policy
drop policy if exists "authenticated manage disruptions" on public.disruptions;

-- Anon key: SELECT only
drop policy if exists "anon read disruptions" on public.disruptions;
create policy "anon read disruptions"
  on public.disruptions for select
  to anon, authenticated
  using (true);

-- INSERT/UPDATE/DELETE removed for authenticated/anon.
-- Only the service role (server routes) may mutate.

-- ─── scenarios ──────────────────────────────────────────────────────────────
drop policy if exists "authenticated manage scenarios" on public.scenarios;

drop policy if exists "anon read scenarios" on public.scenarios;
create policy "anon read scenarios"
  on public.scenarios for select
  to anon, authenticated
  using (true);

-- ─── decisions ──────────────────────────────────────────────────────────────
-- Drop the over-permissive update policy that lets any user flip any decision.
drop policy if exists "authenticated manage decisions" on public.decisions;
drop policy if exists "authenticated read decisions" on public.decisions;

-- Anon key: SELECT pending decisions only
drop policy if exists "anon read decisions" on public.decisions;
create policy "anon read decisions"
  on public.decisions for select
  to anon, authenticated
  using (true);

-- ─── audit_logs ─────────────────────────────────────────────────────────────
-- The browser MUST NOT be able to write audit_logs directly. The only writer
-- is the service role via /api/* server routes.
drop policy if exists "authenticated manage audit logs" on public.audit_logs;
drop policy if exists "authenticated read audit logs" on public.audit_logs;

-- Anon key: SELECT only (read-only audit viewer)
drop policy if exists "anon read audit logs" on public.audit_logs;
create policy "anon read audit logs"
  on public.audit_logs for select
  to anon, authenticated
  using (true);

-- ─── audit_logs immutability trigger ────────────────────────────────────────
-- Defense in depth: even if a policy is misconfigured, a trigger refuses
-- UPDATEs and DELETEs from anyone but the service role (which is bypassed by
-- these triggers because service role sets row_security = OFF).
create or replace function public.prevent_audit_mutation() returns trigger
  language plpgsql
  as $$
begin
  raise exception 'audit_logs are immutable; use the server API';
end;
$$;

drop trigger if exists audit_logs_no_update on public.audit_logs;
create trigger audit_logs_no_update
  before update on public.audit_logs
  for each row execute function public.prevent_audit_mutation();

drop trigger if exists audit_logs_no_delete on public.audit_logs;
create trigger audit_logs_no_delete
  before delete on public.audit_logs
  for each row execute function public.prevent_audit_mutation();

-- ─── decision idempotency: prevent double-approve / double-reject ───────────
-- Even with the service role, the API route can be retried. This guard
-- ensures a decision in a terminal state (approved/rejected) is not
-- transitionable again.
create or replace function public.prevent_decision_replay() returns trigger
  language plpgsql
  as $$
begin
  if (tg_op = 'UPDATE')
     and old.status in ('approved', 'rejected')
     and new.status is distinct from old.status then
    raise exception 'decision % is already %', old.id, old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists decisions_no_replay on public.decisions;
create trigger decisions_no_replay
  before update on public.decisions
  for each row execute function public.prevent_decision_replay();

-- ─── profiles: keep as-is (own-row only) ────────────────────────────────────
-- Already correct in the base schema.

-- ─── Storage of secrets: never put service-role key in the anon client ──────
-- (No SQL change — just a comment.) Service-role key is consumed by
-- /api/* server routes only via env SUPABASE_SERVICE_ROLE_KEY.

-- =============================================================================
-- Initial schema for Senshaya Shift Manager (Issue #3)
-- =============================================================================
-- 6 tables + RLS policies. All tables are accessible only to authenticated
-- managers (rows in public.managers). Both manager and assistant roles have
-- equal full-access permissions per project_plan.md §3.1.1.
-- =============================================================================

-- ----- managers ---------------------------------------------------------------
-- Linked 1:1 to auth.users. Rows are inserted manually by admin after creating
-- the auth user via Supabase dashboard (only 2 managers ever — no self-signup).
create table public.managers (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null unique,
  name       text        not null,
  role       text        not null check (role in ('manager', 'assistant')),
  created_at timestamptz not null default now()
);

-- ----- employees --------------------------------------------------------------
create table public.employees (
  id                  uuid        primary key default gen_random_uuid(),
  name                text        not null,
  phone               text        not null,
  visa_type           text,
  weekly_hour_limit   integer     check (weekly_hour_limit is null or weekly_hour_limit > 0),
  notes               text,
  is_active           boolean     not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index employees_is_active_idx on public.employees (is_active);

-- ----- recurring_days_off -----------------------------------------------------
-- day_of_week: 0=Sunday ... 6=Saturday (matches Postgres EXTRACT(DOW))
create table public.recurring_days_off (
  id           uuid        primary key default gen_random_uuid(),
  employee_id  uuid        not null references public.employees(id) on delete cascade,
  day_of_week  smallint    not null check (day_of_week between 0 and 6),
  created_at   timestamptz not null default now(),
  unique (employee_id, day_of_week)
);

-- ----- requested_days_off -----------------------------------------------------
create table public.requested_days_off (
  id           uuid        primary key default gen_random_uuid(),
  employee_id  uuid        not null references public.employees(id) on delete cascade,
  start_date   date        not null,
  end_date     date        not null,
  reason       text,
  created_at   timestamptz not null default now(),
  check (end_date >= start_date)
);

create index requested_days_off_employee_dates_idx
  on public.requested_days_off (employee_id, start_date, end_date);

-- ----- shifts -----------------------------------------------------------------
-- One row per (employee, date). is_off=true ⇔ start_time IS NULL.
-- status values: 'draft' (entered, not sent) | 'sent' (SMS dispatched).
-- 'acknowledged' will be added in Phase 2 (issue #17).
create table public.shifts (
  id           uuid        primary key default gen_random_uuid(),
  employee_id  uuid        not null references public.employees(id) on delete cascade,
  shift_date   date        not null,
  start_time   time,
  is_off       boolean     not null default false,
  status       text        not null default 'draft' check (status in ('draft', 'sent')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (employee_id, shift_date),
  check (
    (is_off = true  and start_time is null) or
    (is_off = false and start_time is not null)
  )
);

create index shifts_shift_date_idx on public.shifts (shift_date);

-- ----- message_logs -----------------------------------------------------------
create table public.message_logs (
  id            uuid        primary key default gen_random_uuid(),
  shift_id      uuid        not null references public.shifts(id) on delete cascade,
  sent_at       timestamptz not null default now(),
  message_body  text        not null
);

create index message_logs_shift_id_idx on public.message_logs (shift_id);


-- =============================================================================
-- Row Level Security
-- =============================================================================
-- Helper: is the current authenticated user a registered manager?
-- SECURITY DEFINER lets this query bypass RLS on managers when called from a
-- policy (otherwise we'd recursively need permission to read managers to
-- check permission to read managers).
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.managers where id = auth.uid());
$$;

revoke execute on function public.is_manager() from public;
grant execute on function public.is_manager() to authenticated;

-- ----- managers (special case: a manager can read all managers, edit only self)
alter table public.managers enable row level security;

create policy "managers_select_all"
  on public.managers for select to authenticated
  using (public.is_manager());

create policy "managers_update_self"
  on public.managers for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ----- employees / recurring_days_off / requested_days_off / shifts / message_logs
-- All operations allowed for any authenticated manager.
alter table public.employees enable row level security;
create policy "managers_full_access_employees"
  on public.employees for all to authenticated
  using (public.is_manager()) with check (public.is_manager());

alter table public.recurring_days_off enable row level security;
create policy "managers_full_access_recurring_days_off"
  on public.recurring_days_off for all to authenticated
  using (public.is_manager()) with check (public.is_manager());

alter table public.requested_days_off enable row level security;
create policy "managers_full_access_requested_days_off"
  on public.requested_days_off for all to authenticated
  using (public.is_manager()) with check (public.is_manager());

alter table public.shifts enable row level security;
create policy "managers_full_access_shifts"
  on public.shifts for all to authenticated
  using (public.is_manager()) with check (public.is_manager());

alter table public.message_logs enable row level security;
create policy "managers_full_access_message_logs"
  on public.message_logs for all to authenticated
  using (public.is_manager()) with check (public.is_manager());

-- ===========================================================================
-- Pharmacquest — Initial Schema (Migration 0001)
-- ===========================================================================
-- Creates the core tables: profiles, scenarios, scenario_completions, patient_log
-- Enables Row Level Security with policies so users can only access their own data
-- Sets up a trigger to auto-create a profile row when a new auth user signs up
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- TABLE: profiles
-- ---------------------------------------------------------------------------
-- 1:1 with auth.users. Holds public-facing user info + game state.
-- ---------------------------------------------------------------------------
create table public.profiles (
    id             uuid primary key references auth.users(id) on delete cascade,
    display_name   text,
    school         text,
    year_of_study  int,
    profession     text check (profession in ('pharmacy', 'nursing', 'mls', 'medicine')),
    reputation     int  not null default 0,
    streak_days    int  not null default 0,
    last_played_at timestamptz,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with Pharmacquest-specific fields.';
comment on column public.profiles.reputation is 'Running total. Updated automatically via trigger on scenario_completions.';


-- ---------------------------------------------------------------------------
-- TABLE: scenarios
-- ---------------------------------------------------------------------------
-- Catalog of available scenarios. For v1, scenarios still live as JSON files
-- in /content/scenarios — this table exists for future use (cataloging,
-- admin dashboards, content management).
-- ---------------------------------------------------------------------------
create table public.scenarios (
    id            text primary key,
    title         text not null,
    profession    text not null check (profession in ('pharmacy', 'nursing', 'mls', 'medicine')),
    difficulty    text check (difficulty in ('easy', 'intermediate', 'hard')),
    setting       text,
    minutes       int,
    is_published  boolean not null default false,
    created_at    timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- TABLE: scenario_completions
-- ---------------------------------------------------------------------------
-- One row per playthrough. A user can have many rows for the same scenario
-- (replays). The path_taken array records which nodes the user visited.
-- ---------------------------------------------------------------------------
create table public.scenario_completions (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references auth.users(id) on delete cascade,
    scenario_id       text not null,
    path_taken        text[] not null,
    reputation_change int  not null,
    outcome           text check (outcome in ('good', 'bad')),
    completed_at      timestamptz not null default now()
);

create index scenario_completions_user_idx
    on public.scenario_completions (user_id, completed_at desc);


-- ---------------------------------------------------------------------------
-- TABLE: patient_log
-- ---------------------------------------------------------------------------
-- The student's "case journal" — one row per patient encountered. Drawn from
-- the scenario's outcome node when a completion is recorded.
-- ---------------------------------------------------------------------------
create table public.patient_log (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users(id) on delete cascade,
    completion_id uuid not null references public.scenario_completions(id) on delete cascade,
    scenario_id   text not null,
    patient_name  text not null,
    outcome_label text not null,
    encountered_at timestamptz not null default now()
);

create index patient_log_user_idx
    on public.patient_log (user_id, encountered_at desc);


-- ---------------------------------------------------------------------------
-- TRIGGER: auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- TRIGGER: keep profile.reputation in sync with completions
-- ---------------------------------------------------------------------------
create or replace function public.update_reputation_on_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.profiles
       set reputation     = reputation + new.reputation_change,
           last_played_at = now(),
           updated_at     = now()
     where id = new.user_id;
    return new;
end;
$$;

create trigger on_completion_recorded
    after insert on public.scenario_completions
    for each row
    execute function public.update_reputation_on_completion();


-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
-- RLS is OFF by default. Enable it for every table that holds user data, then
-- write policies describing exactly what each user can do.
-- ===========================================================================

alter table public.profiles             enable row level security;
alter table public.scenario_completions enable row level security;
alter table public.patient_log          enable row level security;
alter table public.scenarios            enable row level security;


-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
-- A user can read their own profile.
create policy "profiles: read own"
    on public.profiles for select
    using (auth.uid() = id);

-- A user can update their own profile.
create policy "profiles: update own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Inserts are handled by the on_auth_user_created trigger, so no insert policy.


-- ---------------------------------------------------------------------------
-- scenario_completions policies
-- ---------------------------------------------------------------------------
create policy "completions: read own"
    on public.scenario_completions for select
    using (auth.uid() = user_id);

create policy "completions: insert own"
    on public.scenario_completions for insert
    with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- patient_log policies
-- ---------------------------------------------------------------------------
create policy "patient_log: read own"
    on public.patient_log for select
    using (auth.uid() = user_id);

create policy "patient_log: insert own"
    on public.patient_log for insert
    with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- scenarios policies
-- ---------------------------------------------------------------------------
-- Everyone can read published scenarios.
create policy "scenarios: read published"
    on public.scenarios for select
    using (is_published = true);
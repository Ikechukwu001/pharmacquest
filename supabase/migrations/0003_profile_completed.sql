-- ===========================================================================
-- Pharmacquest — Profile completion flag (Migration 0003)
-- ===========================================================================
-- Adds a profile_completed boolean so we can route brand-new users
-- through the profile setup flow before letting them into the app.
-- ===========================================================================

alter table public.profiles
    add column if not exists profile_completed boolean not null default false;

-- Backfill: any existing user with a school AND year AND profession is
-- considered "completed" — they don't need to go through the setup.
update public.profiles
   set profile_completed = true
 where school is not null
   and year_of_study is not null
   and profession is not null;
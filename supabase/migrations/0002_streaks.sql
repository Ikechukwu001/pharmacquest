-- ===========================================================================
-- Pharmacquest — Streak logic (Migration 0002)
-- ===========================================================================
-- Update the existing reputation trigger to also handle streak progression.
-- ===========================================================================

create or replace function public.update_reputation_on_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    last_play   date;
    today_date  date := (now() at time zone 'UTC')::date;
    current_streak int;
begin
    -- Fetch the current profile's last_played_at date and streak.
    select last_played_at::date, streak_days
      into last_play, current_streak
      from public.profiles
     where id = new.user_id;

    -- Compute the new streak.
    if last_play is null then
        current_streak := 1;
    elsif last_play = today_date then
        -- Already played today, streak unchanged.
        current_streak := coalesce(current_streak, 1);
    elsif last_play = today_date - 1 then
        -- Played yesterday, streak continues.
        current_streak := coalesce(current_streak, 0) + 1;
    else
        -- Gap of 2+ days, streak resets.
        current_streak := 1;
    end if;

    update public.profiles
       set reputation     = reputation + new.reputation_change,
           streak_days    = current_streak,
           last_played_at = now(),
           updated_at     = now()
     where id = new.user_id;

    return new;
end;
$$;
-- N.7.2 + N.7.3: child goal/reminder flags, email + reminder settings, reset progress, family codes, cron.
alter table public.children
  add column if not exists daily_goal_min smallint not null default 5 check (daily_goal_min in (3, 5, 10, 15)),
  add column if not exists reminder boolean not null default true;
grant update (daily_goal_min, reminder) on public.children to authenticated;

alter table public.profiles
  add column if not exists weekly_day smallint not null default 0 check (weekly_day between 0 and 6), -- 0 = Sunday
  add column if not exists reminder_on boolean not null default false,
  add column if not exists reminder_hour smallint not null default 18 check (reminder_hour between 0 and 23),
  add column if not exists timezone text not null default 'UTC',
  add column if not exists gurpurab_reminders boolean not null default true,
  add column if not exists email_token uuid not null default gen_random_uuid(),
  add column if not exists last_reminder_on date,
  add column if not exists last_weekly_on date;
grant update (weekly_day, reminder_on, reminder_hour, timezone, gurpurab_reminders) on public.profiles to authenticated;
grant select (weekly_day, reminder_on, reminder_hour, timezone, gurpurab_reminders) on public.profiles to authenticated; -- email_token / last_* stay server-only

-- Etiquette quiz is part of the free Culture screens.
create or replace function public.item_is_free(p_kind text, p_item text)
returns boolean language sql immutable set search_path to '' as $$
  select case
    when p_kind = 'letter' then coalesce(nullif(regexp_replace(p_item, '\D', '', 'g'), '')::int, 999) <= 10
    when p_kind = 'sakhi' then coalesce(nullif(regexp_replace(p_item, '\D', '', 'g'), '')::int, 999) <= 2
    when p_kind = 'paath' then true
    when p_kind = 'quiz' then p_item in ('etiquette')
    else false
  end;
$$;

-- Reset progress (separate from removing the child).
create or replace function public.reset_child_progress(p_child uuid)
returns void language plpgsql security definer set search_path to '' as $$
begin
  if not exists (select 1 from public.children where id = p_child and parent_id = (select auth.uid())) then
    raise exception 'NOT_FOUND';
  end if;
  delete from public.progress where child_id = p_child;
  delete from public.activity where child_id = p_child;
  update public.children set streak_days = 0, last_active_date = null where id = p_child;
end $$;
revoke all on function public.reset_child_progress(uuid) from public, anon;
grant execute on function public.reset_child_progress(uuid) to authenticated;

-- Family code for a 2nd device: 6 digits, 10 minutes, single use, Family plan only.
create or replace function public.create_family_code()
returns json language plpgsql security definer set search_path to '' as $$
declare uid uuid := (select auth.uid()); c text; e timestamptz := now() + interval '10 minutes';
begin
  if uid is null then raise exception 'NOT_FOUND'; end if;
  if not public.is_family(uid) then raise exception 'FAMILY_ONLY'; end if;
  delete from public.family_codes where parent_id = uid or expires_at < now();
  loop
    c := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from public.family_codes where code = c);
  end loop;
  insert into public.family_codes (code, parent_id, expires_at) values (c, uid, e);
  return json_build_object('code', c, 'expires_at', e);
end $$;
revoke all on function public.create_family_code() from public, anon;
grant execute on function public.create_family_code() to authenticated;

-- Failed join attempts (rate limit in the join-family Edge Function). Service role only.
create table if not exists public.family_code_attempts (ip text not null, at timestamptz not null default now());
alter table public.family_code_attempts enable row level security;
create index if not exists family_code_attempts_ip_at on public.family_code_attempts (ip, at);

-- Scheduling (weekly summary + reminders run hourly; the function picks who is due in their own timezone).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- N.7.1: daily learning time per child (for the parent dashboard + weekly email). Applied via Supabase MCP.
create table public.activity (
  child_id uuid not null references public.children(id) on delete cascade,
  day date not null,
  seconds integer not null default 0 check (seconds >= 0 and seconds <= 86400),
  primary key (child_id, day)
);
alter table public.activity enable row level security;
create policy "own activity read" on public.activity for select
  using (exists (select 1 from public.children c where c.id = activity.child_id and c.parent_id = (select auth.uid())));
-- Writes only through log_activity (caps each call at 300 s, day within ±1 of today).

create or replace function public.log_activity(p_child uuid, p_seconds integer, p_day date default current_date)
returns integer language plpgsql security definer set search_path to '' as $$
declare s integer;
begin
  if not exists (select 1 from public.children where id = p_child and parent_id = (select auth.uid())) then
    raise exception 'NOT_FOUND';
  end if;
  if p_day < current_date - 1 or p_day > current_date + 1 then raise exception 'BAD_DAY'; end if;
  insert into public.activity (child_id, day, seconds)
  values (p_child, p_day, least(greatest(p_seconds, 0), 300))
  on conflict (child_id, day) do update set seconds = least(public.activity.seconds + excluded.seconds, 86400)
  returning seconds into s;
  return s;
end $$;
revoke all on function public.log_activity(uuid, integer, date) from public, anon;
grant execute on function public.log_activity(uuid, integer, date) to authenticated;
grant select on public.activity to authenticated;

-- N.9.2 Contact form rate limit (5 per IP per hour). Message content is never stored — only emailed via Resend.
create table if not exists public.contact_attempts (
  ip text not null,
  at timestamptz not null default now()
);
create index if not exists contact_attempts_ip_at on public.contact_attempts (ip, at);
alter table public.contact_attempts enable row level security;
-- No policies: only the Edge Function (service role) reads/writes.

-- Run once in your Supabase SQL editor (Dashboard → SQL Editor → New query)

create table if not exists public.whoop_tokens (
  user_id       text        primary key,
  access_token  text        not null,
  refresh_token text        not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row-Level Security: enable it so anon key can't read tokens directly
alter table public.whoop_tokens enable row level security;
-- The service-role key (used by our Next.js server) bypasses RLS automatically.

-- Optional: keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_whoop_tokens_updated_at on public.whoop_tokens;
create trigger trg_whoop_tokens_updated_at
  before update on public.whoop_tokens
  for each row execute function public.set_updated_at();

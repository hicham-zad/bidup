create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  handle text not null,
  title text,
  description text,
  image_url text,
  amount_cents integer not null default 0,
  lifetime_cents integer not null default 0,
  clicks integer not null default 0,
  last_bid_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

-- RLS Policies
alter table public.entries enable row level security;

-- Allow public read access
create policy "Allow public read-only access"
  on public.entries
  for select
  using (true);

-- No public insert, update, or delete policies.
-- All writes must be done using the service role key.

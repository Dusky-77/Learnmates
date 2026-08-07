create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id text not null,
  device_name text not null,
  status text not null default 'lobby' check (status in ('lobby', 'locked', 'open')),
  lock_until timestamptz,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, device_id)
);

alter table public.user_devices enable row level security;

drop policy if exists "Users can view own devices" on public.user_devices;
create policy "Users can view own devices"
  on public.user_devices for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own devices" on public.user_devices;
create policy "Users can insert own devices"
  on public.user_devices for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own devices" on public.user_devices;
create policy "Users can update own devices"
  on public.user_devices for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own devices" on public.user_devices;
create policy "Users can delete own devices"
  on public.user_devices for delete using (auth.uid() = user_id);

-- Add to publications for realtime
alter publication supabase_realtime add table public.user_devices;

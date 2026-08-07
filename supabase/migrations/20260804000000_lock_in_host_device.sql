alter table public.user_devices add column if not exists is_host boolean not null default false;

create table if not exists public.lock_in_sessions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active')),
  session_minutes int not null,
  started_at timestamptz not null default now(),
  paused_duration_ms bigint not null default 0,
  breaks_allowed int not null default 0,
  breaks_taken int not null default 0,
  current_break_started_at timestamptz,
  tab_left_at timestamptz,
  tab_left_device_id text,
  updated_at timestamptz not null default now()
);

alter table public.lock_in_sessions enable row level security;

drop policy if exists "Users can view own session" on public.lock_in_sessions;
create policy "Users can view own session"
  on public.lock_in_sessions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own session" on public.lock_in_sessions;
create policy "Users can insert own session"
  on public.lock_in_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own session" on public.lock_in_sessions;
create policy "Users can update own session"
  on public.lock_in_sessions for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own session" on public.lock_in_sessions;
create policy "Users can delete own session"
  on public.lock_in_sessions for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table public.lock_in_sessions;

CREATE OR REPLACE FUNCTION update_lock_in_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

drop trigger if exists update_lock_in_sessions_updated_at_trigger on public.lock_in_sessions;
CREATE TRIGGER update_lock_in_sessions_updated_at_trigger
    BEFORE UPDATE ON public.lock_in_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_lock_in_sessions_updated_at();

notify pgrst, 'reload schema';

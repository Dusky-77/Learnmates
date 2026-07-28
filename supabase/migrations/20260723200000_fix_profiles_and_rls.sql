-- Fix profiles table + RLS for existing Learnmates Supabase projects.
-- Safe to run multiple times.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists profile_complete boolean not null default false;
alter table public.profiles add column if not exists onboarding_skipped boolean not null default false;
alter table public.profiles add column if not exists study_level text;
alter table public.profiles add column if not exists boards text[] default array[]::text[];
alter table public.profiles add column if not exists exam_session text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1),
      'Student'
    )
  )
  on conflict (id) do update
    set updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for auth users created before the trigger existed
insert into public.profiles (id, name)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(coalesce(u.email, ''), '@', 1),
    'Student'
  )
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

alter table public.profiles enable row level security;
alter table public.user_favorite_subjects enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can manage own favorite subjects" on public.user_favorite_subjects;
create policy "Users can select own favorite subjects"
  on public.user_favorite_subjects for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorite subjects" on public.user_favorite_subjects;
create policy "Users can insert own favorite subjects"
  on public.user_favorite_subjects for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own favorite subjects" on public.user_favorite_subjects;
create policy "Users can update own favorite subjects"
  on public.user_favorite_subjects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorite subjects" on public.user_favorite_subjects;
create policy "Users can delete own favorite subjects"
  on public.user_favorite_subjects for delete using (auth.uid() = user_id);

notify pgrst, 'reload schema';

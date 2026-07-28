-- Auth helper functions for Learnmates login flow
-- Run via Supabase CLI (`supabase db push`) or paste into SQL Editor.

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

create or replace function public.get_email_auth_info(check_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  user_record record;
  provider_list text[];
begin
  select u.id, u.email_confirmed_at
  into user_record
  from auth.users u
  where lower(u.email) = lower(trim(check_email))
  limit 1;

  if not found then
    return json_build_object(
      'exists', false,
      'providers', '[]'::json,
      'email_confirmed', false
    );
  end if;

  select coalesce(array_agg(distinct i.provider), array[]::text[])
  into provider_list
  from auth.identities i
  where i.user_id = user_record.id;

  return json_build_object(
    'exists', true,
    'providers', to_json(provider_list),
    'email_confirmed', user_record.email_confirmed_at is not null
  );
end;
$$;

revoke all on function public.get_email_auth_info(text) from public;
grant execute on function public.get_email_auth_info(text) to anon, authenticated;

-- Single-parameter RPC avoids PostgREST optional-arg schema-cache issues
create or replace function public.is_username_taken(check_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where lower(p.username) = lower(trim(check_username))
  );
$$;

revoke all on function public.is_username_taken(text) from public;
grant execute on function public.is_username_taken(text) to anon, authenticated;

-- Keep two-arg overload for callers that pass the current user id
create or replace function public.is_username_available(desired_username text, for_user_id uuid default null)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles p
    where lower(p.username) = lower(trim(desired_username))
      and (for_user_id is null or p.id <> for_user_id)
  );
$$;

revoke all on function public.is_username_available(text, uuid) from public;
grant execute on function public.is_username_available(text, uuid) to anon, authenticated;

notify pgrst, 'reload schema';

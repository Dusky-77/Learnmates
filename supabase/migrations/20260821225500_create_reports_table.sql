create table public.reports (
    id bigserial primary key,
    user_id text,
    url text not null,
    description text,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.reports enable row level security;

-- Allow anyone to insert reports
create policy "Anyone can insert reports"
    on public.reports for insert
    to anon, authenticated
    with check (true);

-- Allow admins or specific roles to view reports if needed
-- create policy "Admins can view reports"
--     on public.reports for select
--     to authenticated
--     using ( ... );

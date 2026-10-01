-- ==============================================================================
-- UsTwo Database Schema & Security Configuration
-- Compatible with fresh setups and existing Supabase projects (additive migrations)
-- ==============================================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Table: public.events
-- ------------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  end_date date,
  time time,
  category text,
  mood text,
  description text,
  tasks jsonb default '[]'::jsonb,
  favorite boolean default false,
  confirmed_by text[] default array[]::text[],
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Additive column migrations (preserves existing table and adds missing columns)
alter table public.events add column if not exists title text;
alter table public.events add column if not exists date date;
alter table public.events add column if not exists end_date date;
alter table public.events add column if not exists time time;
alter table public.events add column if not exists category text;
alter table public.events add column if not exists mood text;
alter table public.events add column if not exists description text;
alter table public.events add column if not exists tasks jsonb default '[]'::jsonb;
alter table public.events add column if not exists favorite boolean default false;
alter table public.events add column if not exists confirmed_by text[] default array[]::text[];
alter table public.events add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.events add column if not exists created_at timestamptz default now();

-- Ensure non-null constraints if applicable
alter table public.events alter column title set not null;
alter table public.events alter column date set not null;

-- Index for fast date lookups and ordering
create index if not exists idx_events_date on public.events(date);
create index if not exists idx_events_created_by on public.events(created_by);

-- ------------------------------------------------------------------------------
-- 2. Table: public.event_photos
-- ------------------------------------------------------------------------------
create table if not exists public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  storage_path text not null,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Additive column migrations for event_photos
alter table public.event_photos add column if not exists event_id uuid references public.events(id) on delete cascade;
alter table public.event_photos add column if not exists storage_path text;
alter table public.event_photos add column if not exists added_by uuid references auth.users(id) on delete set null;
alter table public.event_photos add column if not exists created_at timestamptz default now();

create index if not exists idx_event_photos_event_id on public.event_photos(event_id);

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS)
-- ------------------------------------------------------------------------------
-- Enable RLS
alter table public.events enable row level security;
alter table public.event_photos enable row level security;

-- NOTE FOR COUPLE PARTNERS:
-- Public sign-ups are DISABLED in Supabase Auth (Dashboard -> Authentication -> Providers -> Email -> toggle OFF "Allow new users to sign up").
-- Only the two partner accounts exist in auth.users.
-- The policies below restrict full access (select, insert, update, delete) to authenticated users (the two partners).
-- If you wish to explicitly restrict to exact UUIDs, replace `auth.role() = 'authenticated'`
-- with `auth.uid() in ('<partner-1-uuid>', '<partner-2-uuid>')`.

-- Events policies
drop policy if exists "Partners have full access to events" on public.events;
create policy "Partners have full access to events"
  on public.events
  for all
  to authenticated
  using (true)
  with check (true);

-- Event photos policies
drop policy if exists "Partners have full access to event photos" on public.event_photos;
create policy "Partners have full access to event photos"
  on public.event_photos
  for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------------------------
-- 4. Realtime Subscription
-- ------------------------------------------------------------------------------
-- Enable Supabase Realtime replication on events and event_photos
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'events'
  ) then
    alter publication supabase_realtime add table public.events;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'event_photos'
  ) then
    alter publication supabase_realtime add table public.event_photos;
  end if;
end $$;

-- ------------------------------------------------------------------------------
-- 5. Private Storage Bucket: 'memories'
-- ------------------------------------------------------------------------------
-- Create private bucket with 10MB file limit and image MIME restrictions
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories',
  'memories',
  false,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/svg+xml']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/svg+xml'];

-- Storage bucket RLS policies for 'memories' bucket
drop policy if exists "Partners can view private memories photos" on storage.objects;
create policy "Partners can view private memories photos"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'memories');

drop policy if exists "Partners can upload memories photos" on storage.objects;
create policy "Partners can upload memories photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'memories'
    and (octet_length(decode(replace(encode(content, 'base64'), E'\n', ''), 'base64')) <= 10485760 or content is null)
  );

drop policy if exists "Partners can update memories photos" on storage.objects;
create policy "Partners can update memories photos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'memories')
  with check (bucket_id = 'memories');

drop policy if exists "Partners can delete memories photos" on storage.objects;
create policy "Partners can delete memories photos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'memories');

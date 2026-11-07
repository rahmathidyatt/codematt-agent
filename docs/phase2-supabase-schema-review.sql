-- Codematt Agent Phase 2: SQL REVIEW DRAFT ONLY. DO NOT RUN WITHOUT
-- identifying a DEDICATED Codematt Supabase project and reviewing migrations.
-- Not applied in this audit. NEVER run on hybrid-office-test or brighton-cibubur.
--
-- This schema is intentionally minimal: supports future account-isolated
-- persistence without changing the current demo localStorage experience.
-- After review, use 'supabase migration new codematt_phase2_initial' via the
-- installed Supabase CLI in a dedicated local workspace to generate the official
-- migration filename; then copy reviewed SQL into that generated file.

create table if not exists public.codematt_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  agency_name text check (char_length(agency_name) <= 120),
  created_at timestamptz not null default now()
);

create table if not exists public.codematt_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 180),
  location text not null check (char_length(btrim(location)) between 2 and 250),
  price numeric(18,2) check (price >= 0),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create index if not exists codematt_listings_user_created_idx
  on public.codematt_listings (user_id, created_at desc);

alter table public.codematt_profiles enable row level security;
alter table public.codematt_profiles force row level security;
alter table public.codematt_listings enable row level security;
alter table public.codematt_listings force row level security;

revoke all on public.codematt_profiles from PUBLIC, anon;
revoke all on public.codematt_listings from PUBLIC, anon;
grant select, insert, update, delete on public.codematt_profiles to authenticated;
grant select, insert, update, delete on public.codematt_listings to authenticated;

-- Migration runner must ensure the following policy names are unique and
-- inspect existing policies before deploying. Do not DROP policies blindly.
create policy codematt_profiles_read on public.codematt_profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy codematt_profiles_insert on public.codematt_profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy codematt_profiles_update on public.codematt_profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy codematt_profiles_delete on public.codematt_profiles
  for delete to authenticated using ((select auth.uid()) = id);

create policy codematt_listings_read on public.codematt_listings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy codematt_listings_insert on public.codematt_listings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy codematt_listings_update on public.codematt_listings
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy codematt_listings_delete on public.codematt_listings
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Verification gates AFTER applying in an isolated test project:
-- anon cannot select or insert; user A cannot select/insert/update/delete
-- user B's rows, including spoofing user_id; profile roles are not writable;
-- RLS advisors should report no unexpected bypasses; API grants verified.

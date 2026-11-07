-- Isolated PostgreSQL test fixture, NOT an application migration.
-- Emulates the minimal Supabase roles and auth.uid() behavior in GitHub Actions.
-- Only run against a disposable CI PostgreSQL service.
create role anon nologin;
create role authenticated nologin;

create schema auth;
create table auth.users (id uuid primary key);

create function auth.uid()
returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

insert into auth.users (id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

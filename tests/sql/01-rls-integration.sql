-- Execute only on a disposable PostgreSQL test instance.
-- Requires: tests/sql/00-bootstrap.sql and the reviewed draft schema.
-- Auth JWT signature validation, session management, and real Supabase API
-- configuration are out of scope of this SQL-level policy integration test.
\set ON_ERROR_STOP on

-- Capture Postgres RLS status and ensure policies were installed.
do $$
declare policy_count integer;
begin
  if not (select relrowsecurity and relforcerowsecurity from pg_class
          where oid = 'public.codematt_listings'::regclass) then
    raise exception 'FAIL: listing RLS or FORCE RLS is disabled';
  end if;
  if not (select relrowsecurity and relforcerowsecurity from pg_class
          where oid = 'public.codematt_profiles'::regclass) then
    raise exception 'FAIL: profile RLS or FORCE RLS is disabled';
  end if;
  select count(*) into policy_count from pg_policies
  where schemaname = 'public' and tablename in ('codematt_profiles','codematt_listings');
  if policy_count <> 8 then
    raise exception 'FAIL: expected 8 dedicated policies; got %', policy_count;
  end if;
end $$;

-- USER A: can insert and read own profile and listing.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
insert into public.codematt_profiles (id, full_name)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Alice');
insert into public.codematt_listings (user_id, name, location, price)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Alice listing', 'Bogor', 100.00);

do $$
declare n integer;
begin
  select count(*) into n from public.codematt_profiles;
  if n <> 1 then raise exception 'FAIL: A profile not readable'; end if;
  select count(*) into n from public.codematt_listings;
  if n <> 1 then raise exception 'FAIL: A listing not readable'; end if;
end $$;
commit;

-- USER B: cannot read, insert, update, or delete A's data.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', true);

do $$
declare n integer;
begin
  select count(*) into n from public.codematt_profiles;
  if n <> 0 then raise exception 'FAIL: user B can view A profile'; end if;
  select count(*) into n from public.codematt_listings;
  if n <> 0 then raise exception 'FAIL: user B can view A listing'; end if;

  begin
    insert into public.codematt_listings (user_id, name, location)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Spoofed listing', 'Bogor');
    raise exception 'FAIL: B inserted a listing owned by A';
  exception
    when insufficient_privilege then null; -- RLS WITH CHECK violation.
  end;

  begin
    insert into public.codematt_profiles (id, full_name)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Spoofed');
    raise exception 'FAIL: B inserted A profile';
  exception
    when insufficient_privilege then null;
  end;

  update public.codematt_listings set location = 'Tampered'
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: B updated A listing'; end if;

  delete from public.codematt_listings
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: B deleted A listing'; end if;
end $$;

-- B's own records remain available.
insert into public.codematt_profiles (id, full_name)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Bob');
insert into public.codematt_listings (user_id, name, location, price)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Bob listing', 'Kendari', 200.00);

-- RLS update WITH CHECK must also prevent B reassigning their record to A.
do $$
begin
  begin
    update public.codematt_listings
    set user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    where name = 'Bob listing';
    raise exception 'FAIL: B reassigned their listing to A';
  exception
    when insufficient_privilege then null;
  end;
  begin
    update public.codematt_profiles
    set id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    where full_name = 'Bob';
    raise exception 'FAIL: B reassigned their profile to A';
  exception
    when insufficient_privilege then null;
  end;
end $$;
commit;

-- User A still owns and can see only their original records.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
do $$
declare n integer;
begin
  select count(*) into n from public.codematt_listings;
  if n <> 1 then raise exception 'FAIL: A can see B listing or lost own listing'; end if;
  select count(*) into n from public.codematt_listings
  where name = 'Alice listing' and location = 'Bogor';
  if n <> 1 then raise exception 'FAIL: A listing was changed'; end if;
  select count(*) into n from public.codematt_profiles;
  if n <> 1 then raise exception 'FAIL: A can see B profile or lost own profile'; end if;
end $$;
commit;

-- USER B: legitimate UPDATE and DELETE of own data must keep working.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', true);
do $
declare n integer;
begin
  update public.codematt_listings set location = 'Konawe'
  where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: B cannot update own listing'; end if;
  update public.codematt_profiles set full_name = 'Bob Updated'
  where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: B cannot update own profile'; end if;
  delete from public.codematt_listings
  where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: B cannot delete own listing'; end if;
  delete from public.codematt_profiles
  where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: B cannot delete own profile'; end if;
end $;
commit;

-- ANON: table privileges are denied; policy does not grant access.
begin;
set local role anon;
do $$
begin
  begin
    perform 1 from public.codematt_listings limit 1;
    raise exception 'FAIL: anon can select listings';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.codematt_listings (user_id, name, location)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Anon entry', 'Bogor');
    raise exception 'FAIL: anon inserted listing';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.codematt_profiles limit 1;
    raise exception 'FAIL: anon can select profiles';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- Unauthenticated client that inherits authenticated role but has no subject:
-- auth.uid() must be NULL and cannot see data.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);
do $$
declare n integer;
begin
  select count(*) into n from public.codematt_listings;
  if n <> 0 then raise exception 'FAIL: empty subject accessed listing'; end if;
  select count(*) into n from public.codematt_profiles;
  if n <> 0 then raise exception 'FAIL: empty subject accessed profile'; end if;
  begin
    insert into public.codematt_listings (user_id, name, location)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'No subject', 'Bogor');
    raise exception 'FAIL: authenticated role without subject inserted listing';
  exception when insufficient_privilege then null;
  end;
end $;
commit;

select 'LOCAL PostgreSQL RLS INTEGRATION PASS: two tenants, spoofing, updates, deletes, anonymous, missing subject' as result;

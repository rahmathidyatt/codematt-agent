-- Billing & quota integration test. Disposable CI PostgreSQL only.
-- Run after 00-bootstrap.sql and supabase/migrations/20261118000000_codematt_billing_quota.sql.
\set ON_ERROR_STOP 1

do $$
declare
  a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  b uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  r jsonb;
  end1 timestamptz;
  end2 timestamptz;
begin
  -- Quota: limit 2, third call is refused.
  r := public.codematt_consume_quota(a, 'chat', 2, 'key_aaaaaaaaaaaaaaaa1', 'google');
  if not (r->>'allowed')::boolean or (r->>'used')::int <> 1 then raise exception 'FAIL first consume %', r; end if;
  r := public.codematt_consume_quota(a, 'chat', 2, 'key_aaaaaaaaaaaaaaaa2', 'google');
  if not (r->>'allowed')::boolean or (r->>'used')::int <> 2 then raise exception 'FAIL second consume %', r; end if;
  r := public.codematt_consume_quota(a, 'chat', 2, 'key_aaaaaaaaaaaaaaaa3', 'google');
  if (r->>'allowed')::boolean then raise exception 'FAIL limit not enforced %', r; end if;

  -- Idempotent retry does not count twice.
  r := public.codematt_consume_quota(a, 'chat', 2, 'key_aaaaaaaaaaaaaaaa2', 'google');
  if not (r->>'allowed')::boolean or (r->>'used')::int <> 2 then raise exception 'FAIL idempotency %', r; end if;

  -- Refund frees a unit.
  perform public.codematt_refund_quota(a, 'key_aaaaaaaaaaaaaaaa2');
  r := public.codematt_usage_summary(a);
  if (r->>'chat')::int <> 1 then raise exception 'FAIL refund %', r; end if;

  -- Metrics and users are separate.
  r := public.codematt_consume_quota(a, 'ai_photo', 1, 'key_aaaaaaaaaaaaaaaa4', 'openai');
  if not (r->>'allowed')::boolean then raise exception 'FAIL separate metric'; end if;
  r := public.codematt_consume_quota(b, 'chat', 1, 'key_aaaaaaaaaaaaaaaa1', 'google');
  if not (r->>'allowed')::boolean then raise exception 'FAIL users not isolated'; end if;

  -- Orders: wrong amount goes to review, no plan.
  perform public.codematt_create_order('CM-PRO-TESTWRONGAMT', a, 'pro', 149000);
  r := public.codematt_mark_order_paid('CM-PRO-TESTWRONGAMT', 1000, 'tx-1');
  if (r->>'ok')::boolean then raise exception 'FAIL amount mismatch accepted'; end if;
  if exists (select 1 from public.codematt_subscriptions where user_id = a) then
    raise exception 'FAIL subscription created on mismatch';
  end if;

  -- Correct amount activates 30 days; webhook replay is a no-op.
  perform public.codematt_create_order('CM-PRO-TESTORDER0001', a, 'pro', 149000);
  r := public.codematt_mark_order_paid('CM-PRO-TESTORDER0001', 149000, 'tx-2');
  if not (r->>'ok')::boolean then raise exception 'FAIL pay %', r; end if;
  select current_period_end into end1 from public.codematt_subscriptions where user_id = a and plan_id = 'pro';
  if end1 is null or end1 < now() + interval '29 days' then raise exception 'FAIL period %', end1; end if;
  r := public.codematt_mark_order_paid('CM-PRO-TESTORDER0001', 149000, 'tx-2');
  if not (r->>'duplicate')::boolean then raise exception 'FAIL replay not detected'; end if;
  select current_period_end into end2 from public.codematt_subscriptions where user_id = a;
  if end2 <> end1 then raise exception 'FAIL replay extended period'; end if;

  -- Renewal of the same plan stacks 30 more days.
  perform public.codematt_create_order('CM-PRO-TESTORDER0002', a, 'pro', 149000);
  perform public.codematt_mark_order_paid('CM-PRO-TESTORDER0002', 149000, 'tx-3');
  select current_period_end into end2 from public.codematt_subscriptions where user_id = a;
  if end2 < end1 + interval '29 days' then raise exception 'FAIL renewal did not stack'; end if;

  -- Failed marks only pending orders.
  perform public.codematt_mark_order_failed('CM-PRO-TESTORDER0002');
  if (select status from public.codematt_payment_orders where order_id = 'CM-PRO-TESTORDER0002') <> 'paid' then
    raise exception 'FAIL paid order downgraded';
  end if;
end $$;

-- Browser roles cannot call write functions or write tables.
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', false);
do $$
begin
  begin
    perform public.codematt_consume_quota('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'chat', 99999, 'key_bbbbbbbbbbbbbbbb9', 'google');
    raise exception 'FAIL authenticated executed consume_quota';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.codematt_mark_order_paid('CM-PRO-TESTORDER0001', 149000, 'x');
    raise exception 'FAIL authenticated executed mark_order_paid';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.codematt_subscriptions values
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'pro', 'active', now(), now() + interval '1 year', now());
    raise exception 'FAIL authenticated inserted subscription';
  exception when insufficient_privilege then null;
  end;
  -- B sees none of A's rows.
  if exists (select 1 from public.codematt_subscriptions) then raise exception 'FAIL B sees A subscription'; end if;
  if exists (select 1 from public.codematt_payment_orders) then raise exception 'FAIL B sees A orders'; end if;
  if (select count(*) from public.codematt_usage_events) <> 1 then raise exception 'FAIL B usage visibility'; end if;
end $$;
reset role;

set role anon;
do $$
begin
  begin
    perform 1 from public.codematt_subscriptions;
    raise exception 'FAIL anon read subscriptions';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

select 'billing-quota tests passed' as result;

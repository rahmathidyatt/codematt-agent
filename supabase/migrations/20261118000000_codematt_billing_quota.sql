-- Codematt Agent: subscriptions, payment orders and monthly AI quota.
-- Apply ONLY to the dedicated Codematt Supabase project, after review:
--   supabase db push   (or paste into the SQL editor of that project)
-- Never apply to brighton-cibubur or other shared projects.
--
-- Security model
--   * Browsers (anon / authenticated) may READ their own rows only.
--   * Every write goes through SECURITY DEFINER functions that only the
--     server (service_role, via the sb_secret_ key) may execute.
--   * Prices and limits come from server code; the DB re-checks amounts.

create table if not exists public.codematt_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('free', 'starter', 'pro', 'team')),
  status text not null check (status in ('active', 'expired', 'canceled')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null check (current_period_end > current_period_start),
  updated_at timestamptz not null default now()
);

create table if not exists public.codematt_payment_orders (
  order_id text primary key check (order_id ~ '^CM-[A-Z0-9-]{8,60}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('starter', 'pro')),
  gross_amount bigint not null check (gross_amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'review')),
  midtrans_transaction_id text check (char_length(midtrans_transaction_id) <= 80),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists codematt_payment_orders_user_idx
  on public.codematt_payment_orders (user_id, created_at desc);

create table if not exists public.codematt_usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  metric text not null check (metric in ('chat', 'ai_photo')),
  provider text check (provider in ('google', 'openai', 'anthropic')),
  idempotency_key text not null check (idempotency_key ~ '^[A-Za-z0-9_-]{16,80}$'),
  period_start date not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index if not exists codematt_usage_events_period_idx
  on public.codematt_usage_events (user_id, metric, period_start);

alter table public.codematt_subscriptions enable row level security;
alter table public.codematt_subscriptions force row level security;
alter table public.codematt_payment_orders enable row level security;
alter table public.codematt_payment_orders force row level security;
alter table public.codematt_usage_events enable row level security;
alter table public.codematt_usage_events force row level security;

revoke all on public.codematt_subscriptions, public.codematt_payment_orders, public.codematt_usage_events
  from public, anon, authenticated;
grant select on public.codematt_subscriptions, public.codematt_payment_orders, public.codematt_usage_events
  to authenticated;

create policy codematt_subscriptions_read_own on public.codematt_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy codematt_payment_orders_read_own on public.codematt_payment_orders
  for select to authenticated using ((select auth.uid()) = user_id);
create policy codematt_usage_events_read_own on public.codematt_usage_events
  for select to authenticated using ((select auth.uid()) = user_id);

-- Current quota period: calendar month in Asia/Jakarta.
create or replace function public.codematt_current_period()
returns date
language sql stable
set search_path = ''
as $$
  select (date_trunc('month', now() at time zone 'Asia/Jakarta'))::date;
$$;

-- Consume one unit atomically. Idempotent per (user, key).
create or replace function public.codematt_consume_quota(
  p_user uuid, p_metric text, p_limit integer, p_key text, p_provider text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period date := public.codematt_current_period();
  v_used integer;
begin
  if p_limit is null or p_limit < 0 or p_limit > 100000 then
    raise exception 'invalid limit';
  end if;
  -- Serialise concurrent requests of the same user + metric.
  perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':' || p_metric, 0));

  if exists (select 1 from public.codematt_usage_events where user_id = p_user and idempotency_key = p_key) then
    select count(*) into v_used from public.codematt_usage_events
      where user_id = p_user and metric = p_metric and period_start = v_period;
    return jsonb_build_object('allowed', true, 'used', v_used, 'duplicate', true);
  end if;

  select count(*) into v_used from public.codematt_usage_events
    where user_id = p_user and metric = p_metric and period_start = v_period;
  if v_used >= p_limit then
    return jsonb_build_object('allowed', false, 'used', v_used);
  end if;

  insert into public.codematt_usage_events (user_id, metric, provider, idempotency_key, period_start)
    values (p_user, p_metric, p_provider, p_key, v_period);
  return jsonb_build_object('allowed', true, 'used', v_used + 1);
end;
$$;

-- Give a unit back after a failed provider call (same period only).
create or replace function public.codematt_refund_quota(p_user uuid, p_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.codematt_usage_events
   where user_id = p_user and idempotency_key = p_key
     and period_start = public.codematt_current_period();
$$;

create or replace function public.codematt_usage_summary(p_user uuid)
returns jsonb
language sql stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'chat', count(*) filter (where metric = 'chat'),
    'ai_photo', count(*) filter (where metric = 'ai_photo')
  )
  from public.codematt_usage_events
  where user_id = p_user and period_start = public.codematt_current_period();
$$;

create or replace function public.codematt_create_order(
  p_order_id text, p_user uuid, p_plan text, p_amount bigint
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.codematt_payment_orders (order_id, user_id, plan_id, gross_amount)
  values (p_order_id, p_user, p_plan, p_amount);
$$;

create or replace function public.codematt_mark_order_failed(p_order_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.codematt_payment_orders set status = 'failed'
   where order_id = p_order_id and status = 'pending';
$$;

-- Activate or extend a plan by 30 days. Safe to call many times for one order.
create or replace function public.codematt_mark_order_paid(
  p_order_id text, p_amount bigint, p_transaction_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.codematt_payment_orders%rowtype;
  v_sub public.codematt_subscriptions%rowtype;
  v_start timestamptz;
begin
  select * into v_order from public.codematt_payment_orders where order_id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unknown_order');
  end if;
  if v_order.status = 'paid' then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  if v_order.gross_amount <> p_amount then
    update public.codematt_payment_orders set status = 'review', midtrans_transaction_id = p_transaction_id
     where order_id = p_order_id;
    return jsonb_build_object('ok', false, 'reason', 'amount_mismatch');
  end if;

  update public.codematt_payment_orders
     set status = 'paid', paid_at = now(), midtrans_transaction_id = p_transaction_id
   where order_id = p_order_id;

  select * into v_sub from public.codematt_subscriptions where user_id = v_order.user_id for update;
  -- Renewing the same active plan stacks time; switching plans starts now.
  if found and v_sub.status = 'active' and v_sub.plan_id = v_order.plan_id and v_sub.current_period_end > now() then
    v_start := v_sub.current_period_end;
  else
    v_start := now();
  end if;

  insert into public.codematt_subscriptions as s
    (user_id, plan_id, status, current_period_start, current_period_end, updated_at)
  values (v_order.user_id, v_order.plan_id, 'active', now(), v_start + interval '30 days', now())
  on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status = 'active',
        current_period_start = case when s.plan_id = excluded.plan_id and s.status = 'active'
                                    and s.current_period_end > now()
                                    then s.current_period_start else now() end,
        current_period_end = excluded.current_period_end,
        updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.codematt_current_period() from public, anon, authenticated;
revoke all on function public.codematt_consume_quota(uuid, text, integer, text, text) from public, anon, authenticated;
revoke all on function public.codematt_refund_quota(uuid, text) from public, anon, authenticated;
revoke all on function public.codematt_usage_summary(uuid) from public, anon, authenticated;
revoke all on function public.codematt_create_order(text, uuid, text, bigint) from public, anon, authenticated;
revoke all on function public.codematt_mark_order_failed(text) from public, anon, authenticated;
revoke all on function public.codematt_mark_order_paid(text, bigint, text) from public, anon, authenticated;

grant execute on function public.codematt_current_period() to service_role;
grant execute on function public.codematt_consume_quota(uuid, text, integer, text, text) to service_role;
grant execute on function public.codematt_refund_quota(uuid, text) to service_role;
grant execute on function public.codematt_usage_summary(uuid) to service_role;
grant execute on function public.codematt_create_order(text, uuid, text, bigint) to service_role;
grant execute on function public.codematt_mark_order_failed(text) to service_role;
grant execute on function public.codematt_mark_order_paid(text, bigint, text) to service_role;

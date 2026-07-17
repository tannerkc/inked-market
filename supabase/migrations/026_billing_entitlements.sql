-- 025_billing_entitlements.sql
-- Billing + entitlements. DB is the source of truth: Stripe webhooks and
-- staff grants both converge on profiles.tier via the app's entitlement
-- engine. Spec: docs/superpowers/specs/2026-07-17-billing-entitlements-design.md

-- ── profiles: real billing statuses + entitlement source ────────────────────
alter table public.profiles drop constraint if exists profiles_billing_status_check;
update public.profiles set billing_status = 'none' where billing_status = 'draft';
alter table public.profiles alter column billing_status set default 'none';
alter table public.profiles add constraint profiles_billing_status_check
  check (billing_status in ('none','trialing','active','past_due','cancelled'));
alter table public.profiles add column if not exists tier_source text
  check (tier_source in ('subscription','grant'));

-- ── billing_customers: Stripe mirror, one row per user ──────────────────────
-- SECURITY: service-role only (RLS enabled, no policies — studio_connections pattern).
create table if not exists public.billing_customers (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id     text unique not null,
  stripe_subscription_id text,
  sub_tier               text check (sub_tier in ('liner','shader','magnum')),
  sub_status             text,
  sub_cycle              text check (sub_cycle in ('monthly','annual')),
  current_period_end     timestamptz,
  cancel_at              timestamptz,
  trial_used             boolean not null default false,
  updated_at             timestamptz not null default now()
);
alter table public.billing_customers enable row level security;
create trigger trg_billing_customers_updated before update on public.billing_customers
  for each row execute function public.set_updated_at();

-- ── plan_grants: staff-comped tiers; rows are never deleted (audit) ─────────
create table if not exists public.plan_grants (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  email      text,
  tier       text not null check (tier in ('liner','shader','magnum')),
  note       text not null,
  granted_by uuid not null references auth.users(id),
  expires_at timestamptz,           -- null = forever
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (user_id is not null or email is not null)
);
alter table public.plan_grants enable row level security;
create index if not exists plan_grants_user_idx on public.plan_grants (user_id);
create index if not exists plan_grants_email_idx on public.plan_grants (lower(email)) where user_id is null;

-- ── staff + audit ────────────────────────────────────────────────────────────
create table if not exists public.staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('founder','staff')),
  added_by   uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create table if not exists public.staff_audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor       uuid not null references auth.users(id),
  action      text not null,
  target_user uuid,
  detail      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
alter table public.staff_audit_log enable row level security;
create index if not exists staff_audit_created_idx on public.staff_audit_log (created_at desc);

-- ── stripe_events: webhook idempotency ──────────────────────────────────────
create table if not exists public.stripe_events (
  id         text primary key,
  created_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

-- ── Seed founder ─────────────────────────────────────────────────────────────
insert into public.staff (user_id, role)
select id, 'founder' from auth.users
where lower(email) in ('tanner@strboard.com', 'tanner@studio.com')
on conflict (user_id) do nothing;

-- ── Publish guard: paid go-live columns are server-only ─────────────────────
-- auth.uid() is null for service-role/postgres; non-null means an RLS client.
create or replace function public.block_client_publish_writes()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (
    new.published_theme_config is distinct from old.published_theme_config
    or new.published_at is distinct from old.published_at
    or new.is_visible is distinct from old.is_visible
  ) then
    raise exception 'publish/visibility changes must go through the app server';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_studios_publish_guard on public.studios;
create trigger trg_studios_publish_guard before update on public.studios
  for each row execute function public.block_client_publish_writes();

-- ── handle_new_user: claim pending email grants + stamp effective tier ──────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' in ('customer','artist','studio')
         then new.raw_user_meta_data->>'role' else 'customer' end,
    coalesce(new.raw_user_meta_data->>'name',
             new.raw_user_meta_data->>'full_name',
             split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do nothing;

  update public.plan_grants
  set user_id = new.id
  where user_id is null and lower(email) = lower(coalesce(new.email,''));

  update public.profiles p
  set tier = g.tier, tier_source = 'grant'
  from (
    select tier from public.plan_grants
    where user_id = new.id and revoked_at is null
      and (expires_at is null or expires_at > now())
    order by case tier when 'magnum' then 2 when 'shader' then 1 else 0 end desc
    limit 1
  ) g
  where p.id = new.id;

  return new;
end;
$$;

-- ── Daily entitlement sweep (grant expiry + missed-webhook safety net) ──────
-- ponytail: SQL mirror of lib/billing/entitlements-core.ts max rule; if the
-- rule ever grows beyond max(sub, grant), replace with a Vercel cron hitting
-- an API route that runs the TS engine.
create or replace function public.sweep_entitlements()
returns void language plpgsql security definer set search_path = public as $$
begin
  with best as (
    select p.id as user_id,
      (select g.tier from public.plan_grants g
        where g.user_id = p.id and g.revoked_at is null
          and (g.expires_at is null or g.expires_at > now())
        order by case g.tier when 'magnum' then 2 when 'shader' then 1 else 0 end desc
        limit 1) as grant_tier,
      case when bc.sub_status in ('trialing','active','past_due')
            and (bc.current_period_end is null or bc.current_period_end > now() - interval '72 hours')
           then bc.sub_tier else null end as sub_tier
    from public.profiles p
    left join public.billing_customers bc on bc.user_id = p.id
    where p.tier is not null or p.tier_source is not null
  ), resolved as (
    select user_id,
      case
        when sub_tier is null and grant_tier is null then null
        when grant_tier is null then sub_tier
        when sub_tier is null then grant_tier
        when (case grant_tier when 'magnum' then 2 when 'shader' then 1 else 0 end)
           > (case sub_tier  when 'magnum' then 2 when 'shader' then 1 else 0 end)
        then grant_tier else sub_tier end as tier,
      case
        when sub_tier is null and grant_tier is null then null
        when grant_tier is not null and (sub_tier is null or
             (case grant_tier when 'magnum' then 2 when 'shader' then 1 else 0 end)
           > (case sub_tier  when 'magnum' then 2 when 'shader' then 1 else 0 end))
        then 'grant' else 'subscription' end as tier_source
    from best
  )
  update public.profiles p
  set tier = r.tier, tier_source = r.tier_source
  from resolved r
  where p.id = r.user_id
    and (p.tier is distinct from r.tier or p.tier_source is distinct from r.tier_source);

  -- Enforcement: published custom site requires shader+; listing requires any tier.
  update public.studios s
  set published_theme_config = null, published_at = null
  from public.profiles p
  where s.claimed_by = p.id and s.published_theme_config is not null
    and (p.tier is null or p.tier = 'liner');
  update public.studios s
  set is_visible = false
  from public.profiles p
  where s.claimed_by = p.id and s.is_visible = true and s.source = 'organic'
    and p.tier is null;
end;
$$;

select cron.unschedule('sweep-entitlements')
where exists (select 1 from cron.job where jobname = 'sweep-entitlements');
select cron.schedule('sweep-entitlements', '17 6 * * *', 'select public.sweep_entitlements()');

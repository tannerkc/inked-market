# Billing, Entitlements & Staff Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real Stripe subscription payments for paid tiers, DB-first entitlements (`profiles.tier` = max of subscription and staff grant), server-side paywall enforcement, and a founder/staff portal at `/staff`.

**Architecture:** The DB is the source of truth for entitlements; Stripe webhooks and staff grants are two writers that converge on one `recomputeEntitlements()` function which stamps `profiles.tier`. Checkout/Portal are Stripe-hosted (almost no billing UI). A DB trigger closes the current client-side publish bypass. Spec: `docs/superpowers/specs/2026-07-17-billing-entitlements-design.md`.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (RLS + service role + pg_cron), Stripe Billing via SDK-free `fetch` (house style from `lib/booking/deposits/stripe.ts`), `tsx` for scripts, Zod v4.

## Global Constraints

- **Supabase project:** `cktvpfenygxhfaodihbz` only. NEVER touch `sqibczeyflarfgtnexne` (client's project). Verify against `.env.local` before any DB action.
- **Commits:** NO `Co-Authored-By`, no Claude/AI mentions, no emoji anywhere in code. Commit after every task.
- **Tier slugs:** `liner | shader | magnum` (type `TierSlug`, `lib/types/index.ts:299`). Prices (from `lib/data/signup-tiers.ts`): Artist Shader $14.85/mo, $11.85/mo-annual; Studio Liner $19.85/$15.85; Studio Shader $59.85/$47.85; Studio Magnum $79.85/$63.85. Annual Stripe prices are billed yearly: `round(annualPrice * 12 * 100)` cents.
- **Env vars (new):** `STRIPE_PRICE_ARTIST_SHADER_MONTHLY`, `STRIPE_PRICE_ARTIST_SHADER_ANNUAL`, `STRIPE_PRICE_STUDIO_LINER_MONTHLY`, `STRIPE_PRICE_STUDIO_LINER_ANNUAL`, `STRIPE_PRICE_STUDIO_SHADER_MONTHLY`, `STRIPE_PRICE_STUDIO_SHADER_ANNUAL`, `STRIPE_PRICE_STUDIO_MAGNUM_MONTHLY`, `STRIPE_PRICE_STUDIO_MAGNUM_ANNUAL`, plus `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`). Existing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Stripe calls:** SDK-free `fetch` with form encoding, platform account (NO `Stripe-Account` header — that header is only for Connect deposit charges). Never trust webhook payloads for state; re-fetch from the API.
- **Entitled subscription statuses:** `trialing`, `active`, `past_due` (past_due keeps access during dunning). Trial: 14 days, no card (`payment_method_collection: if_required`, missing-payment-method behavior `cancel`), first paid checkout only.
- **Server Components by default;** `"use client"` only where required. All new UI mobile-first, 44px touch targets, design tokens only (no raw hex). Card pattern: `bg-white rounded-xl border border-gray-200 shadow-sm`.
- **Verification runner:** `npx tsx scripts/check-billing.ts` (assert script, house `check-builder.ts` pattern). Also `npm run lint` and `npx tsc --noEmit` must stay clean.
- **Founder seed email:** `tanner@strboard.com`.

---

### Task 1: Migration 025 — schema, publish guard, email grants, sweep

**Files:**
- Create: `supabase/migrations/025_billing_entitlements.sql`

**Interfaces:**
- Produces tables later tasks read/write via admin client: `billing_customers`, `plan_grants`, `staff`, `staff_audit_log`, `stripe_events`; `profiles.billing_status` values `('none','trialing','active','past_due','cancelled')`; `profiles.tier_source` `('subscription','grant')`.

- [ ] **Step 1: Write the migration**

```sql
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
select id, 'founder' from auth.users where lower(email) = 'tanner@strboard.com'
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
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db push` (project must resolve to `cktvpfenygxhfaodihbz` — check `supabase/config.toml` / linked project first; if the CLI isn't linked, apply the file's SQL via the Supabase dashboard SQL editor and say so in the commit body).
Expected: migration applies with no errors.

- [ ] **Step 3: Verify schema + guard**

Run in SQL editor (or `psql`):
```sql
select count(*) from public.staff where role = 'founder';                -- expect 1
select column_name from information_schema.columns
 where table_name = 'profiles' and column_name = 'tier_source';          -- expect 1 row
select jobname from cron.job where jobname = 'sweep-entitlements';       -- expect 1 row
```
Then as an **authenticated** user (Supabase dashboard "Impersonate" or app client console), attempt:
```sql
update public.studios set is_visible = true where claimed_by = auth.uid();
```
Expected: error `publish/visibility changes must go through the app server`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/025_billing_entitlements.sql
git commit -m "feat(billing): schema for entitlements, grants, staff, and publish guard"
```

---

### Task 2: Entitlement core (pure) + types + check-billing (TDD)

**Files:**
- Modify: `lib/types/index.ts:301` (`BillingStatus`)
- Modify: `lib/utils/integration-helpers.ts:11` (export `TIER_ORDER`)
- Create: `lib/billing/entitlements-core.ts`
- Create: `scripts/check-billing.ts`

**Interfaces:**
- Produces: `resolveEntitlement(sub: SubLike, grants: GrantLike[], now?: Date): Entitlement` where `Entitlement = { tier: TierSlug | null; source: "subscription" | "grant" | null }`; `ENTITLED_SUB_STATUSES`; `GrantLike { tier; expiresAt: string | null; revokedAt: string | null }`; `SubLike { tier: TierSlug | null; status: string | null }`. Consumed by Tasks 4 and 12.

- [ ] **Step 1: Update shared types**

In `lib/types/index.ts` replace line 301:
```ts
export type BillingStatus = "none" | "trialing" | "active" | "past_due" | "cancelled";
```
In `lib/utils/integration-helpers.ts` change `const TIER_ORDER` to `export const TIER_ORDER`.
(`"draft"` disappears from the union — expect compile errors in `lib/utils/billing.ts`, `use-plan-billing.ts` and friends; those files are rewritten/deleted in Task 8. For now do NOT fix them beyond what this task creates; `npx tsc --noEmit` is allowed to fail until Task 8 and that is noted in each intervening commit body.)

- [ ] **Step 2: Write the failing checks**

`scripts/check-billing.ts`:
```ts
/** Billing invariants. Run: npx tsx scripts/check-billing.ts */
import { resolveEntitlement, ENTITLED_SUB_STATUSES } from "../lib/billing/entitlements-core";

let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) console.log(`  ok  ${name}`);
  else { failed++; console.error(`FAIL  ${name}`); }
}

const NOW = new Date("2026-07-17T12:00:00Z");
const past = "2026-01-01T00:00:00Z";
const future = "2027-01-01T00:00:00Z";
const g = (tier: "liner" | "shader" | "magnum", expiresAt: string | null = null, revokedAt: string | null = null) =>
  ({ tier, expiresAt, revokedAt });

console.log("resolveEntitlement truth table");
check("no sub, no grants -> null", resolveEntitlement({ tier: null, status: null }, [], NOW).tier === null);
check("active sub wins", resolveEntitlement({ tier: "shader", status: "active" }, [], NOW).tier === "shader");
check("trialing counts", resolveEntitlement({ tier: "magnum", status: "trialing" }, [], NOW).tier === "magnum");
check("past_due keeps access", resolveEntitlement({ tier: "shader", status: "past_due" }, [], NOW).tier === "shader");
check("canceled sub does not count", resolveEntitlement({ tier: "shader", status: "canceled" }, [], NOW).tier === null);
check("grant alone", resolveEntitlement({ tier: null, status: null }, [g("magnum")], NOW).source === "grant");
check("higher grant beats sub", resolveEntitlement({ tier: "shader", status: "active" }, [g("magnum")], NOW).tier === "magnum");
check("higher grant source=grant", resolveEntitlement({ tier: "shader", status: "active" }, [g("magnum")], NOW).source === "grant");
check("tie goes to subscription", resolveEntitlement({ tier: "shader", status: "active" }, [g("shader")], NOW).source === "subscription");
check("lower grant loses", resolveEntitlement({ tier: "magnum", status: "active" }, [g("liner")], NOW).tier === "magnum");
check("expired grant ignored", resolveEntitlement({ tier: null, status: null }, [g("magnum", past)], NOW).tier === null);
check("future-expiry grant counts", resolveEntitlement({ tier: null, status: null }, [g("shader", future)], NOW).tier === "shader");
check("revoked grant ignored", resolveEntitlement({ tier: null, status: null }, [g("magnum", null, past)], NOW).tier === null);
check("best of many grants", resolveEntitlement({ tier: null, status: null }, [g("liner"), g("magnum"), g("shader")], NOW).tier === "magnum");
check("entitled statuses frozen", ENTITLED_SUB_STATUSES.join(",") === "trialing,active,past_due");

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log("\nAll billing checks passed");
```

- [ ] **Step 3: Run to verify failure**

Run: `npx tsx scripts/check-billing.ts`
Expected: FAIL — cannot resolve `../lib/billing/entitlements-core`.

- [ ] **Step 4: Implement the core**

`lib/billing/entitlements-core.ts`:
```ts
import type { TierSlug } from "@/lib/types";
import { TIER_ORDER } from "@/lib/utils/integration-helpers";

/** Pure entitlement resolution: max(subscription tier, best active grant).
 *  Mirrored in SQL by sweep_entitlements() (migration 025) — keep in sync. */

export const ENTITLED_SUB_STATUSES = ["trialing", "active", "past_due"] as const;

export type TierSource = "subscription" | "grant";
export interface Entitlement { tier: TierSlug | null; source: TierSource | null }
export interface GrantLike { tier: TierSlug; expiresAt: string | null; revokedAt: string | null }
export interface SubLike { tier: TierSlug | null; status: string | null }

export function resolveEntitlement(sub: SubLike, grants: GrantLike[], now: Date = new Date()): Entitlement {
  const subTier =
    sub.tier && (ENTITLED_SUB_STATUSES as readonly string[]).includes(sub.status ?? "")
      ? sub.tier : null;

  const grantTier = grants
    .filter((g) => !g.revokedAt && (!g.expiresAt || new Date(g.expiresAt) > now))
    .reduce<TierSlug | null>(
      (best, g) => (!best || TIER_ORDER[g.tier] > TIER_ORDER[best] ? g.tier : best),
      null
    );

  if (!subTier && !grantTier) return { tier: null, source: null };
  if (grantTier && (!subTier || TIER_ORDER[grantTier] > TIER_ORDER[subTier])) {
    return { tier: grantTier, source: "grant" };
  }
  return { tier: subTier, source: "subscription" };
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npx tsx scripts/check-billing.ts`
Expected: all `ok`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/types/index.ts lib/utils/integration-helpers.ts lib/billing/entitlements-core.ts scripts/check-billing.ts
git commit -m "feat(billing): pure entitlement resolver with invariant checks" \
  -m "tsc temporarily red: BillingStatus 'draft' removal lands fully in the settings cut-over task"
```

---

### Task 3: Stripe client, price catalog, setup script

**Files:**
- Create: `lib/billing/stripe.ts`
- Create: `lib/billing/catalog.ts`
- Create: `scripts/setup-stripe-catalog.ts`
- Modify: `scripts/check-billing.ts` (append catalog checks)

**Interfaces:**
- Produces (consumed by Tasks 4-6, 13): `createCustomer`, `createSubscriptionCheckout`, `getCheckoutSession`, `latestSubscriptionForCustomer`, `createPortalSession`, `createPromo`, `listPromos`, `setPromoActive`; `priceIdFor(role, tier, cycle): string`, `lookupPrice(priceId): { role; tier; cycle } | null`, `PAID_TIERS`.

- [ ] **Step 1: Append failing catalog checks to `scripts/check-billing.ts`** (before the final `if (failed)` block)

```ts
import { priceIdFor, lookupPrice, PAID_TIERS } from "../lib/billing/catalog";

console.log("\ncatalog round-trip");
process.env.STRIPE_PRICE_ARTIST_SHADER_MONTHLY = "price_a_sm";
process.env.STRIPE_PRICE_ARTIST_SHADER_ANNUAL = "price_a_sa";
process.env.STRIPE_PRICE_STUDIO_LINER_MONTHLY = "price_s_lm";
process.env.STRIPE_PRICE_STUDIO_LINER_ANNUAL = "price_s_la";
process.env.STRIPE_PRICE_STUDIO_SHADER_MONTHLY = "price_s_sm";
process.env.STRIPE_PRICE_STUDIO_SHADER_ANNUAL = "price_s_sa";
process.env.STRIPE_PRICE_STUDIO_MAGNUM_MONTHLY = "price_s_mm";
process.env.STRIPE_PRICE_STUDIO_MAGNUM_ANNUAL = "price_s_ma";

check("artist shader monthly", priceIdFor("artist", "shader", "monthly") === "price_a_sm");
check("studio magnum annual", priceIdFor("studio", "magnum", "annual") === "price_s_ma");
check("reverse lookup", JSON.stringify(lookupPrice("price_s_sa")) === JSON.stringify({ role: "studio", tier: "shader", cycle: "annual" }));
check("unknown price -> null", lookupPrice("price_nope") === null);
check("artist liner is not purchasable", (() => { try { priceIdFor("artist", "liner", "monthly"); return false; } catch { return true; } })());
check("paid tiers frozen", JSON.stringify(PAID_TIERS) === JSON.stringify({ artist: ["shader"], studio: ["liner", "shader", "magnum"] }));
```
Note: `lookupPrice`/`priceIdFor` must read `process.env` at call time (not module scope) or these stubs — and Vercel env loading — break.

- [ ] **Step 2: Run to verify failure** — `npx tsx scripts/check-billing.ts` → FAIL (module not found).

- [ ] **Step 3: Implement `lib/billing/catalog.ts`**

```ts
import type { BillingCycle, TierSlug } from "@/lib/types";

/** Maps (role, tier, cycle) to Stripe price ids held in env.
 *  Prices are created once per mode by scripts/setup-stripe-catalog.ts. */

export type PaidRole = "artist" | "studio";

export const PAID_TIERS: Record<PaidRole, TierSlug[]> = {
  artist: ["shader"],
  studio: ["liner", "shader", "magnum"],
};

const envKey = (role: PaidRole, tier: TierSlug, cycle: BillingCycle) =>
  `STRIPE_PRICE_${role.toUpperCase()}_${tier.toUpperCase()}_${cycle.toUpperCase()}`;

export function priceIdFor(role: PaidRole, tier: TierSlug, cycle: BillingCycle): string {
  if (!PAID_TIERS[role].includes(tier)) throw new Error(`${role}/${tier} is not a purchasable tier`);
  const id = process.env[envKey(role, tier, cycle)];
  if (!id) throw new Error(`Missing env ${envKey(role, tier, cycle)}`);
  return id;
}

export function lookupPrice(priceId: string): { role: PaidRole; tier: TierSlug; cycle: BillingCycle } | null {
  for (const role of ["artist", "studio"] as const)
    for (const tier of PAID_TIERS[role])
      for (const cycle of ["monthly", "annual"] as const)
        if (process.env[envKey(role, tier, cycle)] === priceId) return { role, tier, cycle };
  return null;
}
```

- [ ] **Step 4: Implement `lib/billing/stripe.ts`**

```ts
/** Platform-account Stripe Billing, SDK-free (house style: lib/booking/deposits/stripe.ts).
 *  No Stripe-Account header here — subscriptions bill the platform, deposits
 *  bill connected accounts; the two coexist on one Stripe account. */

const API = "https://api.stripe.com";
const secretKey = () => process.env.STRIPE_SECRET_KEY ?? "";

export const stripeBillingConfigured = () => Boolean(secretKey());

async function form(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function get(path: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${secretKey()}` } });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

// ── Customers ────────────────────────────────────────────────────────────────

export async function createCustomer(input: { email: string; userId: string }): Promise<string> {
  const c = (await form("/v1/customers", {
    email: input.email,
    "metadata[user_id]": input.userId,
  })) as { id?: string };
  if (!c.id) throw new Error("Stripe customer missing id");
  return c.id;
}

// ── Checkout ─────────────────────────────────────────────────────────────────

export async function createSubscriptionCheckout(input: {
  customerId: string;
  priceId: string;
  userId: string;
  intent: "publish" | "upgrade";
  withTrial: boolean;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const params: Record<string, string> = {
    mode: "subscription",
    customer: input.customerId,
    "line_items[0][price]": input.priceId,
    "line_items[0][quantity]": "1",
    allow_promotion_codes: "true",
    client_reference_id: input.userId,
    "metadata[user_id]": input.userId,
    "metadata[intent]": input.intent,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };
  if (input.withTrial) {
    params["subscription_data[trial_period_days]"] = "14";
    params.payment_method_collection = "if_required";
    params["subscription_data[trial_settings][end_behavior][missing_payment_method]"] = "cancel";
  }
  const s = (await form("/v1/checkout/sessions", params)) as { id?: string; url?: string };
  if (!s.id || !s.url) throw new Error("Stripe checkout session missing id/url");
  return { id: s.id, url: s.url };
}

export async function getCheckoutSession(sessionId: string): Promise<{
  id: string; status: string | null; customer: string | null;
  subscription: string | null; metadata: Record<string, string>;
}> {
  const s = (await get(`/v1/checkout/sessions/${sessionId}`)) as {
    id: string; status?: string; customer?: string; subscription?: string;
    metadata?: Record<string, string>;
  };
  return {
    id: s.id, status: s.status ?? null, customer: s.customer ?? null,
    subscription: s.subscription ?? null, metadata: s.metadata ?? {},
  };
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export interface StripeSubscription {
  id: string;
  status: string;
  priceId: string | null;
  currentPeriodEnd: string | null;   // ISO
  cancelAt: string | null;           // ISO
  created: number;
}

const iso = (unix: number | null | undefined) => (unix ? new Date(unix * 1000).toISOString() : null);

function mapSub(raw: Record<string, unknown>): StripeSubscription {
  const r = raw as {
    id: string; status: string; created: number;
    cancel_at?: number | null;
    items?: { data?: Array<{ price?: { id?: string }; current_period_end?: number }> };
    current_period_end?: number;
  };
  const item = r.items?.data?.[0];
  return {
    id: r.id, status: r.status, created: r.created,
    priceId: item?.price?.id ?? null,
    currentPeriodEnd: iso(item?.current_period_end ?? r.current_period_end),
    cancelAt: iso(r.cancel_at),
  };
}

/** Most relevant subscription: newest entitled-status sub, else newest of any status. */
export async function latestSubscriptionForCustomer(customerId: string): Promise<StripeSubscription | null> {
  const res = (await get(`/v1/subscriptions?customer=${customerId}&status=all&limit=10`)) as {
    data?: Array<Record<string, unknown>>;
  };
  const subs = (res.data ?? []).map(mapSub).sort((a, b) => b.created - a.created);
  if (!subs.length) return null;
  const live = subs.find((s) => ["trialing", "active", "past_due"].includes(s.status));
  return live ?? subs[0];
}

// ── Customer Portal ──────────────────────────────────────────────────────────

export async function createPortalSession(input: { customerId: string; returnUrl: string }): Promise<string> {
  const s = (await form("/v1/billing_portal/sessions", {
    customer: input.customerId,
    return_url: input.returnUrl,
  })) as { url?: string };
  if (!s.url) throw new Error("Stripe portal session missing url");
  return s.url;
}

// ── Promotion codes (staff marketing tool) ──────────────────────────────────

export interface PromoInput {
  code: string;                      // customer-facing, e.g. LAUNCH30
  percentOff: number;                // 1-100
  duration: "once" | "forever" | { months: number };
  maxRedemptions?: number;
  expiresAt?: string;                // ISO
  firstTimeOnly?: boolean;
}

export async function createPromo(input: PromoInput): Promise<{ id: string; code: string }> {
  const couponParams: Record<string, string> = { percent_off: String(input.percentOff) };
  if (input.duration === "once" || input.duration === "forever") couponParams.duration = input.duration;
  else { couponParams.duration = "repeating"; couponParams.duration_in_months = String(input.duration.months); }
  const coupon = (await form("/v1/coupons", couponParams)) as { id?: string };
  if (!coupon.id) throw new Error("Stripe coupon missing id");

  const promoParams: Record<string, string> = { coupon: coupon.id, code: input.code };
  if (input.maxRedemptions) promoParams.max_redemptions = String(input.maxRedemptions);
  if (input.expiresAt) promoParams.expires_at = String(Math.floor(new Date(input.expiresAt).getTime() / 1000));
  if (input.firstTimeOnly) promoParams["restrictions[first_time_transaction]"] = "true";
  const promo = (await form("/v1/promotion_codes", promoParams)) as { id?: string; code?: string };
  if (!promo.id || !promo.code) throw new Error("Stripe promotion code missing id/code");
  return { id: promo.id, code: promo.code };
}

export interface PromoRow {
  id: string; code: string; active: boolean; timesRedeemed: number;
  maxRedemptions: number | null; expiresAt: string | null;
  percentOff: number | null; duration: string; durationInMonths: number | null;
}

export async function listPromos(): Promise<PromoRow[]> {
  const res = (await get("/v1/promotion_codes?limit=100&expand[]=data.coupon")) as {
    data?: Array<{
      id: string; code: string; active: boolean; times_redeemed: number;
      max_redemptions?: number | null; expires_at?: number | null;
      coupon?: { percent_off?: number | null; duration?: string; duration_in_months?: number | null };
    }>;
  };
  return (res.data ?? []).map((p) => ({
    id: p.id, code: p.code, active: p.active, timesRedeemed: p.times_redeemed,
    maxRedemptions: p.max_redemptions ?? null, expiresAt: iso(p.expires_at),
    percentOff: p.coupon?.percent_off ?? null, duration: p.coupon?.duration ?? "once",
    durationInMonths: p.coupon?.duration_in_months ?? null,
  }));
}

export async function setPromoActive(promotionCodeId: string, active: boolean): Promise<void> {
  await form(`/v1/promotion_codes/${promotionCodeId}`, { active: String(active) });
}
```

- [ ] **Step 5: Run checks** — `npx tsx scripts/check-billing.ts` → all pass.

- [ ] **Step 6: Write `scripts/setup-stripe-catalog.ts`**

```ts
/** One-off per Stripe mode (test/live): creates 4 products + 8 prices from
 *  lib/data/signup-tiers.ts and prints the env lines to paste.
 *  Run: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/setup-stripe-catalog.ts */
import { artistTiers, studioTiers } from "../lib/data/signup-tiers";

const API = "https://api.stripe.com";
const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error("Set STRIPE_SECRET_KEY"); process.exit(1); }

async function form(path: string, params: Record<string, string>) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`);
  return (await res.json()) as { id: string };
}

async function main() {
  const lines: string[] = [];
  const catalog = [
    ...artistTiers.filter((t) => t.price > 0).map((t) => ({ role: "artist", t })),
    ...studioTiers.map((t) => ({ role: "studio", t })),
  ];
  for (const { role, t } of catalog) {
    const product = await form("/v1/products", { name: `${role === "artist" ? "Artist" : "Studio"} ${t.name}` });
    const monthly = await form("/v1/prices", {
      product: product.id, currency: "usd",
      unit_amount: String(Math.round(t.price * 100)),
      "recurring[interval]": "month",
    });
    lines.push(`STRIPE_PRICE_${role.toUpperCase()}_${t.slug.toUpperCase()}_MONTHLY=${monthly.id}`);
    if (t.annualPrice) {
      const annual = await form("/v1/prices", {
        product: product.id, currency: "usd",
        unit_amount: String(Math.round(t.annualPrice * 12 * 100)),
        "recurring[interval]": "year",
      });
      lines.push(`STRIPE_PRICE_${role.toUpperCase()}_${t.slug.toUpperCase()}_ANNUAL=${annual.id}`);
    }
  }
  console.log(lines.join("\n"));
}
void main();
```

- [ ] **Step 7: Run it against test mode; paste output into `.env.local`**

Run: `STRIPE_SECRET_KEY=$(grep STRIPE_SECRET_KEY .env.local | cut -d= -f2) npx tsx scripts/setup-stripe-catalog.ts`
Expected: 8 `STRIPE_PRICE_*` lines. Append them and `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env.local`. (If the key in `.env.local` is a live key, stop and ask the user for a test key.)

- [ ] **Step 8: Commit**

```bash
git add lib/billing/stripe.ts lib/billing/catalog.ts scripts/setup-stripe-catalog.ts scripts/check-billing.ts
git commit -m "feat(billing): stripe billing client, price catalog, setup script"
```

---

### Task 4: Publish helpers + entitlement engine + webhook sync (server libs)

**Files:**
- Create: `lib/studios/publish.ts`
- Create: `lib/billing/entitlements.ts`
- Create: `lib/billing/sync.ts`

**Interfaces:**
- Consumes: `resolveEntitlement` (Task 2), `latestSubscriptionForCustomer`/`lookupPrice` (Task 3), `createAdminClient` (`lib/supabase/admin.ts`).
- Produces: `publishStudioForOwner(admin, userId)`, `unpublishStudioForOwner(admin, userId, opts?)` (Tasks 5, 7); `recomputeEntitlements(admin, userId): Promise<Entitlement>` (Tasks 5, 6, 12); `syncBillingState(admin, stripeCustomerId)` (Tasks 5, 6). `admin` is the `SupabaseClient` returned by `createAdminClient()`.

- [ ] **Step 1: Implement `lib/studios/publish.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

/** Server-only publish/unpublish. Clients cannot write these columns
 *  (trg_studios_publish_guard, migration 025) — every path goes through here. */

export async function publishStudioForOwner(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: studio } = await admin
    .from("studios")
    .select("id, theme_config")
    .eq("claimed_by", userId)
    .maybeSingle();
  if (!studio) return { ok: false, error: "No studio found for this account." };
  if (!studio.theme_config) return { ok: false, error: "Nothing to publish yet — save a draft first." };
  const { error } = await admin
    .from("studios")
    .update({
      published_theme_config: studio.theme_config,
      published_at: new Date().toISOString(),
      is_visible: true,
    })
    .eq("id", studio.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unpublishStudioForOwner(
  admin: SupabaseClient,
  userId: string,
  opts?: { unlist?: boolean }
): Promise<void> {
  await admin
    .from("studios")
    .update({
      published_theme_config: null,
      published_at: null,
      ...(opts?.unlist ? { is_visible: false } : {}),
    })
    .eq("claimed_by", userId);
}
```

- [ ] **Step 2: Implement `lib/billing/entitlements.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveEntitlement, type Entitlement } from "./entitlements-core";
import { unpublishStudioForOwner } from "@/lib/studios/publish";

/** Reads Stripe mirror + grants, stamps the effective tier onto profiles, and
 *  enforces studio publish/visibility consequences. Every writer converges
 *  here (webhook sync, verify-on-return, staff grants, sweeps). */
export async function recomputeEntitlements(admin: SupabaseClient, userId: string): Promise<Entitlement> {
  const [{ data: bc }, { data: grants }, { data: profile }] = await Promise.all([
    admin.from("billing_customers")
      .select("sub_tier, sub_status, sub_cycle, current_period_end, cancel_at")
      .eq("user_id", userId).maybeSingle(),
    admin.from("plan_grants")
      .select("tier, expires_at, revoked_at")
      .eq("user_id", userId),
    admin.from("profiles").select("role, tier").eq("id", userId).maybeSingle(),
  ]);

  const entitlement = resolveEntitlement(
    { tier: bc?.sub_tier ?? null, status: bc?.sub_status ?? null },
    (grants ?? []).map((g) => ({ tier: g.tier, expiresAt: g.expires_at, revokedAt: g.revoked_at }))
  );

  const hasLiveSub = Boolean(bc?.sub_tier) &&
    ["trialing", "active", "past_due"].includes(bc?.sub_status ?? "");

  await admin.from("profiles").update({
    tier: entitlement.tier,
    tier_source: entitlement.source,
    billing_status: hasLiveSub ? bc!.sub_status : bc?.sub_status === "canceled" ? "cancelled" : "none",
    billing_cycle: bc?.sub_cycle ?? "monthly",
    next_billing_date: hasLiveSub ? bc?.current_period_end ?? null : null,
    cancelled_at: bc?.cancel_at ?? null,
  }).eq("id", userId);

  if (profile?.role === "studio") {
    const tier = entitlement.tier;
    if (tier !== "shader" && tier !== "magnum") {
      await unpublishStudioForOwner(admin, userId, { unlist: tier === null });
    }
  }
  return entitlement;
}
```

- [ ] **Step 3: Implement `lib/billing/sync.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { latestSubscriptionForCustomer } from "./stripe";
import { lookupPrice } from "./catalog";
import { recomputeEntitlements } from "./entitlements";

/** Re-fetches subscription truth from the Stripe API (never the webhook
 *  payload) and mirrors it into billing_customers, then recomputes. */
export async function syncBillingState(admin: SupabaseClient, stripeCustomerId: string): Promise<void> {
  const { data: bc } = await admin
    .from("billing_customers")
    .select("user_id, trial_used")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  if (!bc) return; // customer we did not create — a deposit-side or foreign event

  const sub = await latestSubscriptionForCustomer(stripeCustomerId);
  const price = sub?.priceId ? lookupPrice(sub.priceId) : null;

  await admin.from("billing_customers").update({
    stripe_subscription_id: sub?.id ?? null,
    sub_tier: price?.tier ?? null,
    sub_status: sub?.status ?? null,
    sub_cycle: price?.cycle ?? null,
    current_period_end: sub?.currentPeriodEnd ?? null,
    cancel_at: sub?.cancelAt ?? null,
    trial_used: bc.trial_used || Boolean(sub),
  }).eq("user_id", bc.user_id);

  await recomputeEntitlements(admin, bc.user_id);
}
```

- [ ] **Step 4: Type-check the new files in isolation**

Run: `npx tsc --noEmit 2>&1 | grep -E "lib/(billing|studios)" ; echo "exit $?"`
Expected: no lines from `lib/billing/*` or `lib/studios/*` (pre-existing Task-2 fallout elsewhere is allowed until Task 8).

- [ ] **Step 5: Commit**

```bash
git add lib/studios/publish.ts lib/billing/entitlements.ts lib/billing/sync.ts
git commit -m "feat(billing): entitlement engine, stripe sync, server publish helpers"
```

---

### Task 5: Checkout + portal server actions, /billing/start, return route

**Files:**
- Create: `app/billing/actions.ts`
- Create: `app/billing/start/page.tsx`
- Create: `app/api/billing/return/route.ts`

**Interfaces:**
- Consumes: Task 3 stripe/catalog fns, Task 4 `syncBillingState`/`recomputeEntitlements`/`publishStudioForOwner`.
- Produces: `startCheckout({ tier, cycle, intent }): Promise<{ url?: string; error?: string }>` and `openBillingPortal(): Promise<{ url?: string; error?: string }>` — client callers do `window.location.assign(url)`. URL-addressable checkout entry `/billing/start?tier=shader&cycle=monthly&intent=upgrade` (Tasks 7-9 link here). Return URL `/api/billing/return?session_id=...` set inside `startCheckout`.

- [ ] **Step 1: Implement `app/billing/actions.ts`**

```ts
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceIdFor, PAID_TIERS, type PaidRole } from "@/lib/billing/catalog";
import { createCustomer, createPortalSession, createSubscriptionCheckout, stripeBillingConfigured } from "@/lib/billing/stripe";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return user;
}

const CheckoutInput = z.object({
  tier: z.enum(["liner", "shader", "magnum"]),
  cycle: z.enum(["monthly", "annual"]),
  intent: z.enum(["publish", "upgrade"]),
});

export async function startCheckout(raw: unknown): Promise<{ url?: string; error?: string }> {
  try {
    if (!stripeBillingConfigured()) return { error: "Billing is not configured." };
    const input = CheckoutInput.parse(raw);
    const user = await requireUser();
    const admin = createAdminClient();

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = profile?.role as PaidRole | "customer" | undefined;
    if (role !== "artist" && role !== "studio") return { error: "Only artist and studio accounts have paid plans." };
    if (!PAID_TIERS[role].includes(input.tier)) return { error: "That plan is not available for this account." };

    let { data: bc } = await admin.from("billing_customers")
      .select("stripe_customer_id, trial_used").eq("user_id", user.id).maybeSingle();
    if (!bc) {
      const customerId = await createCustomer({ email: user.email ?? "", userId: user.id });
      const inserted = await admin.from("billing_customers")
        .insert({ user_id: user.id, stripe_customer_id: customerId })
        .select("stripe_customer_id, trial_used").single();
      bc = inserted.data;
    }
    if (!bc) return { error: "Could not create a billing profile." };

    const session = await createSubscriptionCheckout({
      customerId: bc.stripe_customer_id,
      priceId: priceIdFor(role, input.tier, input.cycle),
      userId: user.id,
      intent: input.intent,
      withTrial: !bc.trial_used,
      successUrl: `${appUrl()}/api/billing/return?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: input.intent === "publish" ? `${appUrl()}/dashboard/builder` : `${appUrl()}/settings`,
    });
    return { url: session.url };
  } catch (err) {
    console.error("startCheckout failed:", err);
    return { error: "Could not start checkout. Try again." };
  }
}

export async function openBillingPortal(): Promise<{ url?: string; error?: string }> {
  try {
    const user = await requireUser();
    const admin = createAdminClient();
    const { data: bc } = await admin.from("billing_customers")
      .select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
    if (!bc) return { error: "No billing profile yet — start a plan first." };
    const url = await createPortalSession({ customerId: bc.stripe_customer_id, returnUrl: `${appUrl()}/settings` });
    return { url };
  } catch (err) {
    console.error("openBillingPortal failed:", err);
    return { error: "Could not open the billing portal. Try again." };
  }
}
```
(Match the import shape of `createClient` to `lib/supabase/server.ts` — check whether it is async like `app/book/actions.ts:46-52` uses it, and mirror exactly.)

- [ ] **Step 2: Implement `app/api/billing/return/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCheckoutSession } from "@/lib/billing/stripe";
import { syncBillingState } from "@/lib/billing/sync";
import { publishStudioForOwner } from "@/lib/studios/publish";

/** Checkout success landing: verify with the Stripe API, sync immediately
 *  (webhooks race the redirect), then finish the user's original intent. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const settings = new URL("/settings", url.origin);
  if (!sessionId) return NextResponse.redirect(settings);

  try {
    const session = await getCheckoutSession(sessionId);
    if (session.status !== "complete" || !session.customer) {
      return NextResponse.redirect(settings);
    }
    const admin = createAdminClient();
    await syncBillingState(admin, session.customer);

    if (session.metadata.intent === "publish" && session.metadata.user_id) {
      const result = await publishStudioForOwner(admin, session.metadata.user_id);
      const dest = new URL("/dashboard/builder", url.origin);
      dest.searchParams.set(result.ok ? "published" : "upgraded", "1");
      return NextResponse.redirect(dest);
    }
    settings.searchParams.set("upgraded", "1");
    return NextResponse.redirect(settings);
  } catch (err) {
    console.error("billing return failed:", err);
    return NextResponse.redirect(settings);
  }
}
```

- [ ] **Step 3: Implement `app/billing/start/page.tsx`** (URL-addressable checkout entry for signup + pricing CTAs)

```tsx
import { redirect } from "next/navigation";
import { startCheckout } from "@/app/billing/actions";

export const dynamic = "force-dynamic";

export default async function BillingStartPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; cycle?: string; intent?: string }>;
}) {
  const params = await searchParams;
  const result = await startCheckout({
    tier: params.tier ?? "shader",
    cycle: params.cycle === "annual" ? "annual" : "monthly",
    intent: params.intent === "publish" ? "publish" : "upgrade",
  });
  if (result.url) redirect(result.url);
  redirect(`/settings?billing_error=${encodeURIComponent(result.error ?? "unknown")}`);
}
```
Note: `startCheckout` throws "Not signed in." for anonymous visitors — the catch inside the action converts it to `{error}`, so this page redirects them to `/settings` which sits behind `AuthGuard` and routes to login. Verify that behavior in Step 4; if AuthGuard doesn't bounce cleanly, redirect unauthenticated users to `/login` here instead by checking `result.error`.

- [ ] **Step 4: Manual verification (Stripe test mode)**

With dev server running and env from Task 3:
1. `open "http://localhost:3000/billing/start?tier=shader&cycle=monthly"` while signed in as a studio → Stripe Checkout page shows Studio Shader $59.85/mo with "14 days free" and a promotion-code box, and **no card required**.
2. Complete with any email → lands on `/settings?upgraded=1`.
3. SQL: `select sub_tier, sub_status, trial_used from billing_customers;` → `shader, trialing, true`; `select tier, tier_source, billing_status from profiles where id = '<user>';` → `shader, subscription, trialing`.
4. Re-run checkout for the same user → session has NO trial (card required).

- [ ] **Step 5: Commit**

```bash
git add app/billing/actions.ts app/billing/start/page.tsx app/api/billing/return/route.ts
git commit -m "feat(billing): checkout and portal actions with verify-on-return"
```

---

### Task 6: Webhook subscription branch

**Files:**
- Modify: `app/api/webhooks/stripe/route.ts`

**Interfaces:**
- Consumes: `syncBillingState` (Task 4). Existing deposit branch and `verifyStripeSignature` stay untouched.

- [ ] **Step 1: Extend the route**

Replace the body of `POST` in `app/api/webhooks/stripe/route.ts` so both branches share one parse (keep the existing header comment, signature check, and deposit logic verbatim):

```ts
export async function POST(request: Request) {
  const raw = await request.text();
  const valid = verifyStripeSignature(
    raw,
    request.headers.get("stripe-signature"),
    process.env.STRIPE_WEBHOOK_SECRET ?? ""
  );
  if (!valid) return NextResponse.json({ error: "bad signature" }, { status: 400 });

  let event: {
    id?: string;
    type?: string;
    data?: {
      object?: {
        id?: string;
        mode?: string;
        customer?: string;
        payment_status?: string;
        metadata?: { appointment_id?: string };
      };
    };
  };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  // ── Platform subscription events → one idempotent sync ────────────────────
  const SUB_EVENTS = new Set([
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed",
  ]);
  const isSubCheckout =
    event.type === "checkout.session.completed" && event.data?.object?.mode === "subscription";

  if ((SUB_EVENTS.has(event.type ?? "") || isSubCheckout) && event.id) {
    const { data: seen } = await admin
      .from("stripe_events")
      .insert({ id: event.id })
      .select("id")
      .maybeSingle();
    const customer = event.data?.object?.customer;
    if (seen && customer) {
      try {
        await syncBillingState(admin, customer);
      } catch (err) {
        console.error("billing sync failed:", err);
        // Still 200: the daily sweep is the safety net; Stripe retry storms
        // against a failing handler do not help.
      }
    }
    return NextResponse.json({ received: true });
  }

  // ── Connect deposit events (existing logic, unchanged) ────────────────────
  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });
  const session = event.data?.object;
  const appointmentId = session?.metadata?.appointment_id;
  if (!session?.id || !appointmentId || session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }
  const { data: row } = await admin
    .from("appointments")
    .select("id, deposit_checkout_id, deposit_provider")
    .eq("id", appointmentId)
    .maybeSingle();
  if (row && row.deposit_provider === "stripe" && row.deposit_checkout_id === session.id) {
    await confirmDepositPaid(admin, appointmentId);
  }
  return NextResponse.json({ received: true });
}
```
Add `import { syncBillingState } from "@/lib/billing/sync";` at top. Note: `invoice.payment_failed` carries `customer` on the object — covered by the shared extraction.

- [ ] **Step 2: Verify with Stripe CLI**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
In another shell, from the Stripe test dashboard cancel the Task-5 test subscription immediately (not at period end).
Expected: CLI shows `customer.subscription.deleted` → 200. SQL: `profiles.tier` is now `null`, `billing_status = 'cancelled'`, and the studio's `published_theme_config` is `null`, `is_visible = false`.
Replay the same event id (`stripe events resend <evt_id>`): handler returns 200 and DB is unchanged (idempotent).

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat(billing): subscription webhook branch with idempotent sync"
```

---

### Task 7: Server-side publish + go-live enforcement in the builder

**Files:**
- Create: `app/dashboard/builder/actions.ts`
- Modify: `lib/providers/studio-provider.tsx` (add `applyLocal`)
- Modify: `components/builder/builder-provider.tsx:105-162`
- Modify: `components/builder/publish-paywall-dialog.tsx`
- Modify: every remaining client writer of `is_visible` (grep in Step 4)

**Interfaces:**
- Consumes: `publishStudioForOwner` (Task 4), `startCheckout` (Task 5).
- Produces: `publishCurrentStudio(): Promise<{ ok: boolean; error?: string }>` and `setStudioVisibility(visible: boolean): Promise<{ ok: boolean; error?: string }>` server actions; `useStudio().applyLocal(partial)` local-state-only merge.

- [ ] **Step 1: Implement `app/dashboard/builder/actions.ts`**

```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishStudioForOwner } from "@/lib/studios/publish";
import { tierMeetsRequirement } from "@/lib/utils/integration-helpers";
import type { TierSlug } from "@/lib/types";

async function requireUserTier(): Promise<{ userId: string; tier: TierSlug | null } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await createAdminClient()
    .from("profiles").select("tier").eq("id", user.id).maybeSingle();
  return { userId: user.id, tier: (profile?.tier as TierSlug | null) ?? null };
}

/** Publish = copy draft to live. Requires a plan with a custom web page. */
export async function publishCurrentStudio(): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireUserTier();
  if (!ctx) return { ok: false, error: "Not signed in." };
  if (!tierMeetsRequirement(ctx.tier, "shader")) {
    return { ok: false, error: "Publishing requires the Shader or Magnum plan." };
  }
  return publishStudioForOwner(createAdminClient(), ctx.userId);
}

/** Listing visibility. Any paid tier lists; turning it off is always allowed. */
export async function setStudioVisibility(visible: boolean): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireUserTier();
  if (!ctx) return { ok: false, error: "Not signed in." };
  if (visible && !tierMeetsRequirement(ctx.tier, "liner")) {
    return { ok: false, error: "Going live requires an active plan." };
  }
  const { error } = await createAdminClient()
    .from("studios").update({ is_visible: visible }).eq("claimed_by", ctx.userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
```

- [ ] **Step 2: Add `applyLocal` to `lib/providers/studio-provider.tsx`**

In `StudioContextValue` add `applyLocal: (partial: Partial<StudioData>) => void;`. Below the existing `update` callback add, and include it in the provider value:
```ts
// Local-state merge with NO DB write — for fields the server just wrote
// (publish columns are client-write-blocked by trg_studios_publish_guard).
const applyLocal = useCallback((partial: Partial<StudioData>) => {
  setStudio((prev) => ({ ...(prev ?? ({} as StudioData)), ...partial }));
}, []);
```

- [ ] **Step 3: Rewire `components/builder/builder-provider.tsx`**

Replace the publish block (current lines 105-162). `useStudio()` destructure gains `applyLocal`. New code:
```ts
const { currentPlan, status: billingStatus } = usePlanBilling();
const [isPublishing, setIsPublishing] = useState(false);
const [paywallOpen, setPaywallOpen] = useState(false);
const [publishError, setPublishError] = useState<string | null>(null);

const isPublished = Boolean(studio?.publishedThemeConfig);
const hasUnpublishedChanges = useMemo(
  () =>
    !studio?.publishedThemeConfig ||
    JSON.stringify(editor.config) !== JSON.stringify(studio.publishedThemeConfig),
  [editor.config, studio?.publishedThemeConfig],
);

// Draft save is still a client write; the publish copy happens server-side
// where the tier is re-checked (client gating below is UX only).
const doPublish = useCallback(async () => {
  setIsPublishing(true);
  setPublishError(null);
  try {
    editor.saveDraft();
    await update({ themeConfig: editor.config });
    const result = await publishCurrentStudio();
    if (result.ok) {
      applyLocal({
        publishedThemeConfig: editor.config,
        publishedAt: new Date().toISOString(),
        isVisible: true,
      });
    } else {
      setPublishError(result.error ?? "Publish failed.");
      if (result.error?.includes("plan")) setPaywallOpen(true);
    }
  } catch (err) {
    console.error("Publish failed", err);
    setPublishError("Publish failed.");
  } finally {
    setIsPublishing(false);
  }
}, [editor, update, applyLocal]);

const publish = useCallback(() => {
  if (isPublishing) return;
  const canPublish =
    (currentPlan === "shader" || currentPlan === "magnum") &&
    ["trialing", "active", "past_due"].includes(billingStatus);
  if (canPublish || billingStatus === "none") void doPublish(); // grant-only users have status "none"
  else setPaywallOpen(true);
}, [isPublishing, billingStatus, currentPlan, doPublish]);

// Paywall pick: save the draft first so verify-on-return publishes this exact
// config, then hand off to Stripe Checkout with intent=publish.
const upgradeAndPublish = useCallback(
  (slug: TierSlug, cycle: BillingCycle) => {
    editor.saveDraft();
    void update({ themeConfig: editor.config }).then(async () => {
      const result = await startCheckout({ tier: slug, cycle, intent: "publish" });
      if (result.url) window.location.assign(result.url);
      else setPublishError(result.error ?? "Could not start checkout.");
    });
    setPaywallOpen(false);
  },
  [editor, update],
);
```
Imports: `import { publishCurrentStudio } from "@/app/dashboard/builder/actions";`, `import { startCheckout } from "@/app/billing/actions";`, add `BillingCycle` to the types import, add `applyLocal` to the `useStudio()` destructure at line 67, and export `publishError` through the provider context so the top bar can surface it. Simplest client gate: since grant-only users have `billingStatus === "none"` but a real `currentPlan`, the exact client condition is `tierMeetsRequirement(currentPlan, "shader")` — if that reads cleaner, use it alone; the server re-checks regardless. Update `upgradeAndPublish`'s signature at its call site in `publish-paywall-dialog.tsx` to pass the selected cycle (add a monthly/annual toggle if the dialog lacks one, defaulting `"monthly"`).

- [ ] **Step 4: Migrate remaining client `is_visible` writers**

Run: `grep -rn "isVisible\|is_visible" components/ app/ lib/repositories* lib/providers --include="*.tsx" --include="*.ts" | grep -v "builder-provider\|studios/publish\|builder/actions\|api/"`
For every hit that WRITES the column from the client (go-live toggle on the dashboard is the expected one), replace the direct `update({ isVisible })`/Supabase update with `setStudioVisibility(visible)` + `applyLocal({ isVisible: visible })` on success. Read-only usages stay.

- [ ] **Step 5: Verify in the app**

Dev server up, signed in as a studio with NO plan: builder → Publish → paywall dialog → pick Shader → Stripe Checkout → complete → returns to `/dashboard/builder?published=1` and the public studio page is live. Then in Stripe dashboard cancel the sub → reload public page → 404/basic (webhook unpublished it). Bypass check: re-run the Task 1 Step 3 SQL impersonation (`update studios set is_visible = true where claimed_by = auth.uid()`) — expected: the trigger still rejects it.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/builder/actions.ts lib/providers/studio-provider.tsx components/builder/builder-provider.tsx components/builder/publish-paywall-dialog.tsx
git commit -m "feat(billing): server-enforced publish and go-live with checkout paywall"
```
(Include any Step-4 files in the add list.)

---

### Task 8: Settings + auth cut-over (profiles become the read path)

**Files:**
- Create: `lib/hooks/use-entitlement.ts`
- Rewrite: `components/settings/use-plan-billing.ts`
- Modify: `components/settings/plan-billing-section.tsx`
- Modify: `components/providers/auth-provider.tsx:113-141` (`mapSupabaseUser`)
- Delete: `lib/utils/billing.ts`
- Modify: every `resolveEffectivePlan` / `resolveEffectiveStatus` / `user.billing` / `meta.billing` call site (grep in Step 4)

**Interfaces:**
- Produces: `useEntitlement(): { tier: TierSlug | null; source: "subscription" | "grant" | null; status: BillingStatus; cycle: BillingCycle; nextBillingDate: string | null; cancelledAt: string | null; loading: boolean; refresh: () => void }`. `usePlanBilling` keeps its return keys (`role, tiers, currentPlan, status, cycle, setCycle, changePlan, cancelPlan, showConfirmCancel, setShowConfirmCancel`) plus new `tierSource`, `manageBilling`, `busy`; `resumePlan` is removed (the portal owns resume); `billing` object is removed.

- [ ] **Step 1: Implement `lib/hooks/use-entitlement.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import type { BillingCycle, BillingStatus, TierSlug } from "@/lib/types";

interface EntitlementState {
  tier: TierSlug | null;
  source: "subscription" | "grant" | null;
  status: BillingStatus;
  cycle: BillingCycle;
  nextBillingDate: string | null;
  cancelledAt: string | null;
}

const EMPTY: EntitlementState = {
  tier: null, source: null, status: "none", cycle: "monthly",
  nextBillingDate: null, cancelledAt: null,
};

/** Billing truth for the signed-in user, read from profiles (RLS: own row).
 *  Artists with no paid plan are effectively liner — callers get that via
 *  tier ?? (role === "artist" ? "liner" : null). */
export function useEntitlement() {
  const { user } = useAuth();
  const [state, setState] = useState<EntitlementState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  const refresh = useCallback(() => {
    if (!userId) { setState(EMPTY); setLoading(false); return; }
    void createClient()
      .from("profiles")
      .select("tier, tier_source, billing_status, billing_cycle, next_billing_date, cancelled_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setState(data ? {
          tier: data.tier, source: data.tier_source, status: data.billing_status,
          cycle: data.billing_cycle, nextBillingDate: data.next_billing_date,
          cancelledAt: data.cancelled_at,
        } : EMPTY);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...state, loading, refresh };
}
```

- [ ] **Step 2: Rewrite `components/settings/use-plan-billing.ts`**

```ts
"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useEntitlement } from "@/lib/hooks/use-entitlement";
import { artistTiers, studioTiers } from "@/lib/data/signup-tiers";
import { startCheckout, openBillingPortal } from "@/app/billing/actions";
import type { BillingCycle, TierSlug } from "@/lib/types";

export function usePlanBilling() {
  const { user } = useAuth();
  const role = user?.role ?? "customer";
  const entitlement = useEntitlement();

  // Artists are always at least Liner (free tier), studios start with nothing.
  const currentPlan: TierSlug | null =
    entitlement.tier ?? (role === "artist" ? "liner" : null);

  const tiers = role === "studio" ? studioTiers : artistTiers;
  const [cycle, setCycle] = useState<BillingCycle>(entitlement.cycle);
  const [busy, setBusy] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Paid plan changes all go through Stripe; the webhook + return route
  // write the new state, so this client never mutates billing fields.
  const changePlan = useCallback(
    (newPlan: TierSlug) => {
      if (busy) return;
      setBusy(true);
      void startCheckout({ tier: newPlan, cycle, intent: "upgrade" }).then((r) => {
        if (r.url) window.location.assign(r.url);
        else setBusy(false);
      });
    },
    [busy, cycle]
  );

  // Cancel/resume/card/plan-switch for existing subscribers: Stripe Portal.
  const manageBilling = useCallback(() => {
    if (busy) return;
    setBusy(true);
    void openBillingPortal().then((r) => {
      if (r.url) window.location.assign(r.url);
      else setBusy(false);
    });
  }, [busy]);

  const cancelPlan = useCallback(() => {
    setShowConfirmCancel(false);
    manageBilling();
  }, [manageBilling]);

  return {
    role,
    tiers,
    currentPlan,
    tierSource: entitlement.source,
    status: entitlement.status,
    nextBillingDate: entitlement.nextBillingDate,
    cancelledAt: entitlement.cancelledAt,
    cycle,
    setCycle,
    changePlan,
    cancelPlan,
    manageBilling,
    busy,
    showConfirmCancel,
    setShowConfirmCancel,
  };
}
```

- [ ] **Step 3: Update `components/settings/plan-billing-section.tsx`**

Keep the existing layout. Required changes only:
1. Destructure the new hook shape (`tierSource`, `manageBilling`, `busy`; `resumePlan` and `billing` are gone — replace `billing.nextBillingDate`/`billing.cancelledAt` reads with the new top-level values).
2. Any "Resume plan" button now calls `manageBilling`; the cancel confirm dialog's confirm button calls `cancelPlan` (which opens the portal).
3. Status copy: treat `"trialing"` as active-with-trial ("Free trial — first bill {date}"), `"past_due"` as "Payment issue — update your card" with a `manageBilling` button, `"none"` with a grant as complimentary.
4. Insert the complimentary banner above the plan card when granted:
```tsx
{tierSource === "grant" ? (
  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
    <p className="text-sm font-medium text-indigo-900">Complimentary access</p>
    <p className="text-xs text-indigo-700">
      Your {currentPlan} plan was granted by Inked Market. No billing required.
    </p>
  </div>
) : null}
```
5. When `tierSource === "grant"` and `status === "none"`, hide cancel/manage buttons (nothing to manage) but keep upgrade buttons visible for higher tiers.

- [ ] **Step 4: Cut auth metadata out of the billing path**

1. In `mapSupabaseUser` (`components/providers/auth-provider.tsx:113-141`): delete the `billing: meta.billing,` line. Keep `plan: meta.plan` (signup flow still writes it; it is no longer read for billing).
2. Delete `lib/utils/billing.ts`.
3. Run: `grep -rn "resolveEffectivePlan\|resolveEffectiveStatus\|user?.billing\|user\.billing\|meta\.billing" app/ components/ lib/ --include="*.ts" --include="*.tsx"`
   For each hit: settings hook is already rewritten; any go-live/dashboard gating call sites switch to `useEntitlement()` (client) or a `profiles.tier` read (server). Remove `billing` from the `AuthUser` interface and from `updateUser` writes if present.
4. Run: `npx tsc --noEmit` — expected: **clean** (this task retires the Task-2 fallout). Fix any remaining stragglers the grep found.

- [ ] **Step 5: Verify in the app**

- Settings as trialing studio: plan card shows Shader with trial copy; "Manage billing" opens the Stripe portal.
- Grant a comp directly in SQL (`insert into plan_grants (user_id, tier, note, granted_by) values ('<uid>', 'magnum', 'test', '<uid>');` then `select public.sweep_entitlements();`): settings shows the complimentary banner, builder publishes without paywall.
- Revoke (`update plan_grants set revoked_at = now() ...; select public.sweep_entitlements();`): tier drops, site unpublishes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(billing): settings and auth read entitlements from profiles"
```

---

### Task 9: Artist signup checkout + pricing CTAs

**Files:**
- Modify: `app/signup/artist/plan/page.tsx:21-27`
- Modify: `app/pricing/pricing-page-content.tsx` (CTA hrefs)

**Interfaces:**
- Consumes: `/billing/start?tier=&cycle=&intent=upgrade` (Task 5).

- [ ] **Step 1: Route Shader signups through checkout**

In `app/signup/artist/plan/page.tsx` replace lines 21-27:
```tsx
const [isAnnual, setIsAnnual] = useState(false);
const [selectedTier, setSelectedTier] = useState(signupProgress.plan || "Liner");
// Paid pick: account is created first, then Stripe Checkout (14-day trial).
// Abandoning checkout simply leaves the new account on Liner.
const destination =
  selectedTier === "Shader"
    ? `/billing/start?tier=shader&cycle=${isAnnual ? "annual" : "monthly"}&intent=upgrade`
    : "/dashboard";
const { complete, error, confirmEmail, pending } = useSignupCompletion(destination);

const handleActivate = () => {
  void complete({ plan: selectedTier });
};
```
(Reorder so `isAnnual`/`selectedTier` are declared before the hook. If `useSignupCompletion` captures its argument once instead of per-render, pass the destination to `complete()` instead — check its implementation in `components/signup/` and use whichever the hook supports.)
Email-confirmation edge: when `confirmEmail` is shown, checkout is skipped — the user upgrades later from settings. Acceptable per spec.

- [ ] **Step 2: Point pricing CTAs at checkout**

In `app/pricing/pricing-page-content.tsx`, find the per-tier CTA buttons/links. Rule: signed-out → existing signup hrefs stay; signed-in artist/studio → `/billing/start?tier=<slug>&cycle=<cycle>&intent=upgrade`. If the page is a server component without auth state, keep hrefs pointing at `/billing/start...` only on the paid tiers and let the action's auth check bounce anonymous users to signup — implement whichever the file's current structure makes smaller, with a one-line comment.

- [ ] **Step 3: Verify**

New artist signup picking Shader (with a confirmed-email test account) lands on Stripe Checkout after account creation; abandoning leaves a working Liner account.

- [ ] **Step 4: Commit**

```bash
git add app/signup/artist/plan/page.tsx app/pricing/pricing-page-content.tsx
git commit -m "feat(billing): signup and pricing route paid picks through checkout"
```

---

### Task 10: Integrations connect gate (server-side minTier)

**Files:**
- Modify: `app/api/integrations/[platform]/connect/route.ts`

- [ ] **Step 1: Add the tier check**

At the top of the route's handler, after the existing auth/user resolution (mirror its current style), insert:
```ts
import { getPlatformMeta } from "@/lib/data/integration-platforms";
import { tierMeetsRequirement } from "@/lib/utils/integration-helpers";
// ...inside the handler, after user is resolved:
const meta = getPlatformMeta(platform);
if (meta?.minTier) {
  const { data: profile } = await admin.from("profiles").select("tier").eq("id", user.id).maybeSingle();
  if (!tierMeetsRequirement(profile?.tier ?? null, meta.minTier)) {
    return NextResponse.json({ error: "This integration requires a higher plan." }, { status: 403 });
  }
}
```
Adapt variable names (`admin`, `user`, `platform`) to the route's existing ones; if the route uses the RLS server client rather than admin, `profiles` own-row select works there too.

- [ ] **Step 2: Verify**

As a Liner studio, `curl -b <session cookies>` or click Connect on a Shader-gated platform → 403; as the trialing Shader studio → passes the tier check.

- [ ] **Step 3: Commit**

```bash
git add app/api/integrations/[platform]/connect/route.ts
git commit -m "feat(billing): enforce integration minTier server-side"
```

---

### Task 11: Staff foundation — guard, layout, shell

**Files:**
- Create: `lib/staff/guard.ts`
- Create: `lib/staff/audit.ts`
- Create: `app/staff/layout.tsx`

**Interfaces:**
- Produces: `requireStaff(minRole?: "staff" | "founder"): Promise<{ userId: string; role: "founder" | "staff" } | null>`; `logStaffAction(admin, { actor, action, targetUser?, detail? })`. Consumed by Tasks 12-14.

- [ ] **Step 1: Implement `lib/staff/guard.ts`**

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface StaffContext { userId: string; role: "founder" | "staff" }

/** Staff check for /staff pages and actions. Returns null for everyone else —
 *  callers notFound() so the portal's existence is never revealed. */
export async function requireStaff(minRole: "staff" | "founder" = "staff"): Promise<StaffContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: row } = await createAdminClient()
    .from("staff").select("role").eq("user_id", user.id).maybeSingle();
  if (!row) return null;
  if (minRole === "founder" && row.role !== "founder") return null;
  return { userId: user.id, role: row.role };
}
```
(If `server-only` isn't already a dependency, drop the import — `lib/supabase/admin.ts` gets by on a comment; match the house.)

- [ ] **Step 2: Implement `lib/staff/audit.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export async function logStaffAction(
  admin: SupabaseClient,
  input: { actor: string; action: string; targetUser?: string | null; detail?: Record<string, unknown> }
): Promise<void> {
  await admin.from("staff_audit_log").insert({
    actor: input.actor,
    action: input.action,
    target_user: input.targetUser ?? null,
    detail: input.detail ?? {},
  });
}
```

- [ ] **Step 3: Implement `app/staff/layout.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/staff/guard";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/staff", label: "Users" },
  { href: "/staff/promos", label: "Promos" },
  { href: "/staff/team", label: "Team" },
  { href: "/staff/audit", label: "Audit" },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  if (!staff) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500">Internal tools — every action is logged.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {staff.role}
        </span>
      </div>
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="min-h-11 flex items-center rounded-lg px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify** — signed in as founder, `/staff` renders the shell (child pages 404 until Task 12 — add a placeholder `app/staff/page.tsx` returning `null` if needed for this check, it is replaced next task). Signed in as a non-staff account → 404. Signed out → 404.

- [ ] **Step 5: Commit**

```bash
git add lib/staff/ app/staff/layout.tsx
git commit -m "feat(staff): staff guard, audit helper, and portal shell"
```

---

### Task 12: Staff Users tab — search, detail, grant, revoke

**Files:**
- Create: `app/staff/actions.ts`
- Create: `app/staff/page.tsx`
- Create: `app/staff/user-detail.tsx` (client component)

**Interfaces:**
- Consumes: `requireStaff`, `logStaffAction` (Task 11), `recomputeEntitlements` (Task 4).
- Produces: server actions `searchUsers(query: string)`, `getUserDetail(userId: string)`, `grantTier(input: { userId?: string; email?: string; tier: TierSlug; expiresAt?: string; note: string })`, `revokeGrant(grantId: string)` — all return `{ ok: boolean; error?: string; data?: unknown }`-shaped objects as typed below. Task 14 reuses this actions file.

- [ ] **Step 1: Implement the actions (`app/staff/actions.ts`)**

```ts
"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff/guard";
import { logStaffAction } from "@/lib/staff/audit";
import { recomputeEntitlements } from "@/lib/billing/entitlements";

export interface StaffUserRow {
  id: string; email: string; name: string | null; role: string;
  tier: string | null; tierSource: string | null; billingStatus: string;
}

export async function searchUsers(query: string): Promise<{ ok: boolean; users: StaffUserRow[]; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, users: [], error: "Forbidden" };
  const q = query.trim();
  if (q.length < 2) return { ok: true, users: [] };
  const admin = createAdminClient();

  // Email lives in auth.users; name/role/tier in profiles. Two lookups, merged.
  const { data: byName } = await admin
    .from("profiles")
    .select("id, name, role, tier, tier_source, billing_status")
    .ilike("name", `%${q}%`)
    .limit(20);
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailMatches = (authList?.users ?? []).filter((u) =>
    u.email?.toLowerCase().includes(q.toLowerCase())
  );
  const ids = new Set([...(byName ?? []).map((p) => p.id), ...emailMatches.map((u) => u.id)]);
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, name, role, tier, tier_source, billing_status")
    .in("id", [...ids]);
  const emailById = new Map((authList?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  return {
    ok: true,
    users: (profiles ?? []).map((p) => ({
      id: p.id, email: emailById.get(p.id) ?? "", name: p.name, role: p.role,
      tier: p.tier, tierSource: p.tier_source, billingStatus: p.billing_status,
    })),
  };
}
// ponytail: listUsers page-1000 scan is fine pre-launch; swap for an email
// column mirror on profiles (or auth admin getUserByEmail) past ~1k users.

export interface GrantRow {
  id: string; tier: string; note: string; email: string | null;
  expiresAt: string | null; revokedAt: string | null; createdAt: string;
}

export async function getUserDetail(userId: string): Promise<{
  ok: boolean; error?: string;
  user?: StaffUserRow & { stripeCustomerId: string | null; subStatus: string | null; grants: GrantRow[] };
}> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const admin = createAdminClient();
  const [{ data: p }, { data: bc }, { data: grants }, { data: au }] = await Promise.all([
    admin.from("profiles").select("id, name, role, tier, tier_source, billing_status").eq("id", userId).maybeSingle(),
    admin.from("billing_customers").select("stripe_customer_id, sub_status").eq("user_id", userId).maybeSingle(),
    admin.from("plan_grants").select("id, tier, note, email, expires_at, revoked_at, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }),
    admin.auth.admin.getUserById(userId),
  ]);
  if (!p) return { ok: false, error: "User not found" };
  return {
    ok: true,
    user: {
      id: p.id, email: au?.user?.email ?? "", name: p.name, role: p.role,
      tier: p.tier, tierSource: p.tier_source, billingStatus: p.billing_status,
      stripeCustomerId: bc?.stripe_customer_id ?? null, subStatus: bc?.sub_status ?? null,
      grants: (grants ?? []).map((g) => ({
        id: g.id, tier: g.tier, note: g.note, email: g.email,
        expiresAt: g.expires_at, revokedAt: g.revoked_at, createdAt: g.created_at,
      })),
    },
  };
}

const GrantInput = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  tier: z.enum(["liner", "shader", "magnum"]),
  expiresAt: z.string().datetime().optional(),
  note: z.string().min(3, "Add a note saying why."),
}).refine((v) => v.userId || v.email, { message: "Need a user or an email." });

export async function grantTier(raw: unknown): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const parsed = GrantInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;
  const admin = createAdminClient();

  // Email grants attach immediately when the account already exists.
  let userId = input.userId ?? null;
  if (!userId && input.email) {
    const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = authList?.users.find((u) => u.email?.toLowerCase() === input.email!.toLowerCase())?.id ?? null;
  }

  const { error } = await admin.from("plan_grants").insert({
    user_id: userId,
    email: userId ? null : input.email?.toLowerCase(),
    tier: input.tier,
    note: input.note,
    granted_by: staff.userId,
    expires_at: input.expiresAt ?? null,
  });
  if (error) return { ok: false, error: error.message };

  if (userId) await recomputeEntitlements(admin, userId);
  await logStaffAction(admin, {
    actor: staff.userId, action: "grant_tier", targetUser: userId,
    detail: { tier: input.tier, email: input.email ?? null, expiresAt: input.expiresAt ?? null, note: input.note },
  });
  return { ok: true };
}

export async function revokeGrant(grantId: string): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const admin = createAdminClient();
  const { data: grant } = await admin.from("plan_grants")
    .select("id, user_id, tier, revoked_at").eq("id", grantId).maybeSingle();
  if (!grant) return { ok: false, error: "Grant not found" };
  if (grant.revoked_at) return { ok: false, error: "Already revoked" };
  const { error } = await admin.from("plan_grants")
    .update({ revoked_at: new Date().toISOString() }).eq("id", grantId);
  if (error) return { ok: false, error: error.message };
  if (grant.user_id) await recomputeEntitlements(admin, grant.user_id);
  await logStaffAction(admin, {
    actor: staff.userId, action: "revoke_grant", targetUser: grant.user_id,
    detail: { grantId, tier: grant.tier },
  });
  return { ok: true };
}
```

- [ ] **Step 2: Implement `app/staff/page.tsx` + `app/staff/user-detail.tsx`**

`app/staff/page.tsx` — thin server page hosting the client search UI:
```tsx
import { StaffUsersPanel } from "./user-detail";

export default function StaffUsersPage() {
  return <StaffUsersPanel />;
}
```
`app/staff/user-detail.tsx` — the client panel (search box → result list → detail with grant form). Complete component:
```tsx
"use client";

import { useState, useTransition } from "react";
import { searchUsers, getUserDetail, grantTier, revokeGrant, type StaffUserRow } from "./actions";

type Detail = NonNullable<Awaited<ReturnType<typeof getUserDetail>>["user"]>;

const inputClass =
  "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none";

export function StaffUsersPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StaffUserRow[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [grantForm, setGrantForm] = useState({ tier: "shader", expiresAt: "", note: "", email: "" });

  const runSearch = () =>
    startTransition(async () => {
      const res = await searchUsers(query);
      setResults(res.users);
      setDetail(null);
      setMessage(res.error ?? null);
    });

  const openDetail = (userId: string) =>
    startTransition(async () => {
      const res = await getUserDetail(userId);
      if (res.ok && res.user) { setDetail(res.user); setMessage(null); }
      else setMessage(res.error ?? "Failed to load user");
    });

  const submitGrant = (userId?: string) =>
    startTransition(async () => {
      const res = await grantTier({
        userId,
        email: userId ? undefined : grantForm.email || undefined,
        tier: grantForm.tier as "liner" | "shader" | "magnum",
        expiresAt: grantForm.expiresAt ? new Date(grantForm.expiresAt).toISOString() : undefined,
        note: grantForm.note,
      });
      setMessage(res.ok ? "Granted." : res.error ?? "Grant failed");
      if (res.ok && userId) void openDetail(userId);
    });

  const doRevoke = (grantId: string, userId: string) =>
    startTransition(async () => {
      const res = await revokeGrant(grantId);
      setMessage(res.ok ? "Revoked." : res.error ?? "Revoke failed");
      if (res.ok) void openDetail(userId);
    });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={pending}
            className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Search
          </button>
        </div>
        <ul className="mt-4 divide-y divide-gray-100">
          {results.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => openDetail(u.id)}
                className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left hover:bg-gray-50"
              >
                <span>
                  <span className="block text-sm font-medium text-gray-900">{u.name ?? u.email}</span>
                  <span className="block text-xs text-gray-500">{u.email} · {u.role}</span>
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {u.tier ?? "free"}{u.tierSource === "grant" ? " (comp)" : ""}
                </span>
              </button>
            </li>
          ))}
          {!results.length && (
            <li className="py-6 text-center text-sm text-gray-400">No results yet — search above.</li>
          )}
        </ul>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-900">Grant by email (pre-signup)</p>
          <p className="mb-2 text-xs text-gray-500">Applies automatically when they register.</p>
          <input
            className={inputClass}
            placeholder="person@example.com"
            value={grantForm.email}
            onChange={(e) => setGrantForm({ ...grantForm, email: e.target.value })}
          />
          <GrantFields form={grantForm} setForm={setGrantForm} />
          <button
            type="button"
            onClick={() => submitGrant(undefined)}
            disabled={pending || !grantForm.email}
            className="mt-2 min-h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Grant to email
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {!detail ? (
          <p className="py-6 text-center text-sm text-gray-400">Select a user to manage.</p>
        ) : (
          <div>
            <h2 className="text-base font-semibold text-gray-900">{detail.name ?? detail.email}</h2>
            <p className="text-xs text-gray-500">{detail.email} · {detail.role}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-xs text-gray-500">Tier</dt><dd className="font-medium text-gray-900">{detail.tier ?? "free"} {detail.tierSource ? `(${detail.tierSource})` : ""}</dd></div>
              <div><dt className="text-xs text-gray-500">Billing</dt><dd className="font-medium text-gray-900">{detail.billingStatus}{detail.subStatus ? ` / ${detail.subStatus}` : ""}</dd></div>
            </dl>
            {detail.stripeCustomerId ? (
              <a
                className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-500"
                href={`https://dashboard.stripe.com/customers/${detail.stripeCustomerId}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Stripe
              </a>
            ) : null}

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-900">Grant a tier</p>
              <GrantFields form={grantForm} setForm={setGrantForm} />
              <button
                type="button"
                onClick={() => submitGrant(detail.id)}
                disabled={pending}
                className="mt-2 min-h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Grant to {detail.name ?? detail.email}
              </button>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-2 text-sm font-medium text-gray-900">Grant history</p>
              <ul className="space-y-2">
                {detail.grants.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2">
                    <span className="text-xs text-gray-600">
                      <span className="font-medium text-gray-900">{g.tier}</span>
                      {" — "}{g.note}
                      {g.expiresAt ? ` · until ${new Date(g.expiresAt).toLocaleDateString()}` : " · forever"}
                      {g.revokedAt ? " · revoked" : ""}
                    </span>
                    {!g.revokedAt ? (
                      <button
                        type="button"
                        onClick={() => doRevoke(g.id, detail.id)}
                        disabled={pending}
                        className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Revoke
                      </button>
                    ) : null}
                  </li>
                ))}
                {!detail.grants.length && <li className="text-xs text-gray-400">No grants.</li>}
              </ul>
            </div>
          </div>
        )}
        {message ? <p className="mt-3 text-xs font-medium text-gray-600">{message}</p> : null}
      </section>
    </div>
  );
}

function GrantFields({
  form,
  setForm,
}: {
  form: { tier: string; expiresAt: string; note: string; email: string };
  setForm: (f: { tier: string; expiresAt: string; note: string; email: string }) => void;
}) {
  return (
    <div className="mt-2 space-y-2">
      <select
        className={inputClass}
        value={form.tier}
        onChange={(e) => setForm({ ...form, tier: e.target.value })}
      >
        <option value="liner">Liner</option>
        <option value="shader">Shader</option>
        <option value="magnum">Magnum</option>
      </select>
      <input
        type="date"
        className={inputClass}
        value={form.expiresAt}
        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
        aria-label="Expires (leave empty for forever)"
      />
      <input
        className={inputClass}
        placeholder="Why? (required, goes in the audit log)"
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
    </div>
  );
}
```
After building, adapt to house primitives where they drop code (Button, StatusBadge, GroupLabel, EmptyState, ListRow from `components/ui/`) — check their props in `app/component-library` and prefer them over the raw elements above when the swap is one-to-one. Add the two showcase entries only if a new `components/ui/*` component is created (none is expected).

- [ ] **Step 3: Verify**

As founder: search finds accounts by partial email and name; grant Magnum forever to a studio → their builder publishes with no paywall instantly; revoke → `profiles.tier` drops and site unpublishes; grant to an unregistered email, sign that email up → account starts with the tier (Task 1's trigger); every action appears in `staff_audit_log`.

- [ ] **Step 4: Commit**

```bash
git add app/staff/actions.ts app/staff/page.tsx app/staff/user-detail.tsx
git commit -m "feat(staff): users tab with tier grants, revocation, and audit"
```

---

### Task 13: Staff Promos tab

**Files:**
- Create: `app/staff/promos/page.tsx`
- Create: `app/staff/promos/promos-panel.tsx` (client)
- Modify: `app/staff/actions.ts` (append promo actions)

**Interfaces:**
- Consumes: `createPromo`, `listPromos`, `setPromoActive` (Task 3); `requireStaff`, `logStaffAction`.
- Produces: `createPromoCode(input)`, `deactivatePromoCode(id)`, `getPromoCodes()` server actions.

- [ ] **Step 1: Append to `app/staff/actions.ts`**

```ts
import { createPromo, listPromos, setPromoActive, type PromoRow } from "@/lib/billing/stripe";

const PromoInputSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{3,20}$/, "Code: 3-20 chars, A-Z 0-9 _ -"),
  percentOff: z.number().int().min(1).max(100),
  duration: z.union([z.literal("once"), z.literal("forever"), z.object({ months: z.number().int().min(1).max(36) })]),
  maxRedemptions: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
  firstTimeOnly: z.boolean().optional(),
});

export async function getPromoCodes(): Promise<{ ok: boolean; promos: PromoRow[]; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, promos: [], error: "Forbidden" };
  try {
    return { ok: true, promos: await listPromos() };
  } catch (err) {
    console.error("listPromos failed:", err);
    return { ok: false, promos: [], error: "Stripe list failed" };
  }
}

export async function createPromoCode(raw: unknown): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const parsed = PromoInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const created = await createPromo(parsed.data);
    await logStaffAction(createAdminClient(), {
      actor: staff.userId, action: "create_promo", detail: { ...parsed.data, promoId: created.id },
    });
    return { ok: true };
  } catch (err) {
    console.error("createPromo failed:", err);
    return { ok: false, error: "Stripe rejected the promo (duplicate code?)" };
  }
}

export async function deactivatePromoCode(promotionCodeId: string): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  try {
    await setPromoActive(promotionCodeId, false);
    await logStaffAction(createAdminClient(), {
      actor: staff.userId, action: "deactivate_promo", detail: { promotionCodeId },
    });
    return { ok: true };
  } catch (err) {
    console.error("deactivatePromo failed:", err);
    return { ok: false, error: "Stripe deactivate failed" };
  }
}
```

- [ ] **Step 2: Implement the pages**

`app/staff/promos/page.tsx`:
```tsx
import { PromosPanel } from "./promos-panel";

export default function StaffPromosPage() {
  return <PromosPanel />;
}
```
`app/staff/promos/promos-panel.tsx`:
```tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { createPromoCode, deactivatePromoCode, getPromoCodes } from "../actions";
import type { PromoRow } from "@/lib/billing/stripe";

const inputClass =
  "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none";

export function PromosPanel() {
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: "", percentOff: 20, durationKind: "once", months: 3,
    maxRedemptions: "", expiresAt: "", firstTimeOnly: true,
  });

  const load = () =>
    startTransition(async () => {
      const res = await getPromoCodes();
      setPromos(res.promos);
      setMessage(res.error ?? null);
    });

  useEffect(() => { load(); /* initial */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () =>
    startTransition(async () => {
      const res = await createPromoCode({
        code: form.code.toUpperCase(),
        percentOff: Number(form.percentOff),
        duration: form.durationKind === "months" ? { months: Number(form.months) } : form.durationKind,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        firstTimeOnly: form.firstTimeOnly,
      });
      setMessage(res.ok ? "Promo created." : res.error ?? "Failed");
      if (res.ok) load();
    });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-900">New promotion code</p>
        <div className="space-y-2">
          <input className={inputClass} placeholder="CODE (e.g. LAUNCH30)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <div className="flex gap-2">
            <input type="number" min={1} max={100} className={inputClass} value={form.percentOff}
              aria-label="Percent off"
              onChange={(e) => setForm({ ...form, percentOff: Number(e.target.value) })} />
            <select className={inputClass} value={form.durationKind}
              onChange={(e) => setForm({ ...form, durationKind: e.target.value })}>
              <option value="once">First invoice only</option>
              <option value="months">For N months</option>
              <option value="forever">Forever</option>
            </select>
          </div>
          {form.durationKind === "months" ? (
            <input type="number" min={1} max={36} className={inputClass} value={form.months}
              aria-label="Months" onChange={(e) => setForm({ ...form, months: Number(e.target.value) })} />
          ) : null}
          <div className="flex gap-2">
            <input type="number" min={1} className={inputClass} placeholder="Max redemptions (optional)"
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} />
            <input type="date" className={inputClass} value={form.expiresAt}
              aria-label="Expires (optional)"
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.firstTimeOnly}
              onChange={(e) => setForm({ ...form, firstTimeOnly: e.target.checked })} />
            First-time customers only
          </label>
          <button type="button" onClick={submit} disabled={pending || !form.code}
            className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
            Create promo
          </button>
          {message ? <p className="text-xs font-medium text-gray-600">{message}</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-900">Existing codes</p>
        <ul className="divide-y divide-gray-100">
          {promos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-sm">
                <span className="font-mono font-medium text-gray-900">{p.code}</span>
                <span className="block text-xs text-gray-500">
                  {p.percentOff}% off · {p.duration === "repeating" ? `${p.durationInMonths} months` : p.duration}
                  {" · "}{p.timesRedeemed}{p.maxRedemptions ? `/${p.maxRedemptions}` : ""} used
                  {p.expiresAt ? ` · until ${new Date(p.expiresAt).toLocaleDateString()}` : ""}
                  {!p.active ? " · inactive" : ""}
                </span>
              </span>
              {p.active ? (
                <button type="button" onClick={() => startTransition(async () => {
                    const res = await deactivatePromoCode(p.id);
                    setMessage(res.ok ? "Deactivated." : res.error ?? "Failed");
                    if (res.ok) load();
                  })}
                  disabled={pending}
                  className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Deactivate
                </button>
              ) : null}
            </li>
          ))}
          {!promos.length && <li className="py-6 text-center text-sm text-gray-400">No promotion codes yet.</li>}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify** — create `LAUNCH30` (30% off, 3 months, first-time only) → appears in list AND in the Stripe test dashboard; run a checkout and redeem it in the promo box → discount applies; deactivate → checkout no longer accepts it.

- [ ] **Step 4: Commit**

```bash
git add app/staff/promos/ app/staff/actions.ts
git commit -m "feat(staff): promotion code management"
```

---

### Task 14: Staff Team + Audit tabs

**Files:**
- Create: `app/staff/team/page.tsx`, `app/staff/team/team-panel.tsx`
- Create: `app/staff/audit/page.tsx`
- Modify: `app/staff/actions.ts` (append team actions)

**Interfaces:**
- Produces: `addStaffMember(email: string, role: "staff" | "founder")`, `removeStaffMember(userId: string)`, `getStaffList()`.

- [ ] **Step 1: Append team actions to `app/staff/actions.ts`**

```ts
export interface StaffMemberRow { userId: string; email: string; name: string | null; role: string; createdAt: string }

export async function getStaffList(): Promise<{ ok: boolean; members: StaffMemberRow[]; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, members: [], error: "Forbidden" };
  const admin = createAdminClient();
  const { data: rows } = await admin.from("staff").select("user_id, role, created_at").order("created_at");
  const ids = (rows ?? []).map((r) => r.user_id);
  const { data: profiles } = await admin.from("profiles").select("id, name").in("id", ids);
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.name]));
  const emailById = new Map((authList?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  return {
    ok: true,
    members: (rows ?? []).map((r) => ({
      userId: r.user_id, role: r.role, createdAt: r.created_at,
      name: nameById.get(r.user_id) ?? null, email: emailById.get(r.user_id) ?? "",
    })),
  };
}

export async function addStaffMember(email: string, role: "staff" | "founder"): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff("founder");
  if (!staff) return { ok: false, error: "Founders only" };
  const admin = createAdminClient();
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const target = authList?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!target) return { ok: false, error: "No account with that email — they must sign up first." };
  const { error } = await admin.from("staff")
    .upsert({ user_id: target.id, role, added_by: staff.userId }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };
  await logStaffAction(admin, { actor: staff.userId, action: "add_staff", targetUser: target.id, detail: { role } });
  return { ok: true };
}

export async function removeStaffMember(userId: string): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff("founder");
  if (!staff) return { ok: false, error: "Founders only" };
  const admin = createAdminClient();
  // Last-founder guard: never remove or demote the final founder.
  const { data: target } = await admin.from("staff").select("role").eq("user_id", userId).maybeSingle();
  if (!target) return { ok: false, error: "Not a staff member" };
  if (target.role === "founder") {
    const { count } = await admin.from("staff").select("user_id", { count: "exact", head: true }).eq("role", "founder");
    if ((count ?? 0) <= 1) return { ok: false, error: "Cannot remove the last founder." };
  }
  const { error } = await admin.from("staff").delete().eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  await logStaffAction(admin, { actor: staff.userId, action: "remove_staff", targetUser: userId, detail: {} });
  return { ok: true };
}
```

- [ ] **Step 2: Implement `app/staff/team/team-panel.tsx` + page**

Page mirrors the promos page (server page rendering `<TeamPanel />`). Panel — complete component:
```tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { addStaffMember, getStaffList, removeStaffMember, type StaffMemberRow } from "../actions";

const inputClass =
  "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none";

export function TeamPanel() {
  const [members, setMembers] = useState<StaffMemberRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "founder">("staff");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = () =>
    startTransition(async () => {
      const res = await getStaffList();
      setMembers(res.members);
      setMessage(res.error ?? null);
    });

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const add = () =>
    startTransition(async () => {
      const res = await addStaffMember(email, role);
      setMessage(res.ok ? "Added." : res.error ?? "Failed");
      if (res.ok) { setEmail(""); load(); }
    });

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-900">Add staff (founders only)</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className={inputClass} placeholder="teammate@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <select className={`${inputClass} sm:w-40`} value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "founder")}>
            <option value="staff">Staff</option>
            <option value="founder">Founder</option>
          </select>
          <button type="button" onClick={add} disabled={pending || !email}
            className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
            Add
          </button>
        </div>
        {message ? <p className="mt-2 text-xs font-medium text-gray-600">{message}</p> : null}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-900">Current staff</p>
        <ul className="divide-y divide-gray-100">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-2 py-2">
              <span>
                <span className="block text-sm font-medium text-gray-900">{m.name ?? m.email}</span>
                <span className="block text-xs text-gray-500">{m.email} · {m.role}</span>
              </span>
              <button type="button" disabled={pending}
                onClick={() => startTransition(async () => {
                  const res = await removeStaffMember(m.userId);
                  setMessage(res.ok ? "Removed." : res.error ?? "Failed");
                  if (res.ok) load();
                })}
                className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Implement `app/staff/audit/page.tsx`** (server component, no client state needed)

```tsx
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff/guard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StaffAuditPage() {
  const staff = await requireStaff();
  if (!staff) notFound();
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("staff_audit_log")
    .select("id, actor, action, target_user, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {(rows ?? []).map((r) => (
          <li key={r.id} className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{r.action}</p>
            <p className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleString()} · actor {r.actor.slice(0, 8)}
              {r.target_user ? ` · target ${r.target_user.slice(0, 8)}` : ""}
            </p>
            <pre className="mt-1 overflow-x-auto text-xs text-gray-600">{JSON.stringify(r.detail)}</pre>
          </li>
        ))}
        {!rows?.length && <li className="px-4 py-8 text-center text-sm text-gray-400">No staff actions yet.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Verify** — Team tab as founder: add a second account as staff → that account sees `/staff` but gets "Founders only" on team mutations; removing the sole founder fails with the guard message; Audit tab lists every action from Tasks 12-14 testing.

- [ ] **Step 5: Commit**

```bash
git add app/staff/team/ app/staff/audit/ app/staff/actions.ts
git commit -m "feat(staff): team management with last-founder guard and audit view"
```

---

### Task 15: Full verification sweep

**Files:**
- Modify: whatever the sweep flags (fixes only)

- [ ] **Step 1: Static checks**

Run: `npx tsx scripts/check-billing.ts && npm run lint && npx tsc --noEmit`
Expected: all three clean.

- [ ] **Step 2: End-to-end flows (Stripe test mode, `stripe listen` running)**

Walk the spec's verification list; each item must pass:
1. No-card trial checkout → `trialing`, publish works.
2. Second checkout same user → no trial offered.
3. Promo code redemption at checkout.
4. Portal cancel at period end → `cancelled_at` set, access retained.
5. Immediate cancel in dashboard → webhook downgrades + unpublishes.
6. `invoice.payment_failed` (Stripe test clock or `stripe trigger invoice.payment_failed`) → `past_due`, access retained.
7. Staff grant → instant tier; revoke → instant downgrade.
8. Grant expiry: insert grant with `expires_at = now() - interval '1 day'`, run `select public.sweep_entitlements();` → downgraded.
9. Grant-by-email → applied at signup.
10. `/staff` as non-staff → 404.
11. Client write to `published_theme_config` via SQL impersonation → trigger exception.

- [ ] **Step 3: Update the launch checklist**

Add a "Billing" section to the existing launch checklist doc (find it: `grep -rln "launch checklist" docs/ --include="*.md" -i`) covering: run `setup-stripe-catalog.ts` in live mode, set the 8 live price env vars + `NEXT_PUBLIC_APP_URL` in Vercel, add the live webhook endpoint (`/api/webhooks/stripe`) with the subscription events, configure the Customer Portal (allow plan switches among catalog prices + cancel at period end) in live mode.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(billing): verification fixes and launch checklist"
```

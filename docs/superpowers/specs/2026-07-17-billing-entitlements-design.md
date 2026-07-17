# Billing, Entitlements & Staff Portal — Design

**Date:** 2026-07-17
**Status:** Approved (design review with founder)
**Supersedes:** the metadata-stub billing in `use-plan-billing.ts` and the client-only publish paywall.

## Goals

1. Collect real subscription payments for paid tiers (Artist Shader; Studio Liner/Shader/Magnum, monthly + annual).
2. Public marketing levers: 14-day no-card free trial on first paid checkout, plus promotion codes.
3. Founder/staff tool to grant any account any tier — free forever or until a date — and revoke it, without touching Stripe.
4. Enforce the paywall server-side (today it is client-JS only and bypassable via direct row update).

**Provider decision: Stripe Billing** (Checkout + Customer Portal + webhooks) on the existing platform account. Rationale: cheapest all-in (~2.9% + 30¢ + 0.7% Billing vs ~6.7% for MoR platforms), already integrated for Connect booking deposits (documented coexistence, no conflict), native trials/coupons/promotion codes. Paddle's AUP prohibits marketplaces; Lemon Squeezy is winding into Stripe Managed Payments (preview); Polar has open payout-reliability complaints. Stripe Tax deferred until economic nexus approaches.

## Architecture principle

**The DB is the source of truth for entitlements. Stripe is one writer to it; staff grants are another.**

- `profiles.tier` remains the single column every gate reads (`tierMeetsRequirement` / `TIER_ORDER` from `lib/utils/integration-helpers.ts` keep working unchanged).
- Effective tier = **max by TIER_ORDER of (subscription tier, active grant tier)**. Recomputed and written to `profiles` on: every webhook sync, every grant change, checkout verify-on-return, signup (email grants), and a daily cron sweep.
- Comped accounts never touch Stripe: no customer, no $0 invoices, no fees.

## Data model (migration 025)

### profiles (alter)
- `billing_status` check widened to `('none','trialing','active','past_due','cancelled')`, default `'none'` (replaces `'draft'`; existing rows remapped).
- New `tier_source text check (tier_source in ('subscription','grant'))` nullable — lets the owner-readable row say *why* they have a tier (settings renders "Complimentary" for `'grant'`). Higher tier wins; tie goes to `'subscription'`.
- `tier` semantics: **the effective entitled tier**, written only by the entitlement engine (server). Null = free/none. `next_billing_date`, `cancelled_at`, `billing_cycle` become mirrors of the Stripe subscription for UI.

### billing_customers (new, service-role only — `studio_connections` RLS pattern: RLS enabled, zero policies)
One row per user who has ever started checkout:
`user_id uuid PK → auth.users`, `stripe_customer_id text unique not null`, `stripe_subscription_id text`, `sub_tier text`, `sub_status text`, `sub_cycle text`, `current_period_end timestamptz`, `cancel_at timestamptz`, `trial_used boolean default false`, `updated_at`.

### plan_grants (new, service-role only)
`id uuid PK`, `user_id uuid nullable → auth.users`, `email text nullable` (lower-cased; for grants to people who haven't registered — exactly one of user_id/email set at creation), `tier text not null check in ('liner','shader','magnum')`, `note text`, `granted_by uuid not null`, `expires_at timestamptz nullable` (null = forever), `revoked_at timestamptz nullable`, `created_at`.
Rows are never deleted — revoke sets `revoked_at`. A grant is **active** when `revoked_at is null and (expires_at is null or expires_at > now())` and `user_id is not null`.

### staff (new, service-role only)
`user_id uuid PK`, `role text not null check in ('founder','staff')`, `added_by uuid`, `created_at`. Seeded with the founder's user id in the migration.

### staff_audit_log (new, service-role only)
`id`, `actor uuid`, `action text`, `target_user uuid nullable`, `detail jsonb`, `created_at`. Every staff-portal mutation writes one row.

### stripe_events (new)
`id text PK` (Stripe event id), `created_at`. Webhook idempotency: `insert … on conflict do nothing`; if no row inserted, skip processing.

### Publish-column guard (trigger)
`BEFORE UPDATE ON studios`: if `auth.uid() IS NOT NULL` (i.e., an RLS client request, not service role) and any of `published_theme_config`, `published_at`, `is_visible` changed → `raise exception`. Draft columns (`theme_config` etc.) stay freely writable by owners. All publish/go-live/unlist writes move to server actions using the admin client.

### Email-grant application (trigger extension)
`handle_new_user()` extended: after inserting the profile, claim any `plan_grants` rows where `user_id is null and email = lower(new.email)` (set `user_id`), then compute and write the effective tier onto the new profile.

### Cron sweep (pg_cron, daily — reuses the `021_deposits` pattern)
Recompute effective tier for every user with a grant that expired since the last run, or a subscription whose `current_period_end` elapsed more than 72h ago without a webhook update (missed-webhook safety net); downgrade `profiles`, and unpublish/unlist studios whose owner dropped below the tier their live state requires. (Stripe webhooks are the primary downgrade path; the sweep is the safety net and the only path for grant expiry.)

## Entitlement engine (`lib/billing/entitlements.ts`)

Single server-only function `recomputeEntitlements(userId)`:
1. Read `billing_customers` sub state + active `plan_grants` (admin client).
2. `subTier` counts when `sub_status in ('trialing','active','past_due')` (past_due keeps access during Stripe's dunning retries; `customer.subscription.deleted` ends it).
3. Effective tier/source per the max rule; write `tier`, `tier_source`, `billing_status`, `billing_cycle`, `next_billing_date`, `cancelled_at` to `profiles`.
4. If the user owns a studio and the new tier no longer supports its live state (`published_theme_config` requires shader+; `is_visible` alone requires liner+), unpublish and/or unlist server-side.

Every writer (webhook sync, grant actions, verify-on-return, sweep) converges on this one function — the `confirmDepositPaid` convergence pattern.

## Stripe integration (`lib/billing/`)

House style: SDK-free `fetch` like `lib/booking/deposits/stripe.ts`. Same env `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`.

### Catalog (`lib/billing/catalog.ts`)
Map `(role, tier, cycle) → price id` from 8 env vars:
`STRIPE_PRICE_ARTIST_SHADER_{MONTHLY,ANNUAL}`, `STRIPE_PRICE_STUDIO_{LINER,SHADER,MAGNUM}_{MONTHLY,ANNUAL}`.
A one-off script `scripts/setup-stripe-catalog.ts` creates the Products/Prices (test and live) from `lib/data/signup-tiers.ts` amounts and prints the env lines.

### Checkout (server action `startCheckout({tier, cycle, intent})`)
- Get-or-create Stripe customer; persist mapping in `billing_customers`.
- Session: `mode: subscription`, catalog price, `client_reference_id: userId`, `metadata: {user_id, intent, tier, cycle}`, `allow_promotion_codes: true`.
- **Trial (first paid checkout only):** if `trial_used` is false → `subscription_data.trial_period_days: 14`, `payment_method_collection: 'if_required'`, `trial_settings.end_behavior.missing_payment_method: 'cancel'`. `trial_used` flips on subscription creation. No repeat trials.
- `success_url` carries `{CHECKOUT_SESSION_ID}`; `intent` is `'publish'` (from the builder paywall → return to builder, verify, then auto-publish) or `'upgrade'` (from settings/pricing → return to settings).

### Verify-on-return (server action)
On the success page: retrieve the session from the Stripe API, confirm subscription exists, run the sync (below), then perform the `intent` (e.g., publish). Users never wait on webhook latency.

### Customer Portal (server action `openBillingPortal()`)
Hosted portal configured to allow: payment-method update, plan switching among catalog prices, cancel at period end. Return URL `/settings`. This replaces nearly all custom billing-management UI; `changePlan`/`cancelPlan`/`resumePlan` stubs in `use-plan-billing.ts` are deleted in favor of Checkout/Portal redirects.

### Webhook (extend `app/api/webhooks/stripe/route.ts`)
- Existing raw-body signature verification stays; add a subscription branch alongside the deposit branch.
- Events: `checkout.session.completed` (mode=subscription), `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- All branches call one `syncBillingState(customerId)`: **re-fetch the subscription from the Stripe API** (event payloads are unordered/untrusted), map to `billing_customers` columns, then `recomputeEntitlements(userId)`.
- Idempotency via `stripe_events` insert-or-skip. Ack 200 fast.

## Promo codes (public marketing)

Stripe coupons + promotion codes, managed from the staff portal (create: % off or free months; duration once / repeating / forever; max redemptions; expiry; first-time-customers-only flag; deactivate; redemption counts). Customers redeem in Checkout's built-in promo box. For comps, staff use grants — not 100%-off codes — so comped accounts stay out of Stripe entirely.

## Server-side enforcement

- **Publish** (`publishStudio` server action): requireUser → owner check → `profiles.tier in ('shader','magnum')` → write `published_theme_config`/`published_at`/`is_visible` via admin client. The builder's `doPublish` client update is replaced by this action; `canPublish` remains as client UX only.
- **Go-live/unlist for Liner**: paying Studio Liner is what makes the basic listing visible. `setStudioVisibility` server action: `tier >= liner` required for `is_visible = true`.
- **Unpublish on downgrade** runs inside `recomputeEntitlements` (server), replacing the client-side `unpublishStudio()`.
- **Artist integrations** (`minTier` platforms): the OAuth start routes check `profiles.tier` server-side before issuing redirects; client gating stays as UX.
- **Auth provider cut-over**: `mapSupabaseUser` stops reading `meta.plan`/`meta.billing`; billing state comes from the `profiles` row. Pre-launch — no data migration, legacy remapper in `use-plan-billing.ts` deleted.

## Staff portal (`/staff`)

- Route group `app/staff/` with a server layout: `requireStaff()` (cookie auth → `staff` table via admin client). Non-staff → `notFound()` (the route does not reveal its existence). All actions re-check staff server-side and write `staff_audit_log`.
- **Users tab**: search by email/name/role (admin client). Detail view: profile, role, effective tier + source, subscription summary, Stripe customer deep-link, grant history. Actions: **grant tier** (forever or until date, note required), **revoke grant**. Grant-by-email supported for unregistered people (applied automatically at signup).
- **Promos tab**: promotion-code CRUD per above.
- **Staff tab** (founder role only): add staff by email (must be an existing account), set role staff/founder, remove staff. Last-founder guard: the final founder cannot be removed or demoted.
- **Audit tab**: reverse-chronological `staff_audit_log` with actor/action/target/detail.

### Edge cases (decided)
- Grant + paid subscription coexist; higher tier wins, tie → subscription. Revoking one falls back to the other.
- Grant expiry: sweep downgrades and unpublishes automatically.
- Comped users' settings show a "Complimentary — granted by Inked Market" card instead of billing controls; if they *also* hold a subscription, portal management stays available.
- Role change (artist ↔ studio) preserves grants (grants are per-user tier levels, not per-role).
- Removing a staff member keeps their audit rows and past grants intact.
- Trial abuse: one trial per Stripe customer, enforced by `trial_used`.

## Signup & paywall UX

- **Studio**: signup stays free with the plan step hidden (freemium model unchanged). The builder's `PublishPaywallDialog` now starts real Checkout (Shader/Magnum choice), and verify-on-return auto-publishes — the same one-click feel as today's `upgradeAndPublish`, with payment behind it. Studio Liner is purchasable from settings/pricing and turns on the basic listing.
- **Artist**: plan step keeps its picker. Liner → continue free. Shader → Checkout (with trial) after account creation; abandoning checkout leaves them on Liner.
- **Settings → Plan & Billing** (`plan-billing-section.tsx`): reads real `profiles` state; upgrade buttons → Checkout; manage/cancel/card → Portal; complimentary card for grants.
- **Pricing page** CTAs route to signup or Checkout by auth state.

## Out of scope (deferred)

Stripe Tax (until nexus nears), email dunning notifications (Stripe retries natively; `notifications` outbox later), API-executed refunds, seat/usage pricing, Accounts v2 consolidation of Connect accounts + Customers, self-serve trial extensions.

## Verification

- Stripe test mode + `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- Scripted passes: trial checkout (no card) → trialing state; trial expiry → cancel → downgrade + unpublish; paid checkout with promo code; cancel at period end; `invoice.payment_failed` → past_due keeps access; subscription deleted → downgrade; staff grant → instant tier, publish works; grant expiry via sweep → downgrade; grant-by-email → applied at signup; non-staff hitting `/staff` → 404; direct client update of `published_theme_config` → rejected by trigger.
- `scripts/check-billing.ts` assert script (house `check-builder.ts` pattern): catalog env completeness, entitlement max-rule truth table, status mapping.
- `npm run lint` + `tsc` clean.

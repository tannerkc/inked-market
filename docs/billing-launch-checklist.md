# Subscription Billing — Go-Live Checklist

Everything left between "built and DB-verified" (2026-07-17) and "collecting real subscription revenue." Work top to bottom; each item says where it happens and how to prove it worked.

Spec: `docs/superpowers/specs/2026-07-17-billing-entitlements-design.md` · Plan: `docs/superpowers/plans/2026-07-17-billing-entitlements.md`

**Current state:** entitlements, staff grants, the `/staff` portal, and server-side paywall enforcement all work today with NO Stripe credentials (verified against the live DB). Everything below is only needed to charge cards.

---

## 1. Stripe test mode (verify the money path end-to-end)

At https://dashboard.stripe.com in **test mode**:

- [ ] Get the test secret key → add to `.env.local` as `STRIPE_SECRET_KEY=sk_test_...`
- [ ] Run `npx tsx scripts/setup-stripe-catalog.ts` → paste the 8 printed `STRIPE_PRICE_*` lines into `.env.local`, plus `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [ ] Configure the **Customer Portal** (Settings → Billing → Customer portal): allow payment-method updates, cancel at period end, and plan switches among the 8 catalog prices
- [ ] `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → put the printed `whsec_...` in `STRIPE_WEBHOOK_SECRET`
- [ ] Walk the flows and confirm each DB effect:
  - [ ] No-card trial checkout (`/billing/start?tier=shader&cycle=monthly`) → `profiles.billing_status = 'trialing'`, no card asked, promo box visible
  - [ ] Second checkout same account → no trial offered
  - [ ] Promo code created in `/staff` → redeems at checkout with the discount applied
  - [ ] Builder paywall → Checkout → returns to `/dashboard/builder?published=1`, public page live
  - [ ] Dashboard "Choose a Plan" (go-live strip) → Checkout → returns to `/dashboard?live=1`, listing visible
  - [ ] Cancel at period end in the portal → `cancelled_at` set, access retained, "Resume Plan" shows in settings
  - [ ] Immediate cancel in the Stripe dashboard → webhook downgrades, site unpublishes
  - [ ] `stripe trigger invoice.payment_failed` → `past_due`, access retained, settings shows the card-update prompt
  - [ ] Replay a webhook event id (`stripe events resend evt_...`) → no double-processing (stripe_events idempotency)

## 2. Live mode

- [ ] Repeat the catalog script with the **live** secret key; put the 8 live price ids + live `STRIPE_SECRET_KEY` in Vercel env (Production)
- [ ] Set `NEXT_PUBLIC_APP_URL=https://<production-domain>` in Vercel
- [ ] Add a live webhook endpoint → `https://<production-domain>/api/webhooks/stripe` with events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` → put its `whsec_...` in Vercel as `STRIPE_WEBHOOK_SECRET`
- [ ] Configure the live-mode Customer Portal the same as test mode

## 3. Already done (no action)

- Migration 026 applied: entitlement tables, publish-column guard trigger, email-grant claiming in `handle_new_user`, daily `sweep-entitlements` pg_cron (06:17 UTC)
- Founder seeded: `tanner@studio.com` → `/staff` (Users · Promos · Team · Audit)
- Grant/revoke/expiry pipeline verified against the live DB (grant → instant tier; revoke → instant downgrade; expiry → sweep downgrades)

## Deferred (deliberate)

Stripe Tax (until economic nexus nears) · email dunning notifications (Stripe retries natively) · API-executed refunds · Accounts v2 consolidation.

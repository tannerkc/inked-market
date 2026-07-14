# Booking System — Go-Live Checklist

Everything left between "built and smoke-verified" (2026-07-14, phases 1-6) and "taking real bookings with real money." Work top to bottom; each item says where it happens and how to prove it worked.

Spec: `docs/superpowers/specs/2026-07-14-booking-system-design.md` · Plans: `docs/superpowers/plans/2026-07-14-booking-*.md`

**Current state:** the entire system works today with NO external credentials — deposits degrade to the manual "mark received" path. Sections 1-2 are only needed to charge cards.

---

## 1. Stripe (real deposits via Stripe Connect Standard)

All of this happens at https://dashboard.stripe.com (start in **test mode**, repeat in live mode).

- [ ] Enable **Connect** on the platform account (Settings → Connect). Choose **Standard** accounts.
- [ ] Copy the Connect **client ID** (`ca_...`) → env `STRIPE_CLIENT_ID`
- [ ] Copy the platform **secret key** (`sk_test_...` / `sk_live_...`) → env `STRIPE_SECRET_KEY`
- [ ] Register the OAuth redirect under Connect settings → Integration:
  - `https://<domain>/api/payments/stripe/callback`
  - (local testing: `http://localhost:3002/api/payments/stripe/callback`)
- [ ] Create a webhook endpoint (Developers → Webhooks) — **"Listen to events on Connected accounts"**, NOT the platform account:
  - URL: `https://<domain>/api/webhooks/stripe`
  - Events: `checkout.session.completed`
  - Copy the signing secret (`whsec_...`) → env `STRIPE_WEBHOOK_SECRET`
- [ ] **Verify:** artist dashboard → Booking Settings → Deposit payments → Connect Stripe completes and shows the account name; book a deposit-backed flow with test card `4242 4242 4242 4242`; appointment flips `pending_deposit → confirmed` (webhook) or on returning to the dashboard (verify-on-return).

## 2. Square (real deposits via Payment Links)

At https://developer.squareup.com/apps (existing app — the hours-import integration already uses it). `SQUARE_OAUTH_CLIENT_ID`/`SECRET`/`SQUARE_ENVIRONMENT` are already in `.env.local`.

- [ ] Confirm the OAuth redirect list includes: `https://<domain>/api/payments/square/callback` (Square has no per-request redirect_uri — the console list is authoritative; sandbox and production are registered separately)
- [ ] Subscriptions → Webhooks: subscribe to `payment.updated`
  - URL: `https://<domain>/api/webhooks/square` — **must match exactly**; the HMAC signature covers the URL string itself
  - Copy the **signature key** → env `SQUARE_WEBHOOK_SIGNATURE_KEY`
- [ ] Note: artists must connect Square through **Booking Settings → Connect Square** (the payments flow requests `PAYMENTS_WRITE ORDERS_WRITE ORDERS_READ PAYMENTS_READ` on top of the profile scope). A studio's old hours-import connection does NOT carry payment scopes.
- [ ] **Verify:** connect a sandbox merchant, book a flash piece with a deposit, pay via the Square link (sandbox test card), confirm the flip to `confirmed`.

## 3. Environment variables

Local `.env.local` AND Vercel project env (production + preview):

- [ ] `STRIPE_CLIENT_ID`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `SQUARE_WEBHOOK_SIGNATURE_KEY`
- [ ] `CRON_SECRET` — already used by `pause-unconfirmed`; confirm it exists in Vercel (the new `deposit-sweep` cron sends it too)
- [ ] `INTEGRATIONS_TOKEN_KEY` — set a **dedicated** value in production. Token sealing currently falls back to a key derived from `SUPABASE_SERVICE_ROLE_KEY` (fine for dev, flagged in `lib/integrations/crypto.ts`). Set it BEFORE the first real payment connection — changing it later orphans previously sealed tokens (artists just reconnect).
- [ ] Redeploy after setting env vars; confirm `vercel.json` crons appear in the Vercel dashboard (`pause-unconfirmed` daily, `deposit-sweep` every 30 min).

## 4. Hands-on verification tour (no credentials needed)

One pass through every flow on `:3002` (or a preview deploy). Use three browsers/profiles: artist, studio owner, customer.

**Artist setup**
- [ ] Dashboard → Booking Settings: enable custom requests + consultations + flash; set consult length/price, default deposit, slot size, buffer, notice, window, timezone, cancellation policy → Save → reload → persists
- [ ] Set Availability: edit weekly days/blocks, block a date → Save → reload → persists
- [ ] Manage Flash: add a piece (image, price, duration, deposit, one-of-a-kind on)

**Customer books everything**
- [ ] Artist profile → "Book Consultation" → chooser shows all three flows
- [ ] Custom request: submit a brief with a reference image → confirmation → request shows Pending on customer dashboard
- [ ] Consultation: pick a slot → confirm → appears in Upcoming (both dashboards)
- [ ] Flash: book the one-off piece → confirm → try booking it again → "no longer available"
- [ ] Slot sanity: booked times disappear from the picker; blocked date shows no slots; times respect min-notice

**Request lifecycle**
- [ ] Artist inbox badge shows the request → open → Accept with quote + deposit + "I offer times" (2 times)
- [ ] Customer bell shows "accepted" notification; Messages thread has the `[Booking]` line
- [ ] Customer taps request → picks an offered time → appointment created born `pending_deposit` (deposit asked) → **manual deposit path**: artist Upcoming card shows "awaiting deposit" → Mark received → confirmed
- [ ] Second request accepted with "Open my calendar" + multi-session ON → customer books session 1 → panel shows "Sessions booked: 1 of ~N" and offers the picker again → book session 2
- [ ] Decline path: third request → decline with reason → customer sees Declined + message line
- [ ] Withdraw path: customer withdraws a fresh pending request

**Cancellation + refund copy**
- [ ] Customer cancels a far-future appointment with a PAID (marked-received) deposit → "refund is owed" copy, deposit shows `refund due`
- [ ] Customer cancels inside the cancellation window → "non-refundable" copy, deposit stays paid
- [ ] Artist cancel / complete / no-show buttons each land once (second click of anything → "already handled")

**Studio side**
- [ ] Artist grants front desk in Booking Settings → "Studio front desk" toggle
- [ ] Studio dashboard → Front Desk: book the granted artist (should double-book-reject on an occupied time) and a walk-in (overlapping walk-ins allowed)
- [ ] Studio Schedule card shows roster bookings + walk-ins grouped by day, color dots per artist
- [ ] Studio Booking Settings opens and saves (walk-ins toggle visible)

**Surfaces**
- [ ] Published studio site → artist strip shows "Book" next to "View profile" → lands on `/book/[artist]`
- [ ] Notification bell: unread badge counts, opens, marks read
- [ ] `deposit=paid` / `deposit=pending` return states land on the dashboard sensibly

## 5. Post-credential verification (repeat after sections 1-3)

- [ ] Stripe checkout end-to-end (test mode): book → redirected to Stripe → pay → return → confirmed; kill the return tab mid-flow → webhook confirms anyway; do neither → cron sweep confirms within 30 min
- [ ] Pending-deposit banner on the customer dashboard resumes an abandoned checkout
- [ ] Hold expiry: let a `pending_deposit` sit 24h (or set `hold_expires_at` in the past via SQL) → hourly pg_cron cancels it → paying the stale link afterward marks `refund_due`, never lost
- [ ] Square end-to-end (sandbox merchant)
- [ ] Disconnect/reconnect a provider; "Collect deposits via" honors the choice; unlinked artists fall back to manual

## 6. Production hygiene (before announcing)

- [ ] Run Supabase advisors (dashboard → Advisors, or MCP `get_advisors` if write access is restored) — check RLS/security findings on the 9 booking tables
- [ ] Confirm pg_cron jobs live: `select jobname, schedule from cron.job;` → `expire-booking-requests` (nightly 3:17), `release-deposit-holds` (hourly :05)
- [ ] Spot-check RLS from a THIRD account: customer C cannot read customer A's requests/appointments; artist B cannot respond to artist A's requests
- [ ] Decide deposit copy for the booking terms page (deposits non-refundable inside window — legal wording)

## 7. Deliberate v1 ceilings (fine to ship; revisit when they bite)

| Ceiling | Where | Upgrade path |
|---|---|---|
| Refunds recorded (`refund_due`), never executed | cancel flows | per-provider refund API + dispute thinking (spec fast-follow) |
| No email/SMS reminders | — | `notifications` table is the outbox; add a cron + Resend/Twilio |
| No Google Calendar sync | availability | `availability_overrides.source` column reserved; OAuth + busy-block import |
| Propose-mode multi-session books session 1 only | customer request panel | artist re-proposes, or sessions via front desk (commented in code) |
| Walk-ins have no online booking | by design | front desk covers it; walk-ins don't pre-book |
| No studio chair-capacity limit on overlapping walk-ins | appointments | capacity column + trigger if front desk overbooks chairs |
| Weekly-availability save is delete-then-insert, non-transactional | `replaceWeeklyRules` | move to an RPC if a failed save ever loses a template |
| `booking-refs` bucket is public-read (uuid paths) | reference images + flash art | signed URLs if privacy is ever required |
| Bell dropdown: no outside-click close; no realtime push | notifications bell | click-away handler; Supabase Realtime channel |
| No week/day calendar grid (lists only) | artist + studio | dedicated calendar view, drag-reschedule |
| Front desk can book outside online availability | by design | judgment call for phone bookings; constraint still blocks double-books |

## 8. Fast-follow backlog (rough order of value)

1. Email/SMS reminders (biggest no-show reducer after deposits)
2. Google Calendar two-way sync
3. Executed refunds via provider APIs
4. Realtime bell + toast on new requests
5. Calendar grid UI with reschedule
6. Waitlists / cancellation backfill
7. Reviews gated on completed appointments (`Review.verified` — ties booking to the review-integrity rule)

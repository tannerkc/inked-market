# Booking System Design

**Date:** 2026-07-14
**Status:** Approved
**Supersedes:** CLAUDE.md "Booking Model" section (partner-first adapter strategy). This design pivots to a full first-party booking engine. CLAUDE.md must be updated in the final build phase.

## Summary

A first-party booking system for Inked Market covering the four real tattoo workflows — custom work requests, consultation booking, flash/direct slot booking, and multi-session projects — for both artists (independent or affiliated) and studios (walk-ins, piercing). Deposits are optional and run on the artist's or studio's **own** Stripe or Square account via OAuth; the platform never holds funds. V1 availability is managed in-app (weekly hours, date overrides, blocked dates); external calendar sync (Google Calendar) is a designed-for fast-follow.

## Decisions Log

| Decision | Choice |
|---|---|
| Strategy | Full first-party engine (pivot away from thin-adapter-over-Porter/InkBook) |
| Money | Deposits optional per artist/studio, charged on their own Stripe or Square account (OAuth). Platform handles no funds. Manual "mark deposit received" for artists with no provider linked. |
| Workflows in v1 | Custom requests, consultations, flash slot booking, multi-session projects — all four |
| Custom scheduling | Artist chooses per-request at accept time: propose 2-3 times OR open their calendar to the customer |
| Calendar sync | Not in v1. Schema leaves room (overrides `source` column, future `busy_blocks`). |
| Ownership | Artist-owned bookings + studio-level bookings (walk-ins/piercing) + studio front desk acting for artists who grant permission |
| Architecture | Request/Appointment split (Approach 1): two aggregates + projects container + slim append-only event log |

## Data Model (migration `019_booking`)

Every bookable target is expressed as nullable `artist_id` / `studio_id` FK pair with `CHECK (artist_id IS NOT NULL OR studio_id IS NOT NULL)`. Artist appointments at a studio set both. Studio-only rows (walk-ins, piercing) set only `studio_id`. This never traps artists in a single-studio model and supports guest spots.

### Tables

**`booking_settings`** — one row per bookable entity (artist or studio):
- Flow toggles: `custom_requests_enabled`, `consultations_enabled`, `flash_enabled`, `walk_ins_enabled` (studio only)
- `accepting_bookings` master switch
- Consult config: `consult_duration_min`, `consult_price_cents` (0 = free), `consult_location` (`in_person` | `virtual`). A paid consult charges its price through the same deposit checkout rails (`deposit_cents` = consult price on the appointment).
- Deposit defaults: `default_deposit_cents` (per-request override at accept time)
- Payment provider: `payment_provider` (`stripe` | `square` | null) — account linkage lives in the existing integrations table
- Scheduling knobs: `slot_granularity_min` (default 30), `buffer_min`, `min_notice_hours`, `max_horizon_days`
- `timezone` (IANA), `cancellation_policy_text`, `cancellation_window_hours`

**`availability_rules`** — weekly template: entity ref, `weekday` (0-6), `start_time`, `end_time` (local time). Multiple rows per day = split shifts.

**`availability_overrides`** — date-specific: entity ref, `date`, `closed` boolean, optional replacement `start_time`/`end_time`, `source` text default `'manual'` (room for `'gcal'` busy-blocks later).

**`booking_requests`** — custom work asks:
- `customer_id`, `artist_id`, `studio_id` (target CHECK as above), `type` (`custom` in v1; column exists for cheap extension)
- Brief: `description`, `placement`, `size_category`, `budget_range`, `is_color`, `reference_image_urls` jsonb, `preferred_timing`, `flexible_dates`
- Multi-session intent: `is_multi_session`, `estimated_sessions`
- Status: `pending` | `accepted` | `declined` | `withdrawn` | `expired`; `expires_at` set on creation (default 14 days)
- Artist response (set on accept): `response_message`, `quote_min_cents`, `quote_max_cents`, `deposit_cents`, `scheduling_mode` (`propose` | `open_calendar`), `proposed_times` jsonb `[{start,end}]`
- `conversation_id` — link to the existing `public.conversations` messaging table (wired in phase 2)

**`appointments`** — anything with a concrete time:
- `customer_id`, `artist_id`, `studio_id` (target CHECK), `request_id`, `project_id`, `flash_item_id` (all nullable back-links)
- `type`: `consultation` | `flash` | `session` | `walk_in`
- `start_at`, `end_at` (timestamptz), `timezone` snapshot (IANA, copied from settings at creation)
- Status: `pending_deposit` | `confirmed` | `completed` | `cancelled` | `no_show`; `cancelled_by` (`customer` | `artist` | `studio`), `cancellation_reason`
- Money: `price_cents` (nullable), `deposit_cents`, `deposit_status` (`not_required` | `pending` | `paid` | `waived` | `refund_due` | `refunded`), `deposit_provider`, `deposit_checkout_id`, `deposit_paid_at`
- `hold_expires_at` — set when born `pending_deposit`; unpaid holds auto-release (default 24h)
- `notes` (artist-private), `customer_notes`

**Double-booking guarantee** (requires `btree_gist` extension):

```sql
CONSTRAINT no_artist_overlap EXCLUDE USING gist (
  artist_id WITH =, tstzrange(start_at, end_at) WITH &&
) WHERE (artist_id IS NOT NULL AND status IN ('pending_deposit','confirmed'))
```

No overlap constraint on studio-only rows — studios run multiple chairs concurrently. A per-studio capacity limit is a documented later-phase knob.

**`projects`** — multi-session container: `request_id`, `customer_id`, `artist_id`, `studio_id`, `title`, `status` (`active` | `completed` | `cancelled` | `paused`), `estimated_sessions`, `notes`. Sessions are `appointments.type = 'session'` rows pointing at `project_id`.

**`flash_items`** — `artist_id`, `title`, `image_url`, `price_cents`, `deposit_cents`, `duration_min`, `active`, `one_off` boolean (one-off pieces deactivate after first confirmed booking).

**`booking_events`** — append-only audit: `appointment_id` / `request_id` (nullable), `actor_id`, `actor_role`, `event_type`, `data` jsonb, `created_at`. Written server-side only.

**`notifications`** — in-app bell: `user_id`, `kind`, `payload` jsonb, `read_at`. Doubles as the outbox for future email/SMS reminders.

**Front desk grant** — new column on existing `public.affiliations` (the artist-studio join from migration 006): `manage_bookings boolean default false`, granted by the artist. Studio owners always get read-only roster visibility (any active affiliation); write access requires the grant. (`studio_connections` is the sealed OAuth token table and is unrelated.)

**Offline customers** — `appointments.customer_id` is nullable with a `customer_name` text fallback, so front-desk quick-add works for phone/walk-in customers who have no platform account.

### State Machines

**Request:** `pending` → `accepted` | `declined` (artist) | `withdrawn` (customer) | `expired` (cron). On accept, the artist sets quote + deposit + scheduling mode. Customer then either taps a proposed time or books via the open-calendar slot picker → appointment created.

**Appointment:** born `pending_deposit` (deposit asked) or `confirmed` (no deposit). `pending_deposit` → `confirmed` on deposit paid / waived / manually marked received, or auto-`cancelled` when `hold_expires_at` passes. `confirmed` → `completed` | `no_show` | `cancelled`. Reschedule = update times + event log entry (exclusion constraint re-checks); not a new row.

**Deposit sub-state:** `not_required` | `pending` | `paid` | `waived` | `refund_due` | `refunded`. Transitions are idempotent guarded UPDATEs.

### Time

All timestamps `timestamptz`. Artist/studio timezone stored in settings, snapshotted onto each appointment. Slot math runs in UTC against the entity's IANA zone. UI renders the entity's zone and the viewer's local zone when they differ. DST transitions have explicit test coverage.

## Availability Engine

`lib/booking/availability.ts` — pure functions, no I/O:

```
computeOpenSlots({ rules, overrides, existingAppointments, settings, durationMin, range }) → Slot[]
```

Pipeline: weekly template → apply date overrides → subtract active appointments padded by `buffer_min` → enforce `min_notice_hours` and `max_horizon_days` → emit slots at `slot_granularity_min` that fit `durationMin`.

- Slots are **derived, never stored** — no materialized slot rows, nothing to go stale.
- A server route serves slots per entity + duration + date range.
- Booking a slot = server action inserting the appointment. Concurrent races resolve at the exclusion constraint; the loser gets a typed "slot just taken" error and refreshed slots. The database is the lock.
- The same engine serves flash booking, consult booking, and open-calendar custom scheduling.

**Housekeeping (pg_cron, Supabase-native):**
- Nightly: expire `pending` requests past `expires_at`.
- Hourly: cancel unpaid `pending_deposit` appointments past `hold_expires_at` (frees the slot).
- Hourly: re-verify stale `pending` deposit checkouts against the provider (webhook backstop).

## Deposits

`lib/booking/deposits/` — provider abstraction:

```ts
interface DepositProvider {
  createCheckoutLink(input: { amountCents: number; description: string; appointmentId: string; tokens: TokenSet }): Promise<{ url: string; checkoutId: string }>;
  verifyCheckout(checkoutId: string, tokens: TokenSet): Promise<"paid" | "open" | "expired">;
  parseWebhook(request: Request): Promise<DepositEvent[]>;
}
```

- **Stripe** — new `stripe` provider in the existing `OAuthProvider` registry using Connect **Standard** OAuth. Checkout Sessions are created on the connected account (`Stripe-Account` header); funds settle directly to the artist/studio; the platform takes no fee and holds nothing. One application-level webhook endpoint receives `checkout.session.completed` for all connected accounts.
- **Square** — reuses the existing Square OAuth + sealed-token infrastructure. Payment Links API for checkout. Application-level webhooks carry `merchant_id`.
- **No provider** — deposit ask still works; artist gets a "mark deposit received" button (manual confirm for Venmo/cash/in-person), appointment confirms on click.

**Trust model:** a success redirect is never proof of payment. `pending → paid` happens only via (1) signature-verified webhook or (2) server-side `verifyCheckout` when the customer lands back — whichever fires first; both idempotent. Cron sweep is the final backstop.

**Refunds v1:** recorded, not executed. Cancellations mark `refund_due` per the entity's cancellation policy and deep-link to the provider dashboard. API-executed refunds are a fast-follow.

## UX Surfaces

### Customer
- `BookingCTA` component rendered on artist profiles, published studio sites (new builder section), and basic profiles → routes to `/book/[entity]`.
- Booking stepper: **what** (consult / flash piece / custom request) → **details** → **time** (slot picker when applicable) → **review** → **deposit** (if asked) → confirmation. Custom requests skip the time step.
- Custom brief form: description, placement, size, color vs black & grey, budget range, reference photo upload (existing storage), timing flexibility.
- Customer dashboard: wire the existing mock appointments/requests/invoices sections to live data. Request detail shows quote + proposed times as tappable cards.

### Artist dashboard
- **Requests inbox** with badge count; detail view with Accept (quote, deposit, scheduling mode) / Decline (canned + custom reasons).
- **Calendar**: week/day views + upcoming list; appointment detail sheet with complete / no-show / cancel / reschedule.
- **Availability editor**: persist the existing weekly editor to `availability_rules`; add month view for overrides/blocked dates.
- **Booking settings**: flow toggles, consult config, deposit defaults, provider connect, policies.
- **Flash manager**: grid CRUD (image, price, duration, deposit, one-off flag).

### Studio dashboard
- Studio-level settings + availability (walk-ins, piercing).
- **Roster calendar**: color-per-artist overlay; read-only by default, actionable for artists who granted `manage_bookings`.
- **Front desk quick-add**: manual appointment creation for phone/walk-in customers.

### Messaging and notifications
- Accept/decline/schedule events post system lines into the existing customer-artist message thread; requests link to their thread.
- In-app notification bell reads `notifications`. Email/SMS reminders are a fast-follow; the table is already the outbox.

## Security

- All mutations are Server Actions validated with Zod (existing pattern, e.g. `app/help/contact/actions.ts`).
- `booking_events` written with service role from server actions only.
- RLS: customers row-scoped to own requests/appointments; artists to own; studio owners read studio rows + roster rows via affiliation, write roster rows only with `manage_bookings` grant.
- Webhook endpoints verify provider signatures; tokens remain sealed server-side per the existing integration pattern.
- Reference image uploads use existing owner-scoped storage policies.

## Testing

`scripts/check-booking.ts` following the `check-builder.ts` pattern:
- Availability engine: DST spring-forward/fall-back, buffer padding, split shifts, midnight-adjacent slots, min-notice and horizon boundaries, override precedence.
- State machines: legal/illegal transition matrix for requests, appointments, deposits.
- Slot race: exclusion-constraint error maps to the typed "slot just taken" error.
- Deposit idempotency: double webhook delivery results in one `paid` transition.

## Error Handling

Typed `BookingError` union surfaced as friendly messages: slot just taken, request expired, deposit link expired, hold expired, provider unlinked. Exclusion-constraint violations (`23P01`) map to the slot-taken error.

## Performance

- Slot computation is server-side per entity+day and cacheable; no client recomputation.
- Indexes: `appointments (artist_id, start_at)`, `appointments (studio_id, start_at)`, partial on active statuses; `booking_requests (artist_id, status)`, `(studio_id, status)`, `(customer_id)`.
- Server Components by default; client components only for the stepper, calendar, and editors.

## Build Phasing

Each phase is one implementation plan, shippable in order:

1. **Foundation** — migration 019, TypeScript types, availability engine + `check-booking.ts`, booking settings UI, availability persistence.
2. **Custom requests** — end-to-end: brief form → artist inbox → accept/decline → propose-times and open-calendar scheduling → appointment creation.
3. **Slot booking** — consultation booking, flash manager, flash booking through the shared slot picker.
4. **Deposits** — provider abstraction, Stripe Connect OAuth provider, Square reuse, webhook endpoints, verify-on-redirect, manual mark-paid, hold expiry.
5. **Projects + studio** — multi-session projects, front desk grant + quick-add, roster calendar, walk-in bookings.
6. **Polish** — notification bell, messaging system-lines, builder `BookingCTA` section, component-library entries, CLAUDE.md booking-section rewrite.

## Out of Scope (v1)

- Google Calendar two-way sync (schema-ready via `availability_overrides.source`; future `busy_blocks` table).
- API-executed refunds (recorded as `refund_due` only).
- Email/SMS reminders (notifications table is the outbox).
- Studio chair-capacity limits for concurrent walk-ins.
- Platform fees on deposits (explicitly: the platform never touches funds in v1).
- AI-assisted brief triage, waitlists, recurring appointments.

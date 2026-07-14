# Booking Mode Choice + Dynamic CTAs Design

**Date:** 2026-07-14
**Status:** Approved
**Extends:** `2026-07-14-booking-system-design.md`

## Summary

Booking stops being silently on. Artists and studios explicitly choose how they take bookings — the inbuilt system, an external tool they already use (link-out), or not at all — and every customer-facing surface adapts: pages show "Book" into `/book/[id]`, "Book on <domain>" out to their external tool, or "Get in touch" into messaging. Never a dead or misleading button.

## Tiering decision (researched, deferred)

Competitive research (Square Appointments free-core model, Fresha's marketplace-fee model, Booksy's optional 30% Boost, Porter/InkBook at $29-65/mo with deposits included) and freemium studies (hybrid usage+feature gating ~5.7% conversion vs ~2.1% feature-only; gate after value, never before activation) support keeping core booking free on a discovery marketplace whose moat is booking liquidity.

**Decision (Tanner, 2026-07-14): no fees and no tier gates for now — the entire booking system is free on Liner, Shader, and Magnum.** Verified for later: Stripe/Square charge the platform nothing (artists pay their own processing); both support a platform cut when wanted (Stripe `application_fee_amount` on Standard-account direct charges; Square `checkout_options.app_fee_money`, requires adding the `PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS` scope). Candidate future levers, in the order research supports: per-deposit platform fee on lower tiers, reminders/no-show automation as a paid tier, flash-drop volume, front-desk/team seats, analytics.

## Data model (migration 022)

- `booking_settings.booking_mode text check (booking_mode in ('inbuilt','external','off'))` — **nullable; null = not yet chosen** (drives the prompt).
- `booking_settings.external_booking_url text` — https URL of their external booking page.
- Backfill: existing `booking_settings` rows get `booking_mode = 'inbuilt'` (those artists configured booking deliberately). No row, or null mode → the prompt shows.

## The choice (never silently on)

**BookingModePrompt** — a dashboard card (artist and studio dashboards) rendered while mode is unchosen:
- "Use Inked booking" → mode `inbuilt`, opens Booking Settings.
- "I use another tool" → https URL input (prefilled from a connected Calendly/Square integration's `linkUrl` when available) → mode `external`.
- "Not now" → mode `off`; the card disappears; changeable any time in Booking Settings.

**Booking Settings panel** gains a mode selector at the top ("Inked booking" / "External link" / "Off"). External mode shows the URL field and hides the flow/deposit/scheduling sections (they're irrelevant); `off` hides them too.

**Server action** `setBookingMode({ mode, externalUrl? })`: entity-resolved, Zod-validated (`external` requires a valid `https://` URL; hostname extracted for display), upserts settings.

## Dynamic CTA resolution

One pure, checked resolver in `lib/booking/flows.ts`:

```
bookingCtaFor({ mode, acceptingBookings, flows, externalUrl }) →
  { kind: "inbuilt" }                        // mode=inbuilt AND accepting AND >=1 flow enabled
| { kind: "external", url, domain }          // mode=external AND valid https url
| { kind: "message" }                        // everything else — including null/off
```

Applied everywhere a booking affordance renders:

| Surface | inbuilt | external | message |
|---|---|---|---|
| Artist profile CTA row | "Book Consultation"/"Book a Date" → `/book/[id]` (as today) | "Book on {domain}" anchor (`target=_blank rel="noopener noreferrer nofollow"`), Message button unchanged | Primary becomes "Get in touch" → `/messages` |
| `/book/[id]` page | booking flow (as today) | hand-off card: "{Artist} books through {domain}" + external link (no silent redirect) | existing "not taking bookings" copy |
| Studio-site artist strips (`bookHref`) | `/book/[id]` | the external URL (strip renders absolute URLs as `<a target=_blank>`) | no Book link |
| Studio basic profile | (roster links to artist profiles, which resolve) | studio-level external URL renders a "Book" action | nothing |

**Server-side enforcement** (not just cosmetics): `submitBookingRequest`, `bookConsultation`, and `bookFlash` reject when the target's `booking_mode !== 'inbuilt'` — the same "not taking requests/bookings" errors already used. A crafted POST cannot book someone who chose external/off.

Roster `bookHref` population: the two studio-site mappers + the live-content hook batch-fetch `booking_settings (artist_id, booking_mode, accepting_bookings, flow toggles, external_booking_url)` for roster artist ids in one query and run the resolver per artist.

## Out of scope

- Tier gating / platform fees (deferred by decision above).
- Auto-importing availability from external tools.
- Messaging deep-link to a specific artist thread ("Get in touch" lands on `/messages`).

## Testing

`scripts/check-booking.ts`: resolver matrix (inbuilt happy path; inbuilt but not accepting → message; external with/without valid URL; null/off → message), mode schema validation (external requires https URL; http rejected).

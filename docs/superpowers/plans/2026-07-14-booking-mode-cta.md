# Booking Mode Choice + Dynamic CTAs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Booking becomes an explicit choice (inbuilt / external link / off, prompted once) and every customer-facing surface resolves its CTA through one pure function — Book, Book-on-domain, or Get in touch, never a dead button.

**Architecture:** Migration 022 adds nullable `booking_mode` + `external_booking_url` to `booking_settings` (null drives the prompt; existing rows backfill `inbuilt`). `bookingCtaFor` in `lib/booking/flows.ts` is the single resolver, checked in `scripts/check-booking.ts`, consumed by the artist profile page, `/book/[id]`, the studio-site mappers (batched settings fetch), and the basic profile. The three booking server actions gain a `booking_mode === 'inbuilt'` guard so the rule has server-side teeth.

**Tech Stack:** Established. No new dependencies, no new tables.

## Global Constraints

- Supabase `cktvpfenygxhfaodihbz`; migrations via `supabase db push`. No `npm run dev`/`build`. No emoji. No AI attribution.
- Verification: `npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint` (baselines: 40+44 checks, 17 pre-existing lint errors). `noUncheckedIndexedAccess`; ternaries for conditional JSX; inline-IIFE effects.
- External URLs: `https://` only, rendered with `target="_blank" rel="noopener noreferrer nofollow"`.
- `check-builder.ts` must stay at 44 — studio-site changes are additive-optional.

---

### Task 1: Migration 022 + types + resolver (TDD)

**Files:**
- Create: `supabase/migrations/022_booking_mode.sql`
- Modify: `lib/types/booking.ts` (`BookingMode`, settings fields), `lib/supabase/booking-types.ts` (Db columns + mapper + `SETTINGS_COLUMN`), `lib/validation/schemas.ts` (`SetBookingModeSchema`), `lib/booking/flows.ts` (`bookingCtaFor`), `scripts/check-booking.ts` (+3 checks → 43)

**Interfaces (produces):**
- `BookingMode = "inbuilt" | "external" | "off"`; `BookingSettings`/`BookingSettingsInput` gain `bookingMode: BookingMode | null`, `externalBookingUrl: string | null` (defaults: both null).
- `SetBookingModeSchema`: `{ mode: enum, externalUrl?: string url https-only }` + superRefine: `external` requires `externalUrl`.
- `BookingCta = { kind: "inbuilt" } | { kind: "external"; url: string; domain: string } | { kind: "message" }`
- `bookingCtaFor(s: { bookingMode; acceptingBookings; customRequestsEnabled; consultationsEnabled; flashEnabled; externalBookingUrl } | null): BookingCta`

- [ ] **Step 1: Migration**

```sql
-- Booking mode: explicit choice between inbuilt, external link-out, or off.
-- NULL = not yet chosen (drives the dashboard prompt).
-- Spec: docs/superpowers/specs/2026-07-14-booking-mode-dynamic-cta-design.md
alter table public.booking_settings
  add column if not exists booking_mode text
  check (booking_mode is null or booking_mode in ('inbuilt','external','off'));
alter table public.booking_settings
  add column if not exists external_booking_url text;

-- Existing rows were configured deliberately during the pre-mode era.
update public.booking_settings set booking_mode = 'inbuilt' where booking_mode is null;
```

Push via `supabase db push` (dry-run first; only 022).

- [ ] **Step 2: Failing checks** (append before final log)

```ts
// ─── booking mode + CTA resolver ─────────────────────────────────────────
import { bookingCtaFor } from "../lib/booking/flows";
import { SetBookingModeSchema } from "../lib/validation/schemas";

check("bookingCtaFor resolves inbuilt, external, and message", () => {
  const base = {
    bookingMode: "inbuilt" as const,
    acceptingBookings: true,
    customRequestsEnabled: true,
    consultationsEnabled: false,
    flashEnabled: false,
    externalBookingUrl: null,
  };
  assert.deepEqual(bookingCtaFor(base), { kind: "inbuilt" });
  assert.deepEqual(bookingCtaFor({ ...base, acceptingBookings: false }), { kind: "message" });
  assert.deepEqual(
    bookingCtaFor({ ...base, customRequestsEnabled: false }),
    { kind: "message" } // inbuilt but zero flows enabled
  );
  const ext = bookingCtaFor({
    ...base,
    bookingMode: "external",
    externalBookingUrl: "https://calendly.com/mar-ink",
  });
  assert.deepEqual(ext, { kind: "external", url: "https://calendly.com/mar-ink", domain: "calendly.com" });
  assert.deepEqual(
    bookingCtaFor({ ...base, bookingMode: "external", externalBookingUrl: null }),
    { kind: "message" }
  );
  assert.deepEqual(bookingCtaFor({ ...base, bookingMode: "off" }), { kind: "message" });
  assert.deepEqual(bookingCtaFor(null), { kind: "message" });
});

check("bookingCtaFor: unchosen mode (null) never shows booking", () => {
  assert.deepEqual(
    bookingCtaFor({
      bookingMode: null,
      acceptingBookings: true,
      customRequestsEnabled: true,
      consultationsEnabled: true,
      flashEnabled: true,
      externalBookingUrl: null,
    }),
    { kind: "message" }
  );
});

check("SetBookingModeSchema requires https url for external", () => {
  assert.ok(SetBookingModeSchema.safeParse({ mode: "inbuilt" }).success);
  assert.ok(SetBookingModeSchema.safeParse({ mode: "off" }).success);
  assert.ok(
    SetBookingModeSchema.safeParse({ mode: "external", externalUrl: "https://squareup.com/book/x" }).success
  );
  assert.ok(!SetBookingModeSchema.safeParse({ mode: "external" }).success);
  assert.ok(
    !SetBookingModeSchema.safeParse({ mode: "external", externalUrl: "http://insecure.com" }).success
  );
});
```

- [ ] **Step 3: Implement.** `flows.ts` addition:

```ts
export type BookingCta =
  | { kind: "inbuilt" }
  | { kind: "external"; url: string; domain: string }
  | { kind: "message" };

/** The one CTA resolver: what a customer-facing surface should show. */
export function bookingCtaFor(
  s: {
    bookingMode: "inbuilt" | "external" | "off" | null;
    acceptingBookings: boolean;
    customRequestsEnabled: boolean;
    consultationsEnabled: boolean;
    flashEnabled: boolean;
    externalBookingUrl: string | null;
  } | null
): BookingCta {
  if (!s) return { kind: "message" };
  if (s.bookingMode === "inbuilt" && s.acceptingBookings && enabledBookingFlows(s).length > 0) {
    return { kind: "inbuilt" };
  }
  if (s.bookingMode === "external" && s.externalBookingUrl?.startsWith("https://")) {
    try {
      return {
        kind: "external",
        url: s.externalBookingUrl,
        domain: new URL(s.externalBookingUrl).hostname.replace(/^www\./, ""),
      };
    } catch {
      return { kind: "message" };
    }
  }
  return { kind: "message" };
}
```

Schema (schemas.ts):

```ts
export const SetBookingModeSchema = z
  .object({
    mode: z.enum(["inbuilt", "external", "off"]),
    externalUrl: z.string().trim().url().startsWith("https://").max(500).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.mode === "external" && !d.externalUrl) {
      ctx.addIssue({ code: "custom", message: "Paste your booking link" });
    }
  });
export type SetBookingModeInput = z.infer<typeof SetBookingModeSchema>;
```

Types: add `BookingMode` + two fields to `BookingSettings`, `BookingSettingsInput` (Omit picks them up automatically), `DEFAULT_BOOKING_SETTINGS` gets `bookingMode: null, externalBookingUrl: null`. Mapper: `DbBookingSettings` gains `booking_mode: BookingMode | null`, `external_booking_url: string | null`; `mapDbBookingSettings` maps both; `SETTINGS_COLUMN` gains `bookingMode: "booking_mode"`, `externalBookingUrl: "external_booking_url"`.

- [ ] **Step 4:** `43 checks passed`, tsc clean. Commit `feat(booking): booking mode column, schema, and CTA resolver`.

---

### Task 2: setBookingMode action + server enforcement

**Files:**
- Modify: `app/book/actions.ts`

**Behavior:**
- New `setBookingMode(input: unknown)`: parse `SetBookingModeSchema`; `requireUser`; `resolveBookingEntity` (import from supabase-booking, pass the user-scoped client) — no entity → error; `saveBookingSettings(supabase, entity, { bookingMode: d.mode, externalBookingUrl: d.mode === "external" ? d.externalUrl ?? null : null })`. Returns `{ success, error? }`.
- Enforcement: `submitBookingRequest`'s settings select adds `booking_mode` and rejects unless `booking_mode === 'inbuilt'` (same "not taking requests" error). `bookConsultation` and `bookFlash` already map full settings — add `settings.bookingMode !== "inbuilt"` to their existing rejection conditions.

- [ ] **Steps:** implement, `43 checks` + tsc, commit `feat(booking): booking mode action and server-side enforcement`.

---

### Task 3: Mode prompt card + settings mode selector

**Files:**
- Create: `components/booking/booking-mode-prompt.tsx`
- Modify: `components/booking/use-booking-settings.ts` (expose `bookingModeChosen` + integration prefill), `components/booking/booking-settings-panel.tsx` (mode selector at top; external/off hide flow+deposit+scheduling sections), `components/booking/index.tsx`, `components/dashboard/artist/artist-dashboard.tsx` + `components/dashboard/studio/studio-dashboard.tsx` (render prompt at top of rightColumn)

**Behavior:**
- Prompt card (self-contained hook inside): resolves entity + fetches settings (inline-IIFE); renders ONLY when entity exists and (`no settings row` OR `bookingMode === null`). Three actions: "Use Inked booking" → `setBookingMode({mode:"inbuilt"})` then hide + fire optional `onOpenSettings` prop (dashboards pass their `setBookingSettingsOpen(true)`); "I use another tool" → expands an https URL input (prefill: fetch the entity's studio `integrations` projection is studio-only — for artists skip prefill; for studios read `studios.integrations.calendly.linkUrl ?? integrations.square.linkUrl` via one select) with Save → `setBookingMode({mode:"external", externalUrl})`; "Not now" → `setBookingMode({mode:"off"})`. Card chrome mirrors `PendingDepositBanner` (dashed rust border) with `FieldLabel` + copy "How do you want to take bookings? This controls the Book button on your public page."
- Settings panel: new SelectRow "Bookings" at top — options Inked booking / External link / Off, value `settings.bookingMode ?? ""` with a "Choose..." placeholder option when null; changing calls `update("bookingMode", v)`. When `external`: show an https URL input bound to `externalBookingUrl` and HIDE the flow toggles, consult config, deposits section, and scheduling knobs (timezone + cancellation stay hidden too — irrelevant). When `off`: hide the same. `inbuilt`: current panel unchanged. Save button always visible (it already persists the whole settings object — now including mode fields).

- [ ] **Steps:** implement, tsc + lint scoped, commit `feat(booking): booking mode prompt and settings selector`.

---

### Task 4: Dynamic CTAs on every surface

**Files:**
- Modify: `app/artists/[id]/page.tsx` (fetch settings when `fromDb`; resolver drives the two CTA spots)
- Modify: `app/book/[id]/page.tsx` + `components/booking/booking-flow.tsx` (external hand-off card; off/null → existing not-taking copy)
- Modify: `lib/data/studio-page.ts` + `lib/hooks/use-studio-live-content.ts` (batch settings fetch → resolver-driven `bookHref`; mock-artist path drops `bookHref`)
- Modify: `components/builder/preview/artist-strips-section.tsx` (absolute `bookHref` renders `<a target="_blank" rel="noopener noreferrer nofollow">`)
- Modify: `components/studio-site/studio-profile-basic.tsx` + its render site (studio-level external "Book" action when the studio's own settings resolve external — read the render site first: `app/studios/[id]/page.tsx`)

**Behavior contract:**
1. Artist page: `fetchBookingSettings` alongside the artist fetch (db path only); `const cta = bookingCtaFor(settings)`. `inbuilt` → both Book buttons as today. `external` → both become `<a href={cta.url} target="_blank" rel="noopener noreferrer nofollow">` styled via the same Button `as="a"` polymorphic pattern, labels "Book on {cta.domain}". `message` → single primary `as={Link} href="/messages"` labeled "Get in touch" (calendar widget's button too).
2. `/book/[id]`: pass `cta` into `BookingFlow` as a new prop `cta: BookingCta`. `external` → hand-off card: "{artistName} takes bookings on {domain}" + external anchor button "Open {domain}". `message` → existing "not taking bookings" copy. `inbuilt` → current chooser. (Keep the existing `settings`/`flashItems` props; `enabledBookingFlows` logic inside remains for the inbuilt case.)
3. Studio-site mappers: after roster rows resolve, one `booking_settings` select `in ("artist_id", ids)` (public-read RLS) → map per artist: `cta.kind === "inbuilt"` → `/book/{id}`; `external` → `cta.url`; `message` → undefined. Fetch columns: `artist_id, booking_mode, accepting_bookings, custom_requests_enabled, consultations_enabled, flash_enabled, external_booking_url`; run rows through `mapDbBookingSettings`-lite (a tiny local pick — or select `*` and use the real mapper; use `*` + real mapper, DRY).
4. Strip component: `const isExternal = artist.bookHref?.startsWith("http")` → `<a href target="_blank" rel="noopener noreferrer nofollow">` else `<Link>` (both existing styles).
5. Basic profile: the artist-row Link-wrap stays; add studio-level: the page fetches the STUDIO's booking settings, and when its cta is `external`, `StudioProfileBasic` receives `bookingCta` prop and renders a "Book" action anchor in its header/action area (read the component to place with the grain).

- [ ] **Steps:** implement each surface, run `npx tsx scripts/check-builder.ts` (44) after mapper edits, tsc + lint, commit `feat(booking): dynamic booking CTAs across artist and studio surfaces`.

---

### Task 5: Sweep + smoke + docs sync

- [ ] **Step 1:** Full run — 43 booking + 44 builder, tsc clean, 17-error lint baseline.
- [ ] **Step 2:** Service-role smoke: backfilled row reads `booking_mode='inbuilt'`; set a throwaway artist's settings to `external` → verify `submitBookingRequest`-shape guard data (settings row) would reject (assert on the row values feeding the guard); null-mode artist row → resolver returns message (pure, already checked) — DB smoke covers column + backfill + constraint (bad mode value rejected by CHECK).
- [ ] **Step 3:** Update `docs/booking-launch-checklist.md` verification tour: add "choose booking mode" as the first artist-setup step + external-mode CTA check. Update project memory. Commit.

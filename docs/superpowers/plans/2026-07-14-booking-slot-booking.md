# Booking Phase 3 (Slot Booking) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship direct slot booking: consultations and flash pieces bookable Calendly-style through the shared slot picker, an artist flash manager, a multi-flow chooser on `/book/[id]`, and a live Upcoming card on the artist dashboard.

**Architecture:** The Phase 2 server-side slot recomputation is extracted into one shared server module (`lib/booking/server-slots.ts`) consumed by the slots API route, `scheduleFromRequest`, and the two new actions (`bookConsultation`, `bookFlash`). Flash one-off pieces use an atomic claim protocol (deactivate-before-insert with compensating reactivation on `23P01`) via the admin client, since customers cannot update `flash_items` under RLS. No new migration — `flash_items` shipped in 019.

**Tech Stack:** Same as Phases 1-2. No new dependencies. Flash images reuse the `booking-refs` bucket + `uploadBookingReference` (authenticated own-folder writes, public read).

## Global Constraints

- Supabase project `cktvpfenygxhfaodihbz` ONLY; migrations via `supabase db push` (none needed this phase).
- No emoji in code. No AI attribution in commits. Do NOT run `npm run dev`/`build`.
- Verification loop: `npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint`. `noUncheckedIndexedAccess` is on.
- Lint gotchas: ternaries not `&&` for conditional JSX; effects use the inline-IIFE-with-cancellation pattern, never a callback invocation.
- Server Components by default; money = integer cents; timestamps = ISO UTC strings.
- Every transition carries its expected prior state in the WHERE clause; `23P01` maps to the friendly slot-taken error.
- `Input`/`Textarea` primitives require a `label` prop. `Button` links use `as={Link} href=...`.

---

### Task 1: Flash domain type, schemas, flow predicate

**Files:**
- Modify: `lib/types/booking.ts` (append `FlashItem`)
- Modify: `lib/validation/schemas.ts` (append `BookConsultationSchema`, `BookFlashSchema`)
- Create: `lib/booking/flows.ts` (`enabledBookingFlows`)
- Modify: `lib/supabase/booking-types.ts` (append `DbFlashItem`, `mapDbFlashItem`)
- Modify: `scripts/check-booking.ts` (append 3 checks)

**Interfaces:**
- Produces:
  - `FlashItem { id; artistId; title; imageUrl; priceCents; depositCents; durationMin; active; oneOff }`
  - `BookConsultationSchema` → `{ artistId: uuid; startAt: iso; endAt: iso }`; `BookFlashSchema` → `{ flashItemId: uuid; startAt: iso; endAt: iso }` (+ inferred `BookConsultationInput`, `BookFlashInput`)
  - `enabledBookingFlows(s): BookingFlowKind[]` where `BookingFlowKind = "custom" | "consultation" | "flash"` — empty when `!acceptingBookings`
  - `DbFlashItem` row interface, `mapDbFlashItem(row): FlashItem`

- [ ] **Step 1: Append failing checks to `scripts/check-booking.ts`** (before final `console.log`)

```ts
// ─── phase 3: flash + flows ──────────────────────────────────────────────
import { BookConsultationSchema, BookFlashSchema } from "../lib/validation/schemas";
import { enabledBookingFlows } from "../lib/booking/flows";
import { mapDbFlashItem, type DbFlashItem } from "../lib/supabase/booking-types";

check("direct-booking schemas validate ids and datetimes", () => {
  const uuid = "6f9619ff-8b86-4d01-b42d-00c04fc964ff";
  const times = { startAt: "2026-08-01T17:00:00Z", endAt: "2026-08-01T17:30:00Z" };
  assert.ok(BookConsultationSchema.safeParse({ artistId: uuid, ...times }).success);
  assert.ok(!BookConsultationSchema.safeParse({ artistId: "nope", ...times }).success);
  assert.ok(BookFlashSchema.safeParse({ flashItemId: uuid, ...times }).success);
  assert.ok(!BookFlashSchema.safeParse({ flashItemId: uuid, startAt: "tomorrow", endAt: times.endAt }).success);
});

check("enabledBookingFlows respects master switch and per-flow toggles", () => {
  const base = {
    acceptingBookings: true,
    customRequestsEnabled: true,
    consultationsEnabled: false,
    flashEnabled: true,
  };
  assert.deepEqual(enabledBookingFlows(base), ["custom", "flash"]);
  assert.deepEqual(enabledBookingFlows({ ...base, acceptingBookings: false }), []);
  assert.deepEqual(
    enabledBookingFlows({ ...base, consultationsEnabled: true, customRequestsEnabled: false }),
    ["consultation", "flash"]
  );
});

const DB_FLASH: DbFlashItem = {
  id: "f1", artist_id: "a1", title: "Snake and dagger", image_url: "https://x/f.webp",
  price_cents: 25000, deposit_cents: 5000, duration_min: 120,
  active: true, one_off: true, created_at: "2026-07-14", updated_at: "2026-07-14",
};

check("flash item maps db->domain", () => {
  const f = mapDbFlashItem(DB_FLASH);
  assert.equal(f.artistId, "a1");
  assert.equal(f.priceCents, 25000);
  assert.equal(f.oneOff, true);
});
```

- [ ] **Step 2: Run to verify failure** — `npx tsx scripts/check-booking.ts` → FAIL (`BookConsultationSchema` not exported).

- [ ] **Step 3: Implement**

`lib/types/booking.ts` (append):

```ts
export interface FlashItem {
  id: string;
  artistId: string;
  title: string;
  imageUrl: string;
  priceCents: number;
  depositCents: number;
  durationMin: number;
  active: boolean;
  oneOff: boolean;
}
```

`lib/validation/schemas.ts` (append; `isoDatetime` already defined):

```ts
export const BookConsultationSchema = z.object({
  artistId: z.string().uuid(),
  startAt: isoDatetime,
  endAt: isoDatetime,
});
export type BookConsultationInput = z.infer<typeof BookConsultationSchema>;

export const BookFlashSchema = z.object({
  flashItemId: z.string().uuid(),
  startAt: isoDatetime,
  endAt: isoDatetime,
});
export type BookFlashInput = z.infer<typeof BookFlashSchema>;
```

`lib/booking/flows.ts`:

```ts
/** Which booking flows an entity currently offers — drives the /book chooser. */
export type BookingFlowKind = "custom" | "consultation" | "flash";

export function enabledBookingFlows(s: {
  acceptingBookings: boolean;
  customRequestsEnabled: boolean;
  consultationsEnabled: boolean;
  flashEnabled: boolean;
}): BookingFlowKind[] {
  if (!s.acceptingBookings) return [];
  const flows: BookingFlowKind[] = [];
  if (s.customRequestsEnabled) flows.push("custom");
  if (s.consultationsEnabled) flows.push("consultation");
  if (s.flashEnabled) flows.push("flash");
  return flows;
}
```

`lib/supabase/booking-types.ts` (append; add `FlashItem` to the type import):

```ts
export interface DbFlashItem {
  id: string;
  artist_id: string;
  title: string;
  image_url: string;
  price_cents: number;
  deposit_cents: number;
  duration_min: number;
  active: boolean;
  one_off: boolean;
  created_at: string;
  updated_at: string;
}

export function mapDbFlashItem(row: DbFlashItem): FlashItem {
  return {
    id: row.id,
    artistId: row.artist_id,
    title: row.title,
    imageUrl: row.image_url,
    priceCents: row.price_cents,
    depositCents: row.deposit_cents,
    durationMin: row.duration_min,
    active: row.active,
    oneOff: row.one_off,
  };
}
```

- [ ] **Step 4: Verify** — `npx tsx scripts/check-booking.ts` → `32 checks passed`; `npx tsc --noEmit` clean.

- [ ] **Step 5: Commit**

```bash
git add lib/types/booking.ts lib/validation/schemas.ts lib/booking/flows.ts lib/supabase/booking-types.ts scripts/check-booking.ts
git commit -m "feat(booking): flash item type, direct-booking schemas, flow predicate"
```

---

### Task 2: Shared server-side slot computation (DRY extraction)

**Files:**
- Create: `lib/booking/server-slots.ts`
- Modify: `app/api/booking/slots/route.ts` (use shared function)
- Modify: `app/book/actions.ts` (`scheduleFromRequest` uses shared function)

**Interfaces:**
- Produces:
  - `computeArtistSlotsRange(admin: SupabaseClient, input: { artistId: string; durationMin: number; fromDate: string; toDate: string; now?: Date }): Promise<{ slots: Slot[]; timezone: string; settings: BookingSettings } | null>` — null when no settings row; empty slots array when not accepting.
  - `localDateOf(iso: string, timeZone: string): string` — "YYYY-MM-DD" of an instant in a zone (moved out of `scheduleFromRequest`).

The route keeps its request parsing and response shape; the actions keep their validation flow — only the fetch+compute core moves. This is a behavior-preserving refactor: all 32 checks must still pass and the route's response shape must not change.

- [ ] **Step 1: Implement `lib/booking/server-slots.ts`**

```ts
/**
 * Server-only slot computation: fetches settings/rules/overrides/busy with
 * the ADMIN client (appointments are RLS-protected) and returns derived
 * slots. Callers must never expose the busy intervals — only the slots.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeOpenSlots, type Slot } from "./availability";
import { zonedParts } from "./tz";
import type { BookingSettings } from "@/lib/types/booking";
import {
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingSettings,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingSettings,
} from "@/lib/supabase/booking-types";

/** "YYYY-MM-DD" wall-clock date of an instant in a zone. */
export function localDateOf(iso: string, timeZone: string): string {
  const p = zonedParts(new Date(iso), timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export async function computeArtistSlotsRange(
  admin: SupabaseClient,
  input: { artistId: string; durationMin: number; fromDate: string; toDate: string; now?: Date }
): Promise<{ slots: Slot[]; timezone: string; settings: BookingSettings } | null> {
  const { artistId, durationMin, fromDate, toDate } = input;
  const now = input.now ?? new Date();

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", artistId)
    .maybeSingle();
  if (!settingsRow) return null;
  const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
  if (!settings.acceptingBookings) {
    return { slots: [], timezone: settings.timezone, settings };
  }

  const [rulesRes, overridesRes, busyRes] = await Promise.all([
    admin.from("availability_rules").select("*").eq("artist_id", artistId),
    admin
      .from("availability_overrides")
      .select("*")
      .eq("artist_id", artistId)
      .gte("date", fromDate)
      .lte("date", toDate),
    // Active appointments overlapping the window: end after window start AND
    // start before window end (day-padded for timezone edges).
    admin
      .from("appointments")
      .select("start_at, end_at")
      .eq("artist_id", artistId)
      .in("status", ["pending_deposit", "confirmed"])
      .gte("end_at", `${fromDate}T00:00:00Z`)
      .lte("start_at", `${toDate}T23:59:59Z`),
  ]);

  const slots = computeOpenSlots({
    rules: ((rulesRes.data ?? []) as DbAvailabilityRule[]).map(mapDbAvailabilityRule),
    overrides: ((overridesRes.data ?? []) as DbAvailabilityOverride[]).map(mapDbAvailabilityOverride),
    busy: ((busyRes.data ?? []) as { start_at: string; end_at: string }[]).map((b) => ({
      startAt: b.start_at,
      endAt: b.end_at,
    })),
    settings: {
      timezone: settings.timezone,
      slotGranularityMin: settings.slotGranularityMin,
      bufferMin: settings.bufferMin,
      minNoticeHours: settings.minNoticeHours,
      maxHorizonDays: settings.maxHorizonDays,
    },
    durationMin,
    fromDate,
    toDate,
    now,
  });

  return { slots, timezone: settings.timezone, settings };
}
```

- [ ] **Step 2: Refactor the route** — `app/api/booking/slots/route.ts` becomes:

```ts
import { NextResponse } from "next/server";
import { SlotsQuerySchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeArtistSlotsRange } from "@/lib/booking/server-slots";

/** Open slots for an artist — returns derived slots only, never busy data. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = SlotsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { artistId, durationMin, from, to } = parsed.data;

  const result = await computeArtistSlotsRange(createAdminClient(), {
    artistId,
    durationMin,
    fromDate: from,
    toDate: to,
  });
  if (!result) return NextResponse.json({ slots: [], timezone: "America/New_York" });
  return NextResponse.json({ slots: result.slots, timezone: result.timezone });
}
```

- [ ] **Step 3: Refactor `scheduleFromRequest`** — the local date needs the timezone, which needs the settings row, so keep the existing single settings fetch (admin) for the timezone, then delegate the recomputation. Replace the inline rules/overrides/busy fetch + `computeOpenSlots` block with:

```ts
  if (request.schedulingMode === "open_calendar") {
    if (!settingsRow) {
      return { success: false, error: "This artist has no availability set up." };
    }
    const localDate = localDateOf(chosen.startAt, timezone);
    const range = await computeArtistSlotsRange(admin, {
      artistId: request.artistId,
      durationMin: request.sessionDurationMin ?? 180,
      fromDate: localDate,
      toDate: localDate,
      now,
    });
    openSlots = range?.slots ?? [];
  }
```

(`timezone` is already assigned from `settingsRow` immediately above, exactly as today; the propose-mode branch is untouched. Yes, this re-fetches the settings row once inside `computeArtistSlotsRange` — one extra indexed single-row read in exchange for one shared code path; accept it.) Remove the now-unused imports from `app/book/actions.ts` (`computeOpenSlots`, `zonedParts`, `mapDbAvailabilityRule`, `mapDbAvailabilityOverride`, `DbAvailabilityRule`, `DbAvailabilityOverride`) and add `computeArtistSlotsRange`, `localDateOf`.

- [ ] **Step 4: Verify behavior preserved**

Run: `npx tsx scripts/check-booking.ts && npx tsc --noEmit && npm run lint`
Expected: 32 checks, tsc clean, no new lint findings in touched files.

- [ ] **Step 5: Commit**

```bash
git add lib/booking/server-slots.ts app/api/booking/slots/route.ts app/book/actions.ts
git commit -m "refactor(booking): shared server-side slot computation"
```

---

### Task 3: Flash data access

**Files:**
- Modify: `lib/data/supabase-booking.ts` (append)

**Interfaces:**
- Produces (Tasks 4-6):
  - `fetchActiveFlashItems(supabase, artistId): Promise<FlashItem[]>` (public read path)
  - `fetchOwnFlashItems(supabase, artistId): Promise<FlashItem[]>` (includes inactive; RLS owner read)
  - `insertFlashItem(supabase, artistId, input: { title; imageUrl; priceCents; depositCents; durationMin; oneOff }): Promise<FlashItem>`
  - `setFlashItemActive(supabase, id, active): Promise<void>`
  - `deleteFlashItem(supabase, id): Promise<void>`
  - `fetchArtistUpcomingAppointments(supabase, artistId, limit = 5): Promise<AppointmentRecord[]>`

- [ ] **Step 1: Append to `lib/data/supabase-booking.ts`** (extend booking-types import with `DbFlashItem`, `mapDbFlashItem`; extend types import with `FlashItem`)

```ts
// ─── Phase 3: flash + direct booking ──────────────────────────────────────

export async function fetchActiveFlashItems(
  supabase: SupabaseClient,
  artistId: string
): Promise<FlashItem[]> {
  const { data } = await supabase
    .from("flash_items")
    .select("*")
    .eq("artist_id", artistId)
    .eq("active", true)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbFlashItem[]).map(mapDbFlashItem);
}

export async function fetchOwnFlashItems(
  supabase: SupabaseClient,
  artistId: string
): Promise<FlashItem[]> {
  const { data } = await supabase
    .from("flash_items")
    .select("*")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbFlashItem[]).map(mapDbFlashItem);
}

export async function insertFlashItem(
  supabase: SupabaseClient,
  artistId: string,
  input: {
    title: string;
    imageUrl: string;
    priceCents: number;
    depositCents: number;
    durationMin: number;
    oneOff: boolean;
  }
): Promise<FlashItem> {
  const { data, error } = await supabase
    .from("flash_items")
    .insert({
      artist_id: artistId,
      title: input.title,
      image_url: input.imageUrl,
      price_cents: input.priceCents,
      deposit_cents: input.depositCents,
      duration_min: input.durationMin,
      one_off: input.oneOff,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to add flash: ${error.message}`);
  return mapDbFlashItem(data as DbFlashItem);
}

export async function setFlashItemActive(
  supabase: SupabaseClient,
  id: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase.from("flash_items").update({ active }).eq("id", id);
  if (error) throw new Error(`Failed to update flash: ${error.message}`);
}

export async function deleteFlashItem(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("flash_items").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete flash: ${error.message}`);
}

export async function fetchArtistUpcomingAppointments(
  supabase: SupabaseClient,
  artistId: string,
  limit = 5
): Promise<AppointmentRecord[]> {
  const { data } = await supabase
    .from("appointments")
    .select(REQUEST_SELECT)
    .eq("artist_id", artistId)
    .in("status", ["pending_deposit", "confirmed"])
    .gte("end_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(limit);
  return ((data ?? []) as DbAppointment[]).map(mapDbAppointment);
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit`

```bash
git add lib/data/supabase-booking.ts
git commit -m "feat(booking): flash and upcoming-appointments data access"
```

---

### Task 4: Direct-booking server actions

**Files:**
- Modify: `app/book/actions.ts` (append `bookConsultation`, `bookFlash`)

**Interfaces:**
- Consumes: Task 1 schemas, Task 2 `computeArtistSlotsRange`/`localDateOf`, `validateChosenTime`.
- Produces: `bookConsultation(input: unknown)`, `bookFlash(input: unknown)` → `Promise<{ success; appointmentId?; error? }>`.

**Correctness requirements (verify each is in the code before committing):**
1. Both actions re-derive the local date from the chosen start in the artist's timezone and recompute slots server-side; membership is exact-match via `validateChosenTime` with `mode: "open_calendar"`.
2. Consultation duration/price come from settings, never from the client.
3. Flash price/deposit/duration come from the item row, never from the client.
4. One-off claim protocol: `update flash_items set active=false where id=? and active=true` via ADMIN client (customers can't update under RLS) BEFORE the insert; zero rows → "just claimed" error; on insert failure the claim is reverted (compensating `active=true`).
5. Appointment insert uses the USER server client so RLS enforces `customer_id = auth.uid()`.
6. `23P01` → "That time was just taken — pick another."

- [ ] **Step 1: Append to `app/book/actions.ts`**

```ts
async function customerNameOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined
): Promise<string | null> {
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).maybeSingle();
  return profile?.name ?? email?.split("@")[0] ?? null;
}

export async function bookConsultation(
  input: unknown
): Promise<ActionResult & { appointmentId?: string }> {
  const parsed = BookConsultationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to book a consultation." };

  const admin = createAdminClient();
  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", parsed.data.artistId)
    .maybeSingle();
  if (!settingsRow) return { success: false, error: "This artist is not taking consultations." };
  const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
  if (!settings.acceptingBookings || !settings.consultationsEnabled) {
    return { success: false, error: "This artist is not taking consultations." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();
  const localDate = localDateOf(chosen.startAt, settings.timezone);
  const range = await computeArtistSlotsRange(admin, {
    artistId: parsed.data.artistId,
    durationMin: settings.consultDurationMin,
    fromDate: localDate,
    toDate: localDate,
    now,
  });
  const verdict = validateChosenTime({
    mode: "open_calendar",
    proposedTimes: [],
    openSlots: range?.slots ?? [],
    chosen,
    now,
  });
  if (!verdict.ok) return { success: false, error: verdict.error };

  const { data: created, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: user.id,
      customer_name: await customerNameOf(supabase, user.id, user.email),
      artist_id: parsed.data.artistId,
      type: "consultation",
      start_at: chosen.startAt,
      end_at: chosen.endAt,
      timezone: settings.timezone,
      status: "confirmed",
      price_cents: settings.consultPriceCents > 0 ? settings.consultPriceCents : null,
      deposit_cents: 0,
      deposit_status: "not_required",
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23P01") {
      return { success: false, error: "That time was just taken — pick another." };
    }
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true, appointmentId: created.id };
}

export async function bookFlash(
  input: unknown
): Promise<ActionResult & { appointmentId?: string }> {
  const parsed = BookFlashSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to book this piece." };

  const admin = createAdminClient();
  const { data: itemRow } = await admin
    .from("flash_items")
    .select("*")
    .eq("id", parsed.data.flashItemId)
    .maybeSingle();
  if (!itemRow) return { success: false, error: "This piece is no longer available." };
  const item = mapDbFlashItem(itemRow as DbFlashItem);
  if (!item.active) return { success: false, error: "This piece is no longer available." };

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", item.artistId)
    .maybeSingle();
  if (!settingsRow) return { success: false, error: "This artist is not taking flash bookings." };
  const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
  if (!settings.acceptingBookings || !settings.flashEnabled) {
    return { success: false, error: "This artist is not taking flash bookings." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();
  const localDate = localDateOf(chosen.startAt, settings.timezone);
  const range = await computeArtistSlotsRange(admin, {
    artistId: item.artistId,
    durationMin: item.durationMin,
    fromDate: localDate,
    toDate: localDate,
    now,
  });
  const verdict = validateChosenTime({
    mode: "open_calendar",
    proposedTimes: [],
    openSlots: range?.slots ?? [],
    chosen,
    now,
  });
  if (!verdict.ok) return { success: false, error: verdict.error };

  // One-off claim BEFORE insert: atomic active->inactive flip loses the race
  // cleanly; a failed insert reverts the claim (compensating action).
  let claimed = false;
  if (item.oneOff) {
    const { data: claimedRows } = await admin
      .from("flash_items")
      .update({ active: false })
      .eq("id", item.id)
      .eq("active", true)
      .select("id");
    if (!claimedRows || claimedRows.length === 0) {
      return { success: false, error: "Someone just claimed this piece." };
    }
    claimed = true;
  }

  const { data: created, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: user.id,
      customer_name: await customerNameOf(supabase, user.id, user.email),
      artist_id: item.artistId,
      flash_item_id: item.id,
      type: "flash",
      start_at: chosen.startAt,
      end_at: chosen.endAt,
      timezone: settings.timezone,
      status: "confirmed",
      price_cents: item.priceCents,
      deposit_cents: item.depositCents,
      deposit_status: "not_required",
    })
    .select("id")
    .single();
  if (error) {
    if (claimed) {
      // Compensating: give the piece back.
      await admin.from("flash_items").update({ active: true }).eq("id", item.id);
    }
    if (error.code === "23P01") {
      return { success: false, error: "That time was just taken — pick another." };
    }
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true, appointmentId: created.id };
}
```

Also update imports at the top of the file: add `BookConsultationSchema`, `BookFlashSchema` (schemas), `computeArtistSlotsRange`, `localDateOf` (server-slots), `mapDbFlashItem`, `type DbFlashItem` (booking-types), and refactor `submitBookingRequest` to use the new `customerNameOf` helper (delete its inline profile fetch).

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit && npm run lint` (touched files clean)

```bash
git add app/book/actions.ts
git commit -m "feat(booking): consultation and flash direct-booking actions with one-off claim"
```

---

### Task 5: Multi-flow booking chooser on /book/[id]

**Files:**
- Create: `components/booking/booking-flow.tsx` (chooser + consult branch + flash branch)
- Modify: `app/book/[id]/page.tsx` (fetch flash items + settings fields; render `BookingFlow`)
- Modify: `components/booking/request-flow.tsx` (accept `embedded?: boolean` to suppress its own `<h1>` when inside the chooser)
- Modify: `components/booking/index.tsx` (export `BookingFlow`)

**Interfaces:**
- Consumes: `enabledBookingFlows`, `SlotPicker`, `BookingRequestFlow`, `bookConsultation`, `bookFlash`, `fetchActiveFlashItems`, `fetchBookingSettings`.
- Produces: `<BookingFlow artistId artistName settings={{ acceptingBookings, customRequestsEnabled, consultationsEnabled, flashEnabled, consultDurationMin, consultPriceCents, consultLocation }} flashItems={FlashItem[]} />`

Behavior spec (each bullet must be observable in the code):
- Zero enabled flows → "not taking bookings" message.
- Exactly one flow → skip the chooser, render that branch directly.
- Chooser = one tappable card per flow (title + one-line hint + price/duration facts for consult).
- Consult branch: facts line ("30 min · Free · In person" — from settings), `SlotPicker` with `durationMin=consultDurationMin`; picking a slot shows an inline confirm row (formatted time + Confirm/Cancel); confirm calls `bookConsultation`; success screen links to `/dashboard`. Signed-out users see a sign-in button instead of the picker.
- Flash branch: responsive grid (`grid-cols-2 sm:grid-cols-3`) of active items — image, title, `$price`, duration, "1 of 1" badge for one-offs; selecting an item shows the picker with `durationMin=item.durationMin` + the same confirm row calling `bookFlash`; a "just claimed"/"slot taken" error re-renders the picker with the message.
- Custom branch: `<BookingRequestFlow embedded ... />` unchanged behavior.
- A back control returns to the chooser when more than one flow exists.

- [ ] **Step 1: Implement `components/booking/booking-flow.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { enabledBookingFlows, type BookingFlowKind } from "@/lib/booking/flows";
import type { Slot } from "@/lib/booking/availability";
import type { ConsultLocation, FlashItem } from "@/lib/types/booking";
import { bookConsultation, bookFlash } from "@/app/book/actions";
import { BookingRequestFlow } from "./request-flow";
import { SlotPicker } from "./slot-picker";
import { FieldLabel } from "./form-rows";

interface BookingFlowSettings {
  acceptingBookings: boolean;
  customRequestsEnabled: boolean;
  consultationsEnabled: boolean;
  flashEnabled: boolean;
  consultDurationMin: number;
  consultPriceCents: number;
  consultLocation: ConsultLocation;
}

interface BookingFlowProps {
  artistId: string;
  artistName: string;
  settings: BookingFlowSettings | null;
  flashItems: FlashItem[];
}

const FLOW_COPY: Record<BookingFlowKind, { title: string; hint: string }> = {
  custom: { title: "Custom work", hint: "Send your idea for review and a quote" },
  consultation: { title: "Consultation", hint: "Talk it through before committing" },
  flash: { title: "Flash", hint: "Ready-to-go designs, book instantly" },
};

function fmtSlot(slot: Slot): string {
  const start = new Date(slot.startAt);
  return `${start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function fmtPrice(cents: number): string {
  return cents === 0 ? "Free" : `$${(cents / 100).toFixed(0)}`;
}

/** Slot picker + inline confirm + success, shared by consult and flash branches. */
function DirectBookingBranch({
  artistId,
  durationMin,
  facts,
  onConfirm,
}: {
  artistId: string;
  durationMin: number;
  facts: string;
  onConfirm: (slot: Slot) => Promise<{ success: boolean; error?: string }>;
}) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  if (booked) {
    return (
      <div className="space-y-4">
        <FieldLabel>Booked</FieldLabel>
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">
          You are on the calendar. Details are in your dashboard.
        </p>
        <Button variant="ink" as={Link} href="/dashboard">
          Go to dashboard
        </Button>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">Sign in to book.</p>
        <Button variant="ink" as={Link} href="/login">
          Sign in
        </Button>
      </div>
    );
  }

  const confirm = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const result = await onConfirm(selected);
    setBusy(false);
    if (result.success) setBooked(true);
    else {
      setError(result.error ?? "Something went wrong.");
      setSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">{facts}</p>
      {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
      {selected ? (
        <div className="space-y-3 rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
          <FieldLabel>{fmtSlot(selected)}</FieldLabel>
          <div className="flex gap-2">
            <Button
              variant="ink"
              className="min-h-[44px] flex-1"
              disabled={busy}
              onClick={() => void confirm()}
            >
              {busy ? "Booking..." : "Confirm booking"}
            </Button>
            <Button variant="ink-outline" className="min-h-[44px]" onClick={() => setSelected(null)}>
              Change time
            </Button>
          </div>
        </div>
      ) : (
        <SlotPicker artistId={artistId} durationMin={durationMin} onPick={setSelected} disabled={busy} />
      )}
    </div>
  );
}

export function BookingFlow({ artistId, artistName, settings, flashItems }: BookingFlowProps) {
  const flows = settings ? enabledBookingFlows(settings) : [];
  const [kind, setKind] = useState<BookingFlowKind | null>(flows.length === 1 ? flows[0]! : null);
  const [flashItem, setFlashItem] = useState<FlashItem | null>(null);

  if (!settings || flows.length === 0) {
    return (
      <p className="text-[14px] text-ink-black/60 dark:text-ink-cream/60">
        {artistName} is not taking bookings right now.
      </p>
    );
  }

  const consultLocation = settings.consultLocation === "virtual" ? "Virtual" : "In person";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Book with {artistName}</h1>

      {kind === null ? (
        <div className="flex flex-col gap-3">
          {flows.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setKind(f)}
              className="min-h-[44px] rounded-[14px] border border-ink-black/[0.08] p-4 text-left transition-colors hover:border-ink-rust dark:border-ink-cream/[0.08]"
            >
              <p className="font-mono text-[12px] font-medium text-ink-black/80 dark:text-ink-cream/80">
                {FLOW_COPY[f].title}
              </p>
              <p className="mt-1 text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                {f === "consultation"
                  ? `${settings.consultDurationMin} min · ${fmtPrice(settings.consultPriceCents)} · ${consultLocation}`
                  : FLOW_COPY[f].hint}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {flows.length > 1 ? (
            <button
              type="button"
              onClick={() => {
                setKind(null);
                setFlashItem(null);
              }}
              className="font-mono text-[11px] text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
            >
              Back to options
            </button>
          ) : null}

          {kind === "custom" ? (
            <BookingRequestFlow
              artistId={artistId}
              artistName={artistName}
              acceptingRequests
              embedded
            />
          ) : null}

          {kind === "consultation" ? (
            <DirectBookingBranch
              artistId={artistId}
              durationMin={settings.consultDurationMin}
              facts={`${settings.consultDurationMin} min consultation · ${fmtPrice(settings.consultPriceCents)} · ${consultLocation}`}
              onConfirm={(slot) =>
                bookConsultation({ artistId, startAt: slot.startAt, endAt: slot.endAt })
              }
            />
          ) : null}

          {kind === "flash" && flashItem === null ? (
            flashItems.length === 0 ? (
              <p className="text-[13px] text-ink-black/50 dark:text-ink-cream/50">
                No flash available right now — check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {flashItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFlashItem(item)}
                    className="rounded-[14px] border border-ink-black/[0.08] p-2 text-left transition-colors hover:border-ink-rust dark:border-ink-cream/[0.08]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <p className="mt-2 truncate text-[12px] font-medium text-ink-black/80 dark:text-ink-cream/80">
                      {item.title}
                    </p>
                    <p className="font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                      {fmtPrice(item.priceCents)} · {item.durationMin / 60}h
                      {item.oneOff ? " · 1 of 1" : ""}
                    </p>
                  </button>
                ))}
              </div>
            )
          ) : null}

          {kind === "flash" && flashItem !== null ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setFlashItem(null)}
                className="font-mono text-[11px] text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
              >
                Back to flash
              </button>
              <DirectBookingBranch
                artistId={artistId}
                durationMin={flashItem.durationMin}
                facts={`${flashItem.title} · ${fmtPrice(flashItem.priceCents)} · ${flashItem.durationMin / 60}h${flashItem.oneOff ? " · 1 of 1" : ""}`}
                onConfirm={(slot) =>
                  bookFlash({ flashItemId: flashItem.id, startAt: slot.startAt, endAt: slot.endAt })
                }
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `request-flow.tsx` embedded mode** — add `embedded?: boolean` prop; when true, skip the `<h1>` in the form and success states (the chooser owns the heading). The not-accepting and sign-in short-circuits keep their copy.

- [ ] **Step 3: Rewrite `app/book/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArtistByIdFromDb, getArtistBySlugFromDb } from "@/lib/data/supabase-artists";
import { fetchActiveFlashItems, fetchBookingSettings } from "@/lib/data/supabase-booking";
import { BookingFlow } from "@/components/booking";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Book | Inked Market" };

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const artist =
    (await getArtistByIdFromDb(supabase, id)) ?? (await getArtistBySlugFromDb(supabase, id));
  if (!artist) notFound();

  const settings = await fetchBookingSettings(supabase, { artistId: artist.id });
  const flashItems = settings?.flashEnabled
    ? await fetchActiveFlashItems(supabase, artist.id)
    : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <BookingFlow
        artistId={artist.id}
        artistName={artist.name}
        settings={settings}
        flashItems={flashItems}
      />
    </main>
  );
}
```

Note: `BookingFlow` accepts `settings: BookingFlowSettings | null` — `BookingSettings` is a superset, structurally compatible.

- [ ] **Step 4: Export, verify, commit**

`components/booking/index.tsx`: add `export { BookingFlow } from "./booking-flow";`

Run: `npx tsc --noEmit && npm run lint`

```bash
git add components/booking/ app/book/
git commit -m "feat(booking): multi-flow chooser with consultation and flash booking"
```

---

### Task 6: Flash manager (artist dashboard)

**Files:**
- Create: `components/booking/use-flash-manager.ts`
- Create: `components/booking/flash-manager-panel.tsx`
- Modify: `components/booking/index.tsx`
- Modify: `components/dashboard/artist/artist-dashboard.tsx` (quick action + panel)

**Interfaces:**
- Consumes: Task 3 CRUD, `uploadBookingReference`, `resolveBookingEntity`, form rows, `SlideOverPanel`, `Input` (requires `label`), `ToggleSwitch`, `Button`.
- Produces: `useFlashManager()` → `{ items, loading, add, toggleActive, remove, adding, error }`; `<FlashManagerPanel open onClose />`.

- [ ] **Step 1: `components/booking/use-flash-manager.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteFlashItem,
  fetchOwnFlashItems,
  insertFlashItem,
  resolveBookingEntity,
  setFlashItemActive,
} from "@/lib/data/supabase-booking";
import { uploadBookingReference } from "@/lib/utils/image-upload";
import type { FlashItem } from "@/lib/types/booking";

export function useFlashManager() {
  const supabaseRef = useRef(createClient());
  const artistIdRef = useRef<string | null>(null);
  const [items, setItems] = useState<FlashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const entity = await resolveBookingEntity(supabase);
      if (cancelled) return;
      if (!entity?.artistId) {
        setLoading(false);
        return;
      }
      artistIdRef.current = entity.artistId;
      const rows = await fetchOwnFlashItems(supabase, entity.artistId);
      if (cancelled) return;
      setItems(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const add = useCallback(
    async (input: {
      file: File;
      title: string;
      priceCents: number;
      depositCents: number;
      durationMin: number;
      oneOff: boolean;
    }) => {
      const artistId = artistIdRef.current;
      if (!artistId) return false;
      setAdding(true);
      setError(null);
      try {
        const supabase = supabaseRef.current;
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Sign in first.");
        const uploaded = await uploadBookingReference(supabase, auth.user.id, input.file);
        if (!uploaded.ok) throw new Error(uploaded.error);
        const item = await insertFlashItem(supabase, artistId, {
          title: input.title,
          imageUrl: uploaded.url,
          priceCents: input.priceCents,
          depositCents: input.depositCents,
          durationMin: input.durationMin,
          oneOff: input.oneOff,
        });
        setItems((prev) => [item, ...prev]);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add flash.");
        return false;
      } finally {
        setAdding(false);
      }
    },
    []
  );

  const toggleActive = useCallback(async (item: FlashItem) => {
    await setFlashItemActive(supabaseRef.current, item.id, !item.active);
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, active: !item.active } : x)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteFlashItem(supabaseRef.current, id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { items, loading, add, toggleActive, remove, adding, error };
}
```

- [ ] **Step 2: `components/booking/flash-manager-panel.tsx`**

`SlideOverPanel` "Flash" containing:
- Add form: native file input (single), `Input label="Title"`, `Input label="Price ($)" type="number" min=0`, deposit SelectRow (reuse the settings panel's $ presets 0/50/100/150/200/300/500), duration SelectRow (1h-6h), ToggleRow "One of a kind" hint "Deactivates automatically once booked". Add button disabled until file + title + price > 0; calls `add(...)` with dollars converted to cents (`Math.round(Number(price) * 100)`); clears the form on success.
- Item list: each row = thumb (`h-14 w-14` img with eslint-disable comment), title, `$price · Nh`, one-off badge, `ToggleSwitch` bound to `active` via `toggleActive(item)`, Remove button (`remove(id)`) with `aria-label`.
- Loading and error states as in the other panels; conditional JSX via ternaries.

- [ ] **Step 3: Wire the dashboard**

`artist-dashboard.tsx`: `const [flashOpen, setFlashOpen] = useState(false);` — new quick action:

```tsx
{
  icon: <PhotoUploadIcon className="text-ink-sage" />,
  label: "Manage Flash",
  description: "Ready-to-book designs with set prices",
  onClick: () => setFlashOpen(true),
  iconBgClass: "bg-ink-sage/[0.08]",
  iconBorderClass: "border-ink-sage/[0.12]",
},
```

and `<FlashManagerPanel open={flashOpen} onClose={() => setFlashOpen(false)} />` in panels. Export from the barrel.

- [ ] **Step 4: Verify + commit**

Run: `npx tsc --noEmit && npm run lint`

```bash
git add components/booking/ components/dashboard/artist/artist-dashboard.tsx
git commit -m "feat(booking): flash manager panel on artist dashboard"
```

---

### Task 7: Artist Upcoming card wired live

**Files:**
- Create: `components/booking/use-artist-upcoming.ts`
- Create: `components/booking/upcoming-appointments-card.tsx`
- Modify: `components/booking/index.tsx`
- Modify: `components/dashboard/artist/artist-dashboard.tsx:62-69` (replace the static Upcoming card)

**Interfaces:**
- Consumes: `fetchArtistUpcomingAppointments`, `resolveBookingEntity`, `AppointmentRecord`.
- Produces: `<UpcomingAppointmentsCard />` — self-contained (own hook), renders the existing card chrome with live rows or the existing empty state.

- [ ] **Step 1: `use-artist-upcoming.ts`** — same inline-IIFE fetch pattern as `useFlashManager`, returning `{ appointments, loading }` from `fetchArtistUpcomingAppointments(supabase, entity.artistId)`.

- [ ] **Step 2: `upcoming-appointments-card.tsx`** — reproduce the card chrome currently inline in `artist-dashboard.tsx` (rounded-[20px] container + "Upcoming" eyebrow) and render either the existing empty-state copy or rows:

```tsx
{appointments.map((a) => (
  <div key={a.id} className="flex items-center justify-between border-b border-ink-black/[0.04] py-2 last:border-0 dark:border-ink-cream/[0.04]">
    <div className="min-w-0">
      <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
        {a.customerName ?? "Customer"}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-black/30 dark:text-ink-cream/30">
        {a.type}
      </p>
    </div>
    <p className="shrink-0 font-mono text-[11px] text-ink-black/50 dark:text-ink-cream/50">
      {new Date(a.startAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
      {new Date(a.startAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
    </p>
  </div>
))}
```

- [ ] **Step 3: Replace the inline card in `artist-dashboard.tsx`** with `<UpcomingAppointmentsCard />` (delete lines 62-69's static block). Export from barrel.

- [ ] **Step 4: Verify + commit**

Run: `npx tsc --noEmit && npm run lint`

```bash
git add components/booking/ components/dashboard/artist/artist-dashboard.tsx
git commit -m "feat(booking): live upcoming appointments on artist dashboard"
```

---

### Task 8: Verification sweep + E2E smoke

- [ ] **Step 1: Full check run**

```bash
npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint
```

Expected: 32 booking checks, 44 builder checks, tsc clean, 17 pre-existing lint errors (unchanged).

- [ ] **Step 2: Service-role E2E smoke (scratchpad, deleted after)**

Script asserts, against the live DB with a throwaway artist + settings + availability:
1. Insert booking_settings (consultations + flash enabled, granularity 60, notice 0) + one weekly rule.
2. Insert a one-off flash item.
3. Simulate the one-off claim: first `update ... set active=false where id and active=true` returns 1 row; second identical update returns 0 rows (race loser).
4. Reactivate, then insert a flash appointment at a valid time + verify a second overlapping consultation insert hits `23P01`.
5. Clean up everything.

- [ ] **Step 3: Report manual verification for Tanner** (no dev server): enable consultations + flash in Booking Settings; add a flash piece via Manage Flash; visit `/book/[artist]` — chooser shows three options; book a consult slot and a flash slot; both appear in the artist's Upcoming card and the customer's dashboard; a second booking of the one-off flash shows "no longer available".

- [ ] **Step 4: Commit sweep fixes** (specific files only) if any.

# Booking Phase 2 (Custom Requests) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the custom work request flow end-to-end: customer brief form → artist inbox → accept (quote + deposit + scheduling mode) / decline → propose-times or open-calendar scheduling → race-safe appointment creation.

**Architecture:** Mutations are object-based Server Actions validated with Zod (`app/book/actions.ts`), reading/writing through the user-scoped server Supabase client so RLS stays authoritative; only the slots computation uses the admin client (to read other people's busy intervals without leaking them — it returns derived slots only). Scheduling validation is a pure module (`lib/booking/scheduling.ts`) so the accept/schedule invariants are unit-checked. Customer dashboard sections keep their existing view-model types; new mappers feed them live rows.

**Tech Stack:** Next.js 16 Server Actions + Route Handler, Zod, Supabase (RLS + admin client + storage + pg_cron), existing availability engine from Phase 1.

## Global Constraints

- Supabase project `cktvpfenygxhfaodihbz` ONLY; never `sqibczeyflarfgtnexne` (Velora). Migrations apply via `supabase db push` (MCP writes are blocked).
- No emoji in code. No AI attribution in commits. Do NOT run `npm run dev`/`build`.
- Verification loop: `npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint`. tsc has `noUncheckedIndexedAccess` — no bare indexed access.
- Lint gotchas: `react/jsx-no-leaked-render` (use ternaries `? : null`), no unused vars (no `_`-discard destructuring; use `copyDefinedFields` from `@/lib/utils`).
- Server Components by default; `"use client"` only where needed. Mobile-first; touch targets >= 44px. Money = integer cents. All timestamps ISO UTC strings in app code.
- Every transition UPDATE carries its expected prior status in the WHERE clause (`.eq("status", "pending")`) and checks affected rows — transitions are atomic or rejected, never last-write-wins.

---

### Task 1: Domain types + Zod schemas

**Files:**
- Modify: `lib/types/booking.ts` (append)
- Modify: `lib/validation/schemas.ts` (append)
- Modify: `lib/types/index.ts:372` (add `"withdrawn"` to legacy `BookingRequestStatus`)
- Modify: `scripts/check-booking.ts` (append schema checks)

**Interfaces:**
- Produces (consumed by Tasks 2-10):
  - Types: `RequestStatus`, `SchedulingMode`, `ProposedTime { startAt: string; endAt: string }`, `AppointmentType`, `AppointmentLifecycleStatus`, `DepositStatus`, `BookingRequestRecord`, `AppointmentRecord`
  - Schemas: `SubmitBookingRequestSchema`, `RespondToRequestSchema` (discriminated union on `action`), `ScheduleFromRequestSchema`, `SlotsQuerySchema` + inferred types `SubmitBookingRequestInput`, `RespondToRequestInput`, `ScheduleFromRequestInput`

- [ ] **Step 1: Append domain types to `lib/types/booking.ts`**

```ts
// ─── Phase 2: requests + appointments ─────────────────────────────────────

export type RequestStatus = "pending" | "accepted" | "declined" | "withdrawn" | "expired";
export type SchedulingMode = "propose" | "open_calendar";
export type AppointmentType = "consultation" | "flash" | "session" | "walk_in";
export type AppointmentLifecycleStatus =
  | "pending_deposit"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type DepositStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "waived"
  | "refund_due"
  | "refunded";

export interface ProposedTime {
  startAt: string; // ISO UTC
  endAt: string;
}

export interface BookingRequestRecord {
  id: string;
  customerId: string;
  customerName: string | null;
  artistId?: string;
  studioId?: string;
  artistName?: string;
  studioName?: string;
  description: string;
  placement: string | null;
  sizeCategory: string | null;
  budgetRange: string | null;
  isColor: boolean | null;
  referenceImageUrls: string[];
  preferredTiming: string | null;
  flexibleDates: boolean;
  isMultiSession: boolean;
  estimatedSessions: number | null;
  status: RequestStatus;
  expiresAt: string;
  responseMessage: string | null;
  quoteMinCents: number | null;
  quoteMaxCents: number | null;
  depositCents: number | null;
  schedulingMode: SchedulingMode | null;
  sessionDurationMin: number | null;
  proposedTimes: ProposedTime[];
  createdAt: string;
}

export interface AppointmentRecord {
  id: string;
  customerId: string | null;
  customerName: string | null;
  artistId?: string;
  studioId?: string;
  artistName?: string;
  studioName?: string;
  requestId: string | null;
  type: AppointmentType;
  startAt: string;
  endAt: string;
  timezone: string;
  status: AppointmentLifecycleStatus;
  priceCents: number | null;
  depositCents: number;
  depositStatus: DepositStatus;
  notes: string | null;
  customerNotes: string | null;
}
```

- [ ] **Step 2: Add `"withdrawn"` to the legacy union in `lib/types/index.ts`**

```ts
export type BookingRequestStatus = "pending" | "accepted" | "declined" | "expired" | "withdrawn";
```

Then update the `requestStatusConfig` record in `components/dashboard/customer/customer-booking-requests-section.tsx` (it is `Record<BookingRequestStatus, ...>` and will fail tsc without a new entry):

```ts
  withdrawn: { color: BADGE_COLORS.muted, label: "Withdrawn" },
```

- [ ] **Step 3: Append schemas to `lib/validation/schemas.ts`**

```ts
// ─── Booking (phase 2: custom requests) ────────────────────────────────────

const isoDatetime = z.string().datetime();
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const SubmitBookingRequestSchema = z.object({
  artistId: z.string().uuid(),
  description: z.string().trim().min(20, "Tell the artist a bit more (20+ characters)").max(3000),
  placement: z.string().trim().max(100).optional(),
  sizeCategory: z.enum(["small", "medium", "large", "xl"]).optional(),
  budgetRange: z.enum(["under-300", "300-600", "600-1200", "1200-plus"]).optional(),
  color: z.enum(["color", "black-grey"]).optional(),
  referenceImageUrls: z.array(z.string().url()).max(5).default([]),
  preferredTiming: z.string().trim().max(200).optional(),
  flexibleDates: z.boolean().default(true),
  isMultiSession: z.boolean().default(false),
  estimatedSessions: z.number().int().min(2).max(20).optional(),
});
export type SubmitBookingRequestInput = z.infer<typeof SubmitBookingRequestSchema>;

const proposedTimeSchema = z
  .object({ startAt: isoDatetime, endAt: isoDatetime })
  .refine((t) => Date.parse(t.startAt) < Date.parse(t.endAt), { message: "Time block ends before it starts" });

// NOTE: zod v3 discriminatedUnion options must be plain ZodObject (no .refine
// on a branch) — cross-field rules live in a union-level .superRefine.
export const RespondToRequestSchema = z
  .discriminatedUnion("action", [
    z.object({
      action: z.literal("decline"),
      requestId: z.string().uuid(),
      responseMessage: z.string().trim().max(1000).optional(),
    }),
    z.object({
      action: z.literal("accept"),
      requestId: z.string().uuid(),
      responseMessage: z.string().trim().max(1000).optional(),
      quoteMinCents: z.number().int().min(0).max(10_000_000).optional(),
      quoteMaxCents: z.number().int().min(0).max(10_000_000).optional(),
      depositCents: z.number().int().min(0).max(10_000_000).optional(),
      schedulingMode: z.enum(["propose", "open_calendar"]),
      sessionDurationMin: z.number().int().min(30).max(720).optional(),
      proposedTimes: z.array(proposedTimeSchema).max(3).default([]),
    }),
  ])
  .superRefine((d, ctx) => {
    if (d.action !== "accept") return;
    if (d.schedulingMode === "propose" && d.proposedTimes.length === 0) {
      ctx.addIssue({ code: "custom", message: "Offer at least one time" });
    }
    if (d.schedulingMode === "open_calendar" && d.sessionDurationMin === undefined) {
      ctx.addIssue({ code: "custom", message: "Set a session length for open-calendar booking" });
    }
    if (
      d.quoteMinCents !== undefined &&
      d.quoteMaxCents !== undefined &&
      d.quoteMinCents > d.quoteMaxCents
    ) {
      ctx.addIssue({ code: "custom", message: "Quote minimum exceeds maximum" });
    }
  });
export type RespondToRequestInput = z.infer<typeof RespondToRequestSchema>;

export const ScheduleFromRequestSchema = z.object({
  requestId: z.string().uuid(),
  startAt: isoDatetime,
  endAt: isoDatetime,
});
export type ScheduleFromRequestInput = z.infer<typeof ScheduleFromRequestSchema>;

export const SlotsQuerySchema = z
  .object({
    artistId: z.string().uuid(),
    durationMin: z.coerce.number().int().min(15).max(720),
    from: dateOnly,
    to: dateOnly,
  })
  .refine(
    (q) => {
      const days = (Date.parse(`${q.to}T00:00:00Z`) - Date.parse(`${q.from}T00:00:00Z`)) / 86_400_000;
      return days >= 0 && days <= 45;
    },
    { message: "Date range must be 0-45 days" }
  );
```

- [ ] **Step 4: Append schema checks to `scripts/check-booking.ts`** (before the final `console.log`)

```ts
// ─── validation schemas ──────────────────────────────────────────────────
import {
  SubmitBookingRequestSchema,
  RespondToRequestSchema,
  SlotsQuerySchema,
} from "../lib/validation/schemas";

check("SubmitBookingRequestSchema accepts a valid brief, rejects a thin one", () => {
  const ok = SubmitBookingRequestSchema.safeParse({
    artistId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff",
    description: "Half sleeve, japanese style dragon wrapping the forearm",
    color: "black-grey",
  });
  assert.ok(ok.success);
  assert.equal(ok.data.flexibleDates, true);
  const thin = SubmitBookingRequestSchema.safeParse({
    artistId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff",
    description: "dragon",
  });
  assert.ok(!thin.success);
});

check("RespondToRequestSchema enforces propose-times, duration, and quote order", () => {
  const base = {
    action: "accept" as const,
    requestId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff",
  };
  assert.ok(
    !RespondToRequestSchema.safeParse({ ...base, schedulingMode: "propose", proposedTimes: [] }).success
  );
  assert.ok(
    !RespondToRequestSchema.safeParse({ ...base, schedulingMode: "open_calendar" }).success
  );
  assert.ok(
    !RespondToRequestSchema.safeParse({
      ...base,
      schedulingMode: "open_calendar",
      sessionDurationMin: 180,
      quoteMinCents: 90_000,
      quoteMaxCents: 50_000,
    }).success
  );
  assert.ok(
    RespondToRequestSchema.safeParse({
      ...base,
      schedulingMode: "propose",
      proposedTimes: [{ startAt: "2026-08-01T17:00:00Z", endAt: "2026-08-01T20:00:00Z" }],
    }).success
  );
});

check("SlotsQuerySchema bounds the range", () => {
  const q = { artistId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff", durationMin: "60" };
  assert.ok(SlotsQuerySchema.safeParse({ ...q, from: "2026-08-01", to: "2026-08-31" }).success);
  assert.ok(!SlotsQuerySchema.safeParse({ ...q, from: "2026-08-01", to: "2026-12-01" }).success);
  assert.ok(!SlotsQuerySchema.safeParse({ ...q, from: "2026-08-02", to: "2026-08-01" }).success);
});
```

- [ ] **Step 5: Run checks + typecheck**

Run: `npx tsx scripts/check-booking.ts && npx tsc --noEmit`
Expected: `22 checks passed`, tsc clean.

- [ ] **Step 6: Commit**

```bash
git add lib/types/booking.ts lib/types/index.ts lib/validation/schemas.ts scripts/check-booking.ts components/dashboard/customer/customer-booking-requests-section.tsx
git commit -m "feat(booking): request/appointment domain types and zod schemas"
```

---

### Task 2: Scheduling validation module (pure)

**Files:**
- Create: `lib/booking/scheduling.ts`
- Modify: `scripts/check-booking.ts` (append)

**Interfaces:**
- Consumes: `ProposedTime` from Task 1, `Slot` from Phase 1 engine.
- Produces: `validateChosenTime(input): { ok: true } | { ok: false; error: string }` — used by the `scheduleFromRequest` server action (Task 6).

- [ ] **Step 1: Append failing checks**

```ts
// ─── scheduling.ts ───────────────────────────────────────────────────────
import { validateChosenTime } from "../lib/booking/scheduling";

const CHOSEN = { startAt: "2026-08-01T17:00:00.000Z", endAt: "2026-08-01T20:00:00.000Z" };
const NOW = new Date("2026-07-14T00:00:00Z");

check("validateChosenTime: propose mode accepts exact match only", () => {
  const proposed = [CHOSEN, { startAt: "2026-08-02T17:00:00.000Z", endAt: "2026-08-02T20:00:00.000Z" }];
  assert.ok(validateChosenTime({ mode: "propose", proposedTimes: proposed, openSlots: [], chosen: CHOSEN, now: NOW }).ok);
  const shifted = { startAt: "2026-08-01T17:30:00.000Z", endAt: "2026-08-01T20:30:00.000Z" };
  assert.ok(!validateChosenTime({ mode: "propose", proposedTimes: proposed, openSlots: [], chosen: shifted, now: NOW }).ok);
});

check("validateChosenTime: rejects past and inverted times", () => {
  const past = { startAt: "2026-07-01T17:00:00.000Z", endAt: "2026-07-01T20:00:00.000Z" };
  assert.ok(!validateChosenTime({ mode: "propose", proposedTimes: [past], openSlots: [], chosen: past, now: NOW }).ok);
  const inverted = { startAt: "2026-08-01T20:00:00.000Z", endAt: "2026-08-01T17:00:00.000Z" };
  assert.ok(!validateChosenTime({ mode: "propose", proposedTimes: [inverted], openSlots: [], chosen: inverted, now: NOW }).ok);
});

check("validateChosenTime: open calendar requires slot membership", () => {
  assert.ok(validateChosenTime({ mode: "open_calendar", proposedTimes: [], openSlots: [CHOSEN], chosen: CHOSEN, now: NOW }).ok);
  assert.ok(!validateChosenTime({ mode: "open_calendar", proposedTimes: [], openSlots: [], chosen: CHOSEN, now: NOW }).ok);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx tsx scripts/check-booking.ts`
Expected: FAIL — `Cannot find module '../lib/booking/scheduling'`.

- [ ] **Step 3: Implement `lib/booking/scheduling.ts`**

```ts
/**
 * Pure validation for turning an accepted request into an appointment.
 * The DB exclusion constraint is the final race arbiter; this layer stops
 * clients from booking outside what the artist offered.
 */
import type { ProposedTime, SchedulingMode } from "@/lib/types/booking";
import type { Slot } from "./availability";

export type ScheduleValidation = { ok: true } | { ok: false; error: string };

const sameInterval = (a: { startAt: string; endAt: string }, startMs: number, endMs: number) =>
  Date.parse(a.startAt) === startMs && Date.parse(a.endAt) === endMs;

export function validateChosenTime(input: {
  mode: SchedulingMode;
  proposedTimes: ProposedTime[];
  openSlots: Slot[];
  chosen: { startAt: string; endAt: string };
  now: Date;
}): ScheduleValidation {
  const startMs = Date.parse(input.chosen.startAt);
  const endMs = Date.parse(input.chosen.endAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
    return { ok: false, error: "That time is not valid." };
  }
  if (startMs <= input.now.getTime()) {
    return { ok: false, error: "That time is in the past." };
  }
  if (input.mode === "propose") {
    return input.proposedTimes.some((t) => sameInterval(t, startMs, endMs))
      ? { ok: true }
      : { ok: false, error: "Pick one of the offered times." };
  }
  return input.openSlots.some((s) => sameInterval(s, startMs, endMs))
    ? { ok: true }
    : { ok: false, error: "That slot is no longer available." };
}
```

- [ ] **Step 4: Run checks**

Run: `npx tsx scripts/check-booking.ts && npx tsc --noEmit`
Expected: `25 checks passed`, tsc clean.

- [ ] **Step 5: Commit**

```bash
git add lib/booking/scheduling.ts scripts/check-booking.ts
git commit -m "feat(booking): pure scheduling validation for request-to-appointment"
```

---

### Task 3: Db rows, mappers, and legacy view-model bridges

**Files:**
- Modify: `lib/supabase/booking-types.ts` (append)
- Modify: `scripts/check-booking.ts` (append)

**Interfaces:**
- Consumes: Task 1 types; legacy `BookingRequest`, `Appointment` from `@/lib/types`.
- Produces (used by Tasks 4, 8, 9):
  - `DbBookingRequest`, `DbAppointment` row interfaces (embedded `artists`/`studios` name objects optional)
  - `mapDbBookingRequest(row): BookingRequestRecord`
  - `mapDbAppointment(row): AppointmentRecord`
  - `requestToViewModel(r: BookingRequestRecord): BookingRequest` (legacy VM for the customer section)
  - `appointmentToViewModel(a: AppointmentRecord): Appointment` (legacy VM)
  - `effectiveRequestStatus(r: { status: RequestStatus; expiresAt: string }, now: Date): RequestStatus` — lazy expiry: `pending` past `expiresAt` reads as `expired`

- [ ] **Step 1: Append failing checks**

```ts
// ─── request/appointment mappers ─────────────────────────────────────────
import {
  mapDbBookingRequest,
  mapDbAppointment,
  requestToViewModel,
  appointmentToViewModel,
  effectiveRequestStatus,
  type DbBookingRequest,
  type DbAppointment,
} from "../lib/supabase/booking-types";

const DB_REQUEST: DbBookingRequest = {
  id: "r1", customer_id: "u1", customer_name: "Jess", artist_id: "a1", studio_id: null,
  type: "custom", description: "Fine-line floral piece on the right shoulder blade",
  placement: "shoulder", size_category: "medium", budget_range: "600-1200", is_color: false,
  reference_image_urls: ["https://x/1.webp"], preferred_timing: "weekends", flexible_dates: true,
  is_multi_session: false, estimated_sessions: null,
  status: "pending", expires_at: "2026-07-28T00:00:00Z",
  response_message: null, quote_min_cents: null, quote_max_cents: null, deposit_cents: null,
  scheduling_mode: null, session_duration_min: null, proposed_times: null, conversation_id: null,
  created_at: "2026-07-14T00:00:00Z", updated_at: "2026-07-14T00:00:00Z",
  artists: { name: "Mar Delgado" }, studios: null,
};

check("booking request maps db->domain with embedded names", () => {
  const r = mapDbBookingRequest(DB_REQUEST);
  assert.equal(r.artistId, "a1");
  assert.equal(r.artistName, "Mar Delgado");
  assert.equal(r.isColor, false);
  assert.deepEqual(r.proposedTimes, []);
});

check("effectiveRequestStatus applies lazy expiry", () => {
  const base = { status: "pending" as const, expiresAt: "2026-07-28T00:00:00Z" };
  assert.equal(effectiveRequestStatus(base, new Date("2026-07-20T00:00:00Z")), "pending");
  assert.equal(effectiveRequestStatus(base, new Date("2026-08-01T00:00:00Z")), "expired");
  assert.equal(
    effectiveRequestStatus({ status: "accepted", expiresAt: "2026-07-28T00:00:00Z" }, new Date("2026-08-01T00:00:00Z")),
    "accepted"
  );
});

check("request view model summarizes for the legacy section", () => {
  const vm = requestToViewModel(mapDbBookingRequest(DB_REQUEST));
  assert.equal(vm.artistName, "Mar Delgado");
  assert.equal(vm.status, "pending");
  assert.ok(vm.summary.includes("Fine-line floral"));
});

const DB_APPT: DbAppointment = {
  id: "ap1", customer_id: "u1", customer_name: null, artist_id: "a1", studio_id: null,
  request_id: "r1", project_id: null, flash_item_id: null, type: "session",
  start_at: "2026-08-01T17:00:00Z", end_at: "2026-08-01T20:00:00Z", timezone: "America/New_York",
  status: "confirmed", cancelled_by: null, cancellation_reason: null,
  price_cents: 90000, deposit_cents: 10000, deposit_status: "not_required",
  deposit_provider: null, deposit_checkout_id: null, deposit_paid_at: null, hold_expires_at: null,
  notes: null, customer_notes: null, created_at: "2026-07-14", updated_at: "2026-07-14",
  artists: { name: "Mar Delgado" }, studios: null,
};

check("appointment maps to legacy view model with duration minutes", () => {
  const vm = appointmentToViewModel(mapDbAppointment(DB_APPT));
  assert.equal(vm.duration, 180);
  assert.equal(vm.status, "confirmed");
  assert.equal(vm.artistName, "Mar Delgado");
  assert.ok(vm.date instanceof Date);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx tsx scripts/check-booking.ts`
Expected: FAIL — no exported member `mapDbBookingRequest`.

- [ ] **Step 3: Append to `lib/supabase/booking-types.ts`**

```ts
// ─── Phase 2: requests + appointments ─────────────────────────────────────
import type {
  AppointmentLifecycleStatus,
  AppointmentRecord,
  AppointmentType,
  BookingRequestRecord,
  DepositStatus,
  ProposedTime,
  RequestStatus,
  SchedulingMode,
} from "@/lib/types/booking";
import type { Appointment, BookingRequest } from "@/lib/types";

interface EmbeddedName {
  name: string;
}

export interface DbBookingRequest {
  id: string;
  customer_id: string;
  customer_name: string | null;
  artist_id: string | null;
  studio_id: string | null;
  type: string;
  description: string;
  placement: string | null;
  size_category: string | null;
  budget_range: string | null;
  is_color: boolean | null;
  reference_image_urls: string[] | null;
  preferred_timing: string | null;
  flexible_dates: boolean;
  is_multi_session: boolean;
  estimated_sessions: number | null;
  status: RequestStatus;
  expires_at: string;
  response_message: string | null;
  quote_min_cents: number | null;
  quote_max_cents: number | null;
  deposit_cents: number | null;
  scheduling_mode: SchedulingMode | null;
  session_duration_min: number | null;
  proposed_times: ProposedTime[] | null;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
  artists?: EmbeddedName | null;
  studios?: EmbeddedName | null;
}

export interface DbAppointment {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  artist_id: string | null;
  studio_id: string | null;
  request_id: string | null;
  project_id: string | null;
  flash_item_id: string | null;
  type: AppointmentType;
  start_at: string;
  end_at: string;
  timezone: string;
  status: AppointmentLifecycleStatus;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  price_cents: number | null;
  deposit_cents: number;
  deposit_status: DepositStatus;
  deposit_provider: string | null;
  deposit_checkout_id: string | null;
  deposit_paid_at: string | null;
  hold_expires_at: string | null;
  notes: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
  artists?: EmbeddedName | null;
  studios?: EmbeddedName | null;
}

export function mapDbBookingRequest(row: DbBookingRequest): BookingRequestRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    artistId: row.artist_id ?? undefined,
    studioId: row.studio_id ?? undefined,
    artistName: row.artists?.name,
    studioName: row.studios?.name,
    description: row.description,
    placement: row.placement,
    sizeCategory: row.size_category,
    budgetRange: row.budget_range,
    isColor: row.is_color,
    referenceImageUrls: row.reference_image_urls ?? [],
    preferredTiming: row.preferred_timing,
    flexibleDates: row.flexible_dates,
    isMultiSession: row.is_multi_session,
    estimatedSessions: row.estimated_sessions,
    status: row.status,
    expiresAt: row.expires_at,
    responseMessage: row.response_message,
    quoteMinCents: row.quote_min_cents,
    quoteMaxCents: row.quote_max_cents,
    depositCents: row.deposit_cents,
    schedulingMode: row.scheduling_mode,
    sessionDurationMin: row.session_duration_min,
    proposedTimes: row.proposed_times ?? [],
    createdAt: row.created_at,
  };
}

export function mapDbAppointment(row: DbAppointment): AppointmentRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    artistId: row.artist_id ?? undefined,
    studioId: row.studio_id ?? undefined,
    artistName: row.artists?.name,
    studioName: row.studios?.name,
    requestId: row.request_id,
    type: row.type,
    startAt: row.start_at,
    endAt: row.end_at,
    timezone: row.timezone,
    status: row.status,
    priceCents: row.price_cents,
    depositCents: row.deposit_cents,
    depositStatus: row.deposit_status,
    notes: row.notes,
    customerNotes: row.customer_notes,
  };
}

/** Lazy expiry: a pending request past its window reads as expired between cron runs. */
export function effectiveRequestStatus(
  r: { status: RequestStatus; expiresAt: string },
  now: Date
): RequestStatus {
  if (r.status === "pending" && Date.parse(r.expiresAt) < now.getTime()) return "expired";
  return r.status;
}

// ─── Legacy view-model bridges (customer dashboard sections) ──────────────

export function requestToViewModel(r: BookingRequestRecord): BookingRequest {
  const summary = r.description.length > 140 ? `${r.description.slice(0, 140)}...` : r.description;
  return {
    id: r.id,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.createdAt),
    customerId: r.customerId,
    artistId: r.artistId ?? "",
    artistName: r.artistName ?? "Artist",
    studioId: r.studioId,
    studioName: r.studioName,
    flexibleDates: r.flexibleDates,
    status: effectiveRequestStatus(r, new Date()),
    summary,
  };
}

export function appointmentToViewModel(a: AppointmentRecord): Appointment {
  const legacyStatus =
    a.status === "pending_deposit" ? "pending" : a.status === "no_show" ? "cancelled" : a.status;
  return {
    id: a.id,
    createdAt: new Date(a.startAt),
    updatedAt: new Date(a.startAt),
    customerId: a.customerId ?? "",
    artistId: a.artistId ?? "",
    artistName: a.artistName ?? "Artist",
    studioId: a.studioId,
    studioName: a.studioName,
    date: new Date(a.startAt),
    duration: Math.round((Date.parse(a.endAt) - Date.parse(a.startAt)) / 60_000),
    status: legacyStatus,
  };
}
```

Note: `BaseEntity` in `lib/types/index.ts` defines `createdAt`/`updatedAt` — check its exact fields (`lib/types/index.ts` top) and match; if they are `Date`, the above is correct.

- [ ] **Step 4: Run checks**

Run: `npx tsx scripts/check-booking.ts && npx tsc --noEmit`
Expected: `29 checks passed`, tsc clean.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/booking-types.ts scripts/check-booking.ts
git commit -m "feat(booking): request/appointment mappers and legacy view-model bridges"
```

---

### Task 4: Migration 020 + data-access additions

**Files:**
- Create: `supabase/migrations/020_booking_requests.sql`
- Modify: `lib/data/supabase-booking.ts` (append)

**Interfaces:**
- Produces (used by Tasks 5-9):
  - DB: `booking_requests.customer_name`, `booking_requests.session_duration_min`, `booking-refs` storage bucket, pg_cron expiry job
  - `REQUEST_SELECT` constant: `"*, artists(name), studios(name)"`
  - `fetchCustomerRequests(supabase, customerId): Promise<BookingRequestRecord[]>`
  - `fetchArtistRequests(supabase, artistId): Promise<BookingRequestRecord[]>`
  - `fetchCustomerAppointments(supabase, customerId): Promise<AppointmentRecord[]>`
  - `fetchRequestById(supabase, id): Promise<BookingRequestRecord | null>`

- [ ] **Step 1: Write `supabase/migrations/020_booking_requests.sql`**

```sql
-- Phase 2 (custom requests): customer-name snapshot, session duration for
-- open-calendar scheduling, reference-image bucket, request-expiry cron.
-- Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md

-- Snapshot of the requester's display name; profiles RLS blocks cross-user
-- reads and PostgREST cannot embed through auth.users.
alter table public.booking_requests
  add column if not exists customer_name text;

-- Artist sets this on accept when opening the calendar; the slot picker and
-- server-side validation both derive slot length from it.
alter table public.booking_requests
  add column if not exists session_duration_min int
  check (session_duration_min is null or session_duration_min between 30 and 720);

-- ─── Reference images: public-read bucket, writers scoped to own folder ───
-- ponytail: public read like studio-images; uuid paths are unguessable.
-- Move to signed URLs if reference images ever need to be private.
insert into storage.buckets (id, name, public)
values ('booking-refs', 'booking-refs', true)
on conflict (id) do nothing;

create policy "booking refs public read" on storage.objects
  for select using (bucket_id = 'booking-refs');
create policy "booking refs auth upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'booking-refs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "booking refs owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'booking-refs' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Nightly request expiry (lazy read-side expiry covers the gap) ────────
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('expire-booking-requests');
exception when others then
  null; -- job did not exist yet
end $$;

select cron.schedule(
  'expire-booking-requests',
  '17 3 * * *',
  $$update public.booking_requests set status = 'expired'
    where status = 'pending' and expires_at < now()$$
);
```

- [ ] **Step 2: Push and verify**

Run: `supabase db push --dry-run` (expect only `020_booking_requests.sql`), then `supabase db push`.
Expected: `Applying migration 020_booking_requests.sql... Finished supabase db push.`
If pg_cron is unavailable on the plan, the migration fails — split the cron block into a comment and re-push (lazy expiry still guarantees correct reads).

- [ ] **Step 3: Append data access to `lib/data/supabase-booking.ts`**

```ts
import {
  type DbAppointment,
  type DbBookingRequest,
  mapDbAppointment,
  mapDbBookingRequest,
} from "@/lib/supabase/booking-types";
import type { AppointmentRecord, BookingRequestRecord } from "@/lib/types/booking";

export const REQUEST_SELECT = "*, artists(name), studios(name)";

export async function fetchCustomerRequests(
  supabase: SupabaseClient,
  customerId: string
): Promise<BookingRequestRecord[]> {
  const { data } = await supabase
    .from("booking_requests")
    .select(REQUEST_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbBookingRequest[]).map(mapDbBookingRequest);
}

export async function fetchArtistRequests(
  supabase: SupabaseClient,
  artistId: string
): Promise<BookingRequestRecord[]> {
  const { data } = await supabase
    .from("booking_requests")
    .select(REQUEST_SELECT)
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbBookingRequest[]).map(mapDbBookingRequest);
}

export async function fetchRequestById(
  supabase: SupabaseClient,
  id: string
): Promise<BookingRequestRecord | null> {
  const { data } = await supabase
    .from("booking_requests")
    .select(REQUEST_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapDbBookingRequest(data as DbBookingRequest) : null;
}

export async function fetchCustomerAppointments(
  supabase: SupabaseClient,
  customerId: string
): Promise<AppointmentRecord[]> {
  const { data } = await supabase
    .from("appointments")
    .select("*, artists(name), studios(name)")
    .eq("customer_id", customerId)
    .order("start_at", { ascending: true });
  return ((data ?? []) as DbAppointment[]).map(mapDbAppointment);
}
```

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit`

```bash
git add supabase/migrations/020_booking_requests.sql lib/data/supabase-booking.ts
git commit -m "feat(booking): migration 020 (refs bucket, expiry cron, request columns) + request data access"
```

---

### Task 5: Reference upload + slots API route

**Files:**
- Modify: `lib/utils/image-upload.ts` (append)
- Create: `app/api/booking/slots/route.ts`

**Interfaces:**
- Consumes: `compressImage`, `IMAGE_LIMITS`, `ERROR_MESSAGES` internals of image-upload.ts; Phase 1 engine + Task 1 `SlotsQuerySchema`; `lib/supabase/admin.ts` (check its export name first — read the file; assume `createAdminClient()`).
- Produces:
  - `uploadBookingReference(supabase, userId, file): Promise<{ ok: true; url: string } | { ok: false; error: string }>`
  - `GET /api/booking/slots?artistId&durationMin&from&to` → `{ slots: Slot[]; timezone: string }`

- [ ] **Step 1: Append to `lib/utils/image-upload.ts`**

```ts
const REFS_BUCKET = "booking-refs";

/** Reference-image upload for booking requests: {userId}/{uuid}.{ext} in booking-refs. */
export async function uploadBookingReference(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size > IMAGE_LIMITS.maxSourceBytes) {
    return { ok: false, error: ERROR_MESSAGES["too-large"]! };
  }
  try {
    const { blob, ext } = await compressImage(file, "gallery");
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(REFS_BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) return { ok: false, error: ERROR_MESSAGES["upload-failed"]! };
    const { data } = supabase.storage.from(REFS_BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    const key = e instanceof Error ? e.message : "upload-failed";
    return { ok: false, error: ERROR_MESSAGES[key] ?? ERROR_MESSAGES["upload-failed"]! };
  }
}
```

- [ ] **Step 2: Create `app/api/booking/slots/route.ts`**

First read `lib/supabase/admin.ts` for the exact admin-client export. Then:

```ts
import { NextResponse } from "next/server";
import { SlotsQuerySchema } from "@/lib/validation/schemas";
import { computeOpenSlots } from "@/lib/booking/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingSettings,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingSettings,
} from "@/lib/supabase/booking-types";

/**
 * Open slots for an artist. Admin client reads busy intervals (appointments
 * are RLS-protected) but the response contains only derived open slots —
 * no appointment data ever leaves this handler.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = SlotsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { artistId, durationMin, from, to } = parsed.data;

  const admin = createAdminClient();
  const [settingsRes, rulesRes, overridesRes, busyRes] = await Promise.all([
    admin.from("booking_settings").select("*").eq("artist_id", artistId).maybeSingle(),
    admin.from("availability_rules").select("*").eq("artist_id", artistId),
    admin.from("availability_overrides").select("*").eq("artist_id", artistId).gte("date", from).lte("date", to),
    admin
      .from("appointments")
      .select("start_at, end_at")
      .eq("artist_id", artistId)
      .in("status", ["pending_deposit", "confirmed"])
      // one-day pad so timezone-adjacent appointments still mask edge slots
      .gte("start_at", `${from}T00:00:00Z`)
      .lte("start_at", `${to}T23:59:59Z`),
  ]);

  if (!settingsRes.data) return NextResponse.json({ slots: [], timezone: "America/New_York" });
  const settings = mapDbBookingSettings(settingsRes.data as DbBookingSettings);
  if (!settings.acceptingBookings) return NextResponse.json({ slots: [], timezone: settings.timezone });

  const slots = computeOpenSlots({
    rules: ((rulesRes.data ?? []) as DbAvailabilityRule[]).map(mapDbAvailabilityRule).map((r) => ({
      weekday: r.weekday,
      startHm: r.startHm,
      endHm: r.endHm,
    })),
    overrides: ((overridesRes.data ?? []) as DbAvailabilityOverride[])
      .map(mapDbAvailabilityOverride)
      .map((o) => ({ date: o.date, closed: o.closed, startHm: o.startHm, endHm: o.endHm })),
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
    fromDate: from,
    toDate: to,
    now: new Date(),
  });

  return NextResponse.json({ slots, timezone: settings.timezone });
}
```

The busy-fetch date pad: widen by querying `gte("end_at", from - 1 day)` instead if simpler — what matters is that any active appointment overlapping the window is included. Implement as: `.gte("end_at", \`${from}T00:00:00Z\`)` and drop the `start_at` lower bound (end after window start AND start before window end).

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit && npm run lint` (booking files clean)

```bash
git add lib/utils/image-upload.ts app/api/booking/slots/route.ts
git commit -m "feat(booking): reference upload and open-slots API"
```

---

### Task 6: Server actions

**Files:**
- Create: `app/book/actions.ts`

**Interfaces:**
- Consumes: schemas (Task 1), `validateChosenTime` (Task 2), mappers (Task 3), `fetchRequestById` (Task 4), engine (Phase 1), server client `createClient` from `@/lib/supabase/server`, admin client.
- Produces (used by Tasks 7-9):
  - `submitBookingRequest(input: unknown): Promise<{ success: boolean; requestId?: string; error?: string }>`
  - `respondToBookingRequest(input: unknown): Promise<{ success: boolean; error?: string }>`
  - `scheduleFromRequest(input: unknown): Promise<{ success: boolean; appointmentId?: string; error?: string }>`
  - `withdrawBookingRequest(requestId: string): Promise<{ success: boolean; error?: string }>`

All four: authenticate via the user-scoped server client (RLS enforced on every read/write), verify the caller's role in the request, make transitions atomic with status-guarded updates, map `23P01` to the friendly slot-taken error.

- [ ] **Step 1: Create `app/book/actions.ts`**

```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  RespondToRequestSchema,
  ScheduleFromRequestSchema,
  SubmitBookingRequestSchema,
} from "@/lib/validation/schemas";
import { validateChosenTime } from "@/lib/booking/scheduling";
import { computeOpenSlots } from "@/lib/booking/availability";
import { zonedParts } from "@/lib/booking/tz";
import {
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingSettings,
  effectiveRequestStatus,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingSettings,
} from "@/lib/supabase/booking-types";
import { fetchRequestById } from "@/lib/data/supabase-booking";

interface ActionResult {
  success: boolean;
  error?: string;
}

const GENERIC_ERROR = "Something went wrong — try again.";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function submitBookingRequest(
  input: unknown
): Promise<ActionResult & { requestId?: string }> {
  const parsed = SubmitBookingRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to send a booking request." };

  // Artist must exist and be taking custom requests.
  const { data: settingsRow } = await supabase
    .from("booking_settings")
    .select("accepting_bookings, custom_requests_enabled")
    .eq("artist_id", parsed.data.artistId)
    .maybeSingle();
  if (!settingsRow || !settingsRow.accepting_bookings || !settingsRow.custom_requests_enabled) {
    return { success: false, error: "This artist is not taking requests right now." };
  }

  // Display-name snapshot (own profile is readable under RLS).
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();

  const d = parsed.data;
  const { data: created, error } = await supabase
    .from("booking_requests")
    .insert({
      customer_id: user.id,
      customer_name: profile?.name ?? user.email?.split("@")[0] ?? null,
      artist_id: d.artistId,
      description: d.description,
      placement: d.placement ?? null,
      size_category: d.sizeCategory ?? null,
      budget_range: d.budgetRange ?? null,
      is_color: d.color === undefined ? null : d.color === "color",
      reference_image_urls: d.referenceImageUrls,
      preferred_timing: d.preferredTiming ?? null,
      flexible_dates: d.flexibleDates,
      is_multi_session: d.isMultiSession,
      estimated_sessions: d.estimatedSessions ?? null,
    })
    .select("id")
    .single();
  if (error || !created) return { success: false, error: GENERIC_ERROR };
  return { success: true, requestId: created.id };
}

export async function respondToBookingRequest(input: unknown): Promise<ActionResult> {
  const parsed = RespondToRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };

  const request = await fetchRequestById(supabase, parsed.data.requestId);
  if (!request) return { success: false, error: "Request not found." };

  // Only the receiving artist (or a granted front desk, phase 5) may respond.
  const { data: artistRow } = await supabase
    .from("artists")
    .select("id")
    .eq("id", request.artistId ?? "")
    .or(`user_id.eq.${user.id},claimed_by.eq.${user.id}`)
    .maybeSingle();
  if (!artistRow) return { success: false, error: "Only the artist can respond to this request." };

  if (effectiveRequestStatus(request, new Date()) !== "pending") {
    return { success: false, error: "This request was already handled or expired." };
  }

  const d = parsed.data;
  const patch =
    d.action === "decline"
      ? { status: "declined", response_message: d.responseMessage ?? null }
      : {
          status: "accepted",
          response_message: d.responseMessage ?? null,
          quote_min_cents: d.quoteMinCents ?? null,
          quote_max_cents: d.quoteMaxCents ?? null,
          deposit_cents: d.depositCents ?? null,
          scheduling_mode: d.schedulingMode,
          session_duration_min: d.sessionDurationMin ?? null,
          proposed_times: d.proposedTimes,
        };

  // Atomic transition: only lands if still pending.
  const { data: updated, error } = await supabase
    .from("booking_requests")
    .update(patch)
    .eq("id", d.requestId)
    .eq("status", "pending")
    .select("id");
  if (error) return { success: false, error: GENERIC_ERROR };
  if (!updated || updated.length === 0) {
    return { success: false, error: "This request was already handled." };
  }
  return { success: true };
}

export async function withdrawBookingRequest(requestId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };
  const { data: updated, error } = await supabase
    .from("booking_requests")
    .update({ status: "withdrawn" })
    .eq("id", requestId)
    .eq("customer_id", user.id)
    .eq("status", "pending")
    .select("id");
  if (error) return { success: false, error: GENERIC_ERROR };
  if (!updated || updated.length === 0) return { success: false, error: "This request can no longer be withdrawn." };
  return { success: true };
}

export async function scheduleFromRequest(
  input: unknown
): Promise<ActionResult & { appointmentId?: string }> {
  const parsed = ScheduleFromRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };

  const request = await fetchRequestById(supabase, parsed.data.requestId);
  if (!request || request.customerId !== user.id) return { success: false, error: "Request not found." };
  if (request.status !== "accepted" || !request.schedulingMode || !request.artistId) {
    return { success: false, error: "This request is not ready to schedule." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();

  let openSlots: { startAt: string; endAt: string }[] = [];
  let timezone = "America/New_York";
  const admin = createAdminClient();
  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", request.artistId)
    .maybeSingle();
  if (settingsRow) timezone = (settingsRow as DbBookingSettings).timezone;

  if (request.schedulingMode === "open_calendar") {
    if (!settingsRow) return { success: false, error: "This artist has no availability set up." };
    const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
    // Recompute slots for the chosen local day only, server-side.
    const p = zonedParts(new Date(chosen.startAt), settings.timezone);
    const localDate = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
    const [rulesRes, overridesRes, busyRes] = await Promise.all([
      admin.from("availability_rules").select("*").eq("artist_id", request.artistId),
      admin.from("availability_overrides").select("*").eq("artist_id", request.artistId).eq("date", localDate),
      admin
        .from("appointments")
        .select("start_at, end_at")
        .eq("artist_id", request.artistId)
        .in("status", ["pending_deposit", "confirmed"])
        .gte("end_at", `${localDate}T00:00:00Z`)
        .lte("start_at", `${localDate}T23:59:59Z`),
    ]);
    openSlots = computeOpenSlots({
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
      durationMin: request.sessionDurationMin ?? 180,
      fromDate: localDate,
      toDate: localDate,
      now,
    });
  }

  const verdict = validateChosenTime({
    mode: request.schedulingMode,
    proposedTimes: request.proposedTimes,
    openSlots,
    chosen,
    now,
  });
  if (!verdict.ok) return { success: false, error: verdict.error };

  const { data: created, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: user.id,
      customer_name: request.customerName,
      artist_id: request.artistId,
      request_id: request.id,
      type: "session",
      start_at: chosen.startAt,
      end_at: chosen.endAt,
      timezone,
      status: "confirmed",
      deposit_cents: request.depositCents ?? 0,
      deposit_status: "not_required", // phase 4 wires real deposits
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
```

Note on propose-mode collisions: a proposed time may have been taken by another booking after the artist offered it — the exclusion constraint rejects it with `23P01` and the customer picks a different offered time. That is the designed behavior, not a bug.

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit`

```bash
git add app/book/actions.ts
git commit -m "feat(booking): server actions for submit/respond/withdraw/schedule"
```

---

### Task 7: Booking page + artist-page CTA wiring

**Files:**
- Create: `app/book/[id]/page.tsx`
- Create: `components/booking/request-flow.tsx`
- Modify: `components/booking/index.tsx` (export)
- Modify: `components/ui/button.tsx` (add `href` rendering a Next `Link` with identical classes)
- Modify: `app/artists/[id]/page.tsx:154-157, 228-235` (wire both Book CTAs)

**Interfaces:**
- Consumes: `submitBookingRequest`, `uploadBookingReference`, `useAuth` from `@/components/providers/auth-provider`, `getArtistByIdFromDb` from `@/lib/data/supabase-artists`, `fetchBookingSettings`.
- Produces: `/book/[id]` route (id = same identifier the artist page uses); `BookingRequestFlow` client component.

- [ ] **Step 1: Add `href` support to `components/ui/button.tsx`**

Read the file. Keep the exact class computation; add to props `href?: string`, and before the `<button>` return:

```tsx
if (href) {
  return (
    <Link href={href} className={composedClassName}>
      {content}
    </Link>
  );
}
```

where `composedClassName`/`content` are whatever the existing implementation computes (match its internals — including any `statusDot` span — so the link renders pixel-identical). Import `Link` from `next/link`. If the file's structure makes sharing `content` awkward, extract the inner JSX to a local variable first.

- [ ] **Step 2: Create `app/book/[id]/page.tsx`** (Server Component)

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArtistByIdFromDb } from "@/lib/data/supabase-artists";
import { fetchBookingSettings } from "@/lib/data/supabase-booking";
import { BookingRequestFlow } from "@/components/booking";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Request a booking | Inked Market" };

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const artist = await getArtistByIdFromDb(supabase, id);
  if (!artist) notFound();

  const settings = await fetchBookingSettings(supabase, { artistId: artist.id });
  const open = Boolean(settings?.acceptingBookings && settings?.customRequestsEnabled);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <BookingRequestFlow
        artistId={artist.id}
        artistName={artist.name}
        acceptingRequests={open}
      />
    </main>
  );
}
```

Check `getArtistByIdFromDb`'s actual signature/return in `lib/data/supabase-artists.ts` first and adapt the property names (`artist.id`, `artist.name`).

- [ ] **Step 3: Create `components/booking/request-flow.tsx`**

Client component, three states: form → success; signed-out and not-accepting short-circuits. Complete structure:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { uploadBookingReference } from "@/lib/utils/image-upload";
import { submitBookingRequest } from "@/app/book/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

const SIZES = [
  { value: "small", label: "Small (under 3 in)" },
  { value: "medium", label: "Medium (3-6 in)" },
  { value: "large", label: "Large (6-10 in)" },
  { value: "xl", label: "Extra large / multi-region" },
] as const;

const BUDGETS = [
  { value: "under-300", label: "Under $300" },
  { value: "300-600", label: "$300 - $600" },
  { value: "600-1200", label: "$600 - $1,200" },
  { value: "1200-plus", label: "$1,200+" },
] as const;

interface BookingRequestFlowProps {
  artistId: string;
  artistName: string;
  acceptingRequests: boolean;
}

export function BookingRequestFlow({ artistId, artistName, acceptingRequests }: BookingRequestFlowProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [placement, setPlacement] = useState("");
  const [size, setSize] = useState("");
  const [budget, setBudget] = useState("");
  const [color, setColor] = useState<"color" | "black-grey" | "">("");
  const [timing, setTiming] = useState("");
  const [flexible, setFlexible] = useState(true);
  const [multiSession, setMultiSession] = useState(false);
  const [refs, setRefs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!acceptingRequests) {
    return (
      <p className="text-[14px] text-ink-black/60 dark:text-ink-cream/60">
        {artistName} is not taking custom requests right now.
      </p>
    );
  }
  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-medium">Request a booking with {artistName}</h1>
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">Sign in to send a request.</p>
        <Button href="/login">Sign in</Button>
      </div>
    );
  }
  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-medium">Request sent</h1>
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">
          {artistName} will review your idea and reply with a quote and times. Track it from your dashboard.
        </p>
        <Button href="/dashboard">Go to dashboard</Button>
      </div>
    );
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    for (const file of Array.from(files).slice(0, 5 - refs.length)) {
      const result = await uploadBookingReference(supabase, user.id, file);
      if (result.ok) setRefs((prev) => [...prev, result.url]);
      else setError(result.error);
    }
    setUploading(false);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const result = await submitBookingRequest({
      artistId,
      description,
      placement: placement || undefined,
      sizeCategory: size || undefined,
      budgetRange: budget || undefined,
      color: color || undefined,
      referenceImageUrls: refs,
      preferredTiming: timing || undefined,
      flexibleDates: flexible,
      isMultiSession: multiSession,
    });
    setSubmitting(false);
    if (result.success) setDone(true);
    else setError(result.error ?? "Something went wrong.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Request a booking with {artistName}</h1>

      <Textarea
        label="Describe your idea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Subject, style, references you love, anything the artist should know (20+ characters)"
        rows={5}
      />

      {/* placement / size / budget / color — native selects, same row style as the settings panel */}
      ...four labeled selects using SIZES, BUDGETS, a free placement text input,
      and a color pair ("color" | "black-grey") — reuse the SelectRow pattern
      from components/booking/booking-settings-panel.tsx by extracting it into
      components/booking/form-rows.tsx (export SelectRow, ToggleRow, FieldLabel)
      and importing it in BOTH files. That extraction is part of this task.

      {/* reference upload: native file input, up to 5 */}
      <div>
        <p className="font-mono text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
          Reference images ({refs.length}/5)
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || refs.length >= 5}
          onChange={(e) => void handleFiles(e.target.files)}
          className="mt-2 block w-full text-[12px]"
        />
        {refs.length > 0 ? (
          <div className="mt-2 flex gap-2">
            {refs.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="Reference" className="h-16 w-16 rounded-lg object-cover" />
            ))}
          </div>
        ) : null}
      </div>

      {/* timing + toggles */}
      ...preferred timing text input; ToggleRow "Flexible on dates";
      ToggleRow "This is a multi-session project (sleeve, back piece)"

      {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}

      <Button
        onClick={() => void submit()}
        disabled={submitting || uploading || description.trim().length < 20}
        className="min-h-[44px] w-full"
      >
        {submitting ? "Sending..." : "Send request"}
      </Button>
    </div>
  );
}
```

The two `...` blocks above are shorthand IN THE PLAN ONLY for repeated SelectRow/ToggleRow/labeled-input rows whose exact pattern is fully specified in `components/booking/booking-settings-panel.tsx` — extract `FieldLabel`, `ToggleRow`, `SelectRow` into `components/booking/form-rows.tsx`, update the settings panel to import them, and compose the four selects and two toggles from those primitives with the option arrays given above. No new patterns are introduced.

- [ ] **Step 4: Wire artist-page CTAs**

In `app/artists/[id]/page.tsx`, both Book buttons get `href`:

```tsx
<Button variant="ink-red" size="sm" statusDot="bg-ink-cream shadow-ink-cream-glow" href={`/book/${id}`}>
  Book Consultation
</Button>
```

(and the same `href={`/book/${id}`}` on the "Book a Date" button — `id` is the page's route param, already in scope.)

- [ ] **Step 5: Export from barrel, typecheck, lint, commit**

`components/booking/index.tsx`: add `export { BookingRequestFlow } from "./request-flow";`

Run: `npx tsc --noEmit && npm run lint` (booking files clean)

```bash
git add components/ui/button.tsx components/booking/ app/book/ app/artists/
git commit -m "feat(booking): request flow page and artist page CTAs"
```

---

### Task 8: Artist requests inbox

**Files:**
- Create: `components/booking/use-artist-requests.ts`
- Create: `components/booking/artist-requests-section.tsx`
- Create: `components/booking/request-detail-panel.tsx`
- Modify: `components/booking/index.tsx`
- Modify: `components/dashboard/artist/artist-dashboard.tsx` (render section in rightColumn above `<ArtistBioSection>`, panel in panels)

**Interfaces:**
- Consumes: `fetchArtistRequests`, `resolveBookingEntity`, `respondToBookingRequest`, `effectiveRequestStatus`, view types from Task 1; `DashboardSection`, `EmptyState`, `StatusBadge`/`BADGE_COLORS`, `SlideOverPanel`, form rows from Task 7.
- Produces: `useArtistRequests()` returning `{ pending, others, loading, selected, setSelected, respond, responding, refresh }`; `<ArtistRequestsSection requests onSelect>`; `<RequestDetailPanel request onClose onRespond responding>`.

- [ ] **Step 1: `components/booking/use-artist-requests.ts`**

```ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchArtistRequests, resolveBookingEntity } from "@/lib/data/supabase-booking";
import { respondToBookingRequest } from "@/app/book/actions";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import type { BookingRequestRecord } from "@/lib/types/booking";
import type { RespondToRequestInput } from "@/lib/validation/schemas";

export function useArtistRequests() {
  const supabaseRef = useRef(createClient());
  const [requests, setRequests] = useState<BookingRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BookingRequestRecord | null>(null);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = supabaseRef.current;
    const entity = await resolveBookingEntity(supabase);
    if (!entity?.artistId) {
      setLoading(false);
      return;
    }
    setRequests(await fetchArtistRequests(supabase, entity.artistId));
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void load().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const now = new Date();
  const pending = useMemo(
    () => requests.filter((r) => effectiveRequestStatus(r, now) === "pending"),
    [requests, now]
  );
  const others = useMemo(
    () => requests.filter((r) => effectiveRequestStatus(r, now) !== "pending"),
    [requests, now]
  );

  const respond = useCallback(
    async (input: RespondToRequestInput) => {
      setResponding(true);
      setError(null);
      const result = await respondToBookingRequest(input);
      setResponding(false);
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return false;
      }
      setSelected(null);
      await load();
      return true;
    },
    [load]
  );

  return { pending, others, loading, selected, setSelected, respond, responding, error };
}
```

(`now` inside `useMemo` deps: acceptable — recompute on requests change; do NOT put `new Date()` in deps. If lint complains about `now`, compute both lists in one `useMemo(() => {...}, [requests])` that creates `now` internally.)

- [ ] **Step 2: `components/booking/artist-requests-section.tsx`**

List modeled directly on `customer-booking-requests-section.tsx` (DashboardSection + EmptyState + StatusBadge rows): title "Booking Requests" with pending count badge, each row = customer_name + line-clamped description + budget/size chips, `onClick={() => onSelect(request)}`. Rows are `<button type="button">` full-width for a11y. Empty state: message "No requests yet", description "Requests land here when clients find you".

- [ ] **Step 3: `components/booking/request-detail-panel.tsx`**

`SlideOverPanel` titled "Booking Request", showing: customer name, created date, full description, placement/size/budget/color chips, reference image thumbnails (grid of `<img>` — the repo disables next/image for storage thumbs elsewhere with the eslint-disable comment pattern from Task 7), multi-session flag. For a `pending` request, two modes toggled by local state:

- **Accept form**: response message Textarea; quote min/max as two SelectRows ($ presets: none/100/200/…/2000 → cents); deposit SelectRow (reuse the default-deposit options from the settings panel; default = artist's `default_deposit_cents` is NOT available here — use the request's plain options, artist can pick); scheduling mode SelectRow (`propose` | `open_calendar`); if propose → up to 3 rows of two native `datetime-local` inputs (start, end) with add/remove; if open_calendar → session length SelectRow (60/120/180/240/300/360 min). Submit button calls `onRespond({ action: "accept", requestId, ...})` — convert `datetime-local` values to ISO with `new Date(value).toISOString()`.
- **Decline**: optional reason Textarea + confirm button calling `onRespond({ action: "decline", requestId, responseMessage })`.

For non-pending requests: read-only status view (StatusBadge + response message + quote + proposed times).

- [ ] **Step 4: Wire into `artist-dashboard.tsx`**

```tsx
import { ArtistRequestsSection, RequestDetailPanel } from "@/components/booking";
// in the component:
const artistRequests = useArtistRequests();
// rightColumn, above <ArtistBioSection>:
<ArtistRequestsSection
  pending={artistRequests.pending}
  others={artistRequests.others}
  loading={artistRequests.loading}
  onSelect={artistRequests.setSelected}
/>
// panels:
<RequestDetailPanel
  request={artistRequests.selected}
  onClose={() => artistRequests.setSelected(null)}
  onRespond={artistRequests.respond}
  responding={artistRequests.responding}
  error={artistRequests.error}
/>
```

- [ ] **Step 5: Barrel exports, typecheck, lint, commit**

```bash
git add components/booking/ components/dashboard/artist/artist-dashboard.tsx
git commit -m "feat(booking): artist requests inbox with accept/decline"
```

---

### Task 9: Customer side — live data, request panel, slot picker

**Files:**
- Create: `components/booking/slot-picker.tsx`
- Create: `components/booking/customer-request-panel.tsx`
- Modify: `components/dashboard/customer/hooks/use-customer-data.ts` (live requests + appointments)
- Modify: `components/dashboard/customer/customer-booking-requests-section.tsx` (add `onSelect` prop, row click)
- Modify: `components/dashboard/customer/customer-dashboard.tsx` (render panel; check how sections receive data and pass through)
- Modify: `components/booking/index.tsx`

**Interfaces:**
- Consumes: `fetchCustomerRequests`, `fetchCustomerAppointments`, `requestToViewModel`, `appointmentToViewModel`, `scheduleFromRequest`, `withdrawBookingRequest`, `/api/booking/slots`.
- Produces: `SlotPicker` (fetches open slots for artist+duration+day range, renders day strip + slot buttons, `onPick(slot)`), `CustomerRequestPanel` (status view, proposed-time cards, open-calendar picker, withdraw).

- [ ] **Step 1: `components/booking/slot-picker.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Slot } from "@/lib/booking/availability";
import { zonedParts } from "@/lib/booking/tz";

interface SlotPickerProps {
  artistId: string;
  durationMin: number;
  onPick: (slot: Slot) => void;
  disabled?: boolean;
}

function fmtDay(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
}

export function SlotPicker({ artistId, durationMin, onPick, disabled }: SlotPickerProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [timezone, setTimezone] = useState("America/New_York");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const from = new Date().toISOString().slice(0, 10);
      const to = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
      const res = await fetch(
        `/api/booking/slots?artistId=${artistId}&durationMin=${durationMin}&from=${from}&to=${to}`
      );
      if (cancelled) return;
      if (res.ok) {
        const body = (await res.json()) as { slots: Slot[]; timezone: string };
        if (!cancelled) {
          setSlots(body.slots);
          setTimezone(body.timezone);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [artistId, durationMin]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const p = zonedParts(new Date(s.startAt), timezone);
      const day = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return map;
  }, [slots, timezone]);

  const days = useMemo(() => Array.from(byDay.keys()).sort(), [byDay]);
  const activeDay = selectedDay ?? days[0] ?? null;

  if (loading) return <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">Loading times...</p>;
  if (days.length === 0)
    return <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">No open times in the next 30 days.</p>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`min-h-[44px] shrink-0 rounded-full border px-4 font-mono text-[11px] ${
              day === activeDay
                ? "border-ink-rust text-ink-rust"
                : "border-ink-black/[0.08] text-ink-black/60 dark:border-ink-cream/[0.08] dark:text-ink-cream/60"
            }`}
          >
            {fmtDay(day)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(activeDay ? byDay.get(activeDay) ?? [] : []).map((slot) => (
          <button
            key={slot.startAt}
            type="button"
            disabled={disabled}
            onClick={() => onPick(slot)}
            className="min-h-[44px] rounded-lg border border-ink-black/[0.08] font-mono text-[11px] hover:border-ink-rust disabled:opacity-40 dark:border-ink-cream/[0.08]"
          >
            {fmtTime(slot.startAt, timezone)}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `components/booking/customer-request-panel.tsx`**

`SlideOverPanel` "Your Request": StatusBadge, description, artist reply (`responseMessage`), quote range (`$min - $max` from cents), deposit ask. Behavior by state:
- `pending`: Withdraw button → `withdrawBookingRequest(id)` → onChanged().
- `accepted` + `schedulingMode === "propose"`: proposed-time cards (formatted with the request's artist timezone — fetch not needed; format in viewer's local time with `toLocaleString`), tap → confirm dialog inline → `scheduleFromRequest({ requestId, startAt, endAt })`; on success show "Booked!" and call `onChanged()`. On the specific error "That time was just taken — pick another." keep the panel open, show it.
- `accepted` + `open_calendar`: `<SlotPicker artistId durationMin={sessionDurationMin ?? 180} onPick={...same schedule call} />`.
- terminal states: read-only.

Also show a "Scheduled" line when the customer's appointments (passed as prop `scheduledRequestIds: Set<string>`) already include this request — hide scheduling UI then.

- [ ] **Step 3: Live data in `use-customer-data.ts`**

Replace the two mock lines for appointments/bookingRequests with live state (keep every other mock intact):

```ts
const [appointmentRecords, setAppointmentRecords] = useState<AppointmentRecord[]>([]);
const [requestRecords, setRequestRecords] = useState<BookingRequestRecord[]>([]);

useEffect(() => {
  if (!userId) return;
  let cancelled = false;
  const supabase = createClient();
  void Promise.all([
    fetchCustomerAppointments(supabase, userId),
    fetchCustomerRequests(supabase, userId),
  ]).then(([appts, reqs]) => {
    if (cancelled) return;
    setAppointmentRecords(appts);
    setRequestRecords(reqs);
  });
  return () => {
    cancelled = true;
  };
}, [userId]);

const appointments = useMemo(() => appointmentRecords.map(appointmentToViewModel), [appointmentRecords]);
const bookingRequests = useMemo(() => requestRecords.map(requestToViewModel), [requestRecords]);
```

Also return `requestRecords` and a `refreshBooking` callback (re-runs the same fetch) so the customer panel can act on raw records and refresh after scheduling/withdrawal. Add imports (`createClient`, fetchers, mappers, record types). Keep the existing derived `upcomingAppointments`/`pastAppointments` memos untouched — they consume the same `appointments` variable.

- [ ] **Step 4: Row click + panel render**

`customer-booking-requests-section.tsx`: add `onSelect?: (id: string) => void` prop; wrap each row's content in `<button type="button" onClick={() => onSelect?.(request.id)}>` (full-width, text-left). `customer-dashboard.tsx`: find where `<CustomerBookingRequestsSection requests={...}>` renders, add selected-request state, pass `onSelect`, render `<CustomerRequestPanel request={...} onClose onChanged={refreshBooking} scheduledRequestIds={...}/>` next to the other panels. `scheduledRequestIds` = `new Set(appointmentRecords.map(a => a.requestId).filter(Boolean))` — expose from the hook.

- [ ] **Step 5: Typecheck, lint, checks, commit**

Run: `npx tsx scripts/check-booking.ts && npx tsc --noEmit && npm run lint`

```bash
git add components/booking/ components/dashboard/customer/
git commit -m "feat(booking): customer live requests/appointments with scheduling"
```

---

### Task 10: Final verification sweep

- [ ] **Step 1: Full check run**

```bash
npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint
```

Expected: 29 booking checks, 44 builder checks, tsc clean, lint error count unchanged from baseline (17 pre-existing).

- [ ] **Step 2: End-to-end smoke via service role** (no dev server)

Write a throwaway scratchpad script (service role) that: creates a request row as a fake customer against a real artist row, transitions it accepted with proposed times (direct SQL-style updates through supabase-js), inserts the appointment for a proposed time, verifies the exclusion constraint still blocks a second overlapping insert, then deletes everything it created. Assert each step. Delete the script after it passes.

- [ ] **Step 3: Report manual verification steps for Tanner**

Customer: artist page → Book → sign in → submit brief with a reference image → dashboard shows request pending. Artist: dashboard inbox badge → open request → accept with 2 proposed times (or open calendar + duration) → customer dashboard → request accepted → tap a time → appointment appears under Upcoming. Withdraw path: new request → withdraw.

- [ ] **Step 4: Commit any sweep fixes**

```bash
git add <specific files> && git commit -m "fix(booking): phase 2 verification sweep"
```

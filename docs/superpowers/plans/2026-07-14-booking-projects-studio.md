# Booking Phase 5 (Projects + Studio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Multi-session projects (created on accept, sessions linked, repeat scheduling), the studio operational side (front-desk grant, quick-add, roster schedule, walk-ins), and appointment lifecycle actions (complete / no-show / cancel with policy-aware `refund_due`).

**Architecture:** No new migration — every table shipped in 019/021. Projects are created by `respondToBookingRequest` on multi-session accepts and linked by `scheduleFromRequest`. Walk-ins are front-desk quick-add appointments (studio-only rows, no overlap constraint by design); customer-facing ONLINE studio slot-booking is deliberately deferred — a walk-in by definition doesn't pre-book, and the front desk is the real-world walk-in pipeline. The cancellation refund decision is a pure, checked function; all lifecycle transitions remain status-guarded UPDATEs under RLS (studio writes ride the `studio_manages_artist` grant policies from migration 019).

**Tech Stack:** Established stack only. All UI composes existing booking components and dashboard patterns.

## Global Constraints

- Supabase project `cktvpfenygxhfaodihbz` ONLY. No `npm run dev`/`build` (user's server on :3002).
- No emoji in code. No AI attribution in commits.
- Verification loop: `npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint` (baseline: 17 pre-existing lint errors). `noUncheckedIndexedAccess` on; ternaries for conditional JSX; inline-IIFE effects with cancellation.
- Transitions: status-guarded UPDATEs checked for affected rows; `23P01` → friendly error. Mutations with cross-row invariants are server actions; simple own-row RLS writes may use the client pattern.
- Front desk can book OUTSIDE online availability windows (phone-booking judgment call) — only the exclusion constraint guards artist rows. This is deliberate; say so in a comment.

---

### Task 1: Types, schemas, refund decision (TDD)

**Files:**
- Modify: `lib/types/booking.ts` (append `ProjectRecord`, `ProjectStatus`)
- Modify: `lib/validation/schemas.ts` (append `FrontDeskSchema`, `CancelAppointmentSchema`)
- Create: `lib/booking/lifecycle.ts` (`refundDecision`)
- Modify: `lib/supabase/booking-types.ts` (append `DbProject`, `mapDbProject`)
- Modify: `scripts/check-booking.ts` (+3 checks → 39)

**Interfaces:**
- `ProjectStatus = "active" | "completed" | "cancelled" | "paused"`; `ProjectRecord { id; requestId: string | null; customerId: string | null; artistId?: string; title; status: ProjectStatus; estimatedSessions: number | null; notes: string | null }`
- `FrontDeskSchema`: `{ artistId?: uuid; walkIn: boolean; customerName: string 1..80 trimmed; type: "walk_in" | "session" | "consultation"; startAt: iso; durationMin: int 15..720; notes?: string max 500 }` + `.superRefine`: exactly one of `artistId` / `walkIn === true`; `walkIn` requires `type === "walk_in"`; an `artistId` target forbids `type === "walk_in"`.
- `CancelAppointmentSchema`: `{ appointmentId: uuid; reason?: string max 300 }`
- `refundDecision(input: { depositStatus: DepositStatus; cancelledBy: "customer" | "artist" | "studio"; startAt: string; cancellationWindowHours: number; now: Date }): "refund_due" | "forfeit" | "none"` — `none` unless `depositStatus === "paid"`; provider cancels (`artist`/`studio`) → always `refund_due`; customer cancels → `refund_due` iff `now <= startAt - windowHours`, else `forfeit` (deposit stays `paid`, artist keeps it).

- [ ] **Step 1: Append failing checks**

```ts
// ─── phase 5: projects + lifecycle ───────────────────────────────────────
import { refundDecision } from "../lib/booking/lifecycle";
import { FrontDeskSchema } from "../lib/validation/schemas";
import { mapDbProject, type DbProject } from "../lib/supabase/booking-types";

check("refundDecision honors payer, policy window, and deposit state", () => {
  const base = {
    depositStatus: "paid" as const,
    startAt: "2026-08-01T17:00:00Z",
    cancellationWindowHours: 48,
  };
  const early = new Date("2026-07-28T17:00:00Z");
  const late = new Date("2026-07-31T12:00:00Z"); // inside 48h window
  assert.equal(refundDecision({ ...base, cancelledBy: "customer", now: early }), "refund_due");
  assert.equal(refundDecision({ ...base, cancelledBy: "customer", now: late }), "forfeit");
  assert.equal(refundDecision({ ...base, cancelledBy: "artist", now: late }), "refund_due");
  assert.equal(refundDecision({ ...base, cancelledBy: "studio", now: late }), "refund_due");
  assert.equal(
    refundDecision({ ...base, depositStatus: "pending", cancelledBy: "customer", now: early }),
    "none"
  );
});

check("FrontDeskSchema enforces target XOR and walk-in typing", () => {
  const uuid = "6f9619ff-8b86-4d01-b42d-00c04fc964ff";
  const base = { customerName: "Sam", startAt: "2026-08-01T17:00:00Z", durationMin: 60 };
  assert.ok(FrontDeskSchema.safeParse({ ...base, artistId: uuid, walkIn: false, type: "session" }).success);
  assert.ok(FrontDeskSchema.safeParse({ ...base, walkIn: true, type: "walk_in" }).success);
  assert.ok(!FrontDeskSchema.safeParse({ ...base, walkIn: false, type: "session" }).success); // no target
  assert.ok(!FrontDeskSchema.safeParse({ ...base, artistId: uuid, walkIn: true, type: "walk_in" }).success); // both
  assert.ok(!FrontDeskSchema.safeParse({ ...base, artistId: uuid, walkIn: false, type: "walk_in" }).success); // artist walk-in
  assert.ok(!FrontDeskSchema.safeParse({ ...base, walkIn: true, type: "session" }).success); // walk-in mistyped
});

const DB_PROJECT: DbProject = {
  id: "p1", request_id: "r1", customer_id: "u1", artist_id: "a1", studio_id: null,
  title: "Dragon half sleeve", status: "active", estimated_sessions: 4, notes: null,
  created_at: "2026-07-14", updated_at: "2026-07-14",
};

check("project maps db->domain", () => {
  const p = mapDbProject(DB_PROJECT);
  assert.equal(p.artistId, "a1");
  assert.equal(p.estimatedSessions, 4);
  assert.equal(p.status, "active");
});
```

- [ ] **Step 2: Verify failure** (`Cannot find module '../lib/booking/lifecycle'`), **Step 3: implement** all four files per the interfaces (`lifecycle.ts` complete):

```ts
import type { DepositStatus } from "@/lib/types/booking";

/**
 * What happens to a PAID deposit on cancellation. Provider-initiated
 * cancellations always owe a refund; customer cancellations honor the
 * artist's cancellation window (inside the window the deposit is forfeited
 * — that is the whole point of deposits).
 */
export function refundDecision(input: {
  depositStatus: DepositStatus;
  cancelledBy: "customer" | "artist" | "studio";
  startAt: string;
  cancellationWindowHours: number;
  now: Date;
}): "refund_due" | "forfeit" | "none" {
  if (input.depositStatus !== "paid") return "none";
  if (input.cancelledBy !== "customer") return "refund_due";
  const cutoffMs = Date.parse(input.startAt) - input.cancellationWindowHours * 3_600_000;
  return input.now.getTime() <= cutoffMs ? "refund_due" : "forfeit";
}
```

`FrontDeskSchema` (in schemas.ts — plain objects, cross-field rules in `.superRefine` per the zod v3 rule already noted there):

```ts
export const FrontDeskSchema = z
  .object({
    artistId: z.string().uuid().optional(),
    walkIn: z.boolean().default(false),
    customerName: z.string().trim().min(1).max(80),
    type: z.enum(["walk_in", "session", "consultation"]),
    startAt: isoDatetime,
    durationMin: z.number().int().min(15).max(720),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((d, ctx) => {
    const hasArtist = d.artistId !== undefined;
    if (hasArtist === d.walkIn) {
      ctx.addIssue({ code: "custom", message: "Pick an artist or a walk-in, not both" });
    }
    if (d.walkIn && d.type !== "walk_in") {
      ctx.addIssue({ code: "custom", message: "Studio-level bookings are walk-ins" });
    }
    if (hasArtist && d.type === "walk_in") {
      ctx.addIssue({ code: "custom", message: "Walk-ins are not tied to an artist" });
    }
  });
export type FrontDeskInput = z.infer<typeof FrontDeskSchema>;

export const CancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z.string().trim().max(300).optional(),
});
```

`DbProject` mirrors migration 019's projects columns; `mapDbProject` follows the existing mapper style.

- [ ] **Step 4: Verify** `39 checks passed`, tsc clean. **Step 5: Commit** `feat(booking): project types, front-desk schema, refund decision`.

---

### Task 2: Data access — roster, grants, projects

**Files:**
- Modify: `lib/data/supabase-booking.ts` (append)

**Interfaces (produces, all following the file's existing style):**
- `fetchRosterAppointments(supabase, studioId: string, artistIds: string[]): Promise<AppointmentRecord[]>` — active (`pending_deposit`/`confirmed`) appointments with `end_at >= now`, `artist_id in artistIds` OR `studio_id = studioId`, ordered by `start_at`, limit 30. Use `.or(\`artist_id.in.(${artistIds.join(",")}),studio_id.eq.${studioId}\`)`; when `artistIds` is empty filter on `studio_id` only. RLS: studio owner reads roster rows via `studio_reads_artist` + own studio rows.
- `fetchOwnGrantRows(supabase, artistId): Promise<{ id: string; manageBookings: boolean; studioName: string }[]>` — `affiliations` select `id, manage_bookings, studios(name)` where `artist_id` and `status = 'active'`.
- `setManageBookings(supabase, affiliationId: string, value: boolean): Promise<void>` — plain update (RLS "Parties manage affiliations" lets the artist write it).
- `fetchProjectByRequest(supabase, requestId): Promise<ProjectRecord | null>`.
- `countRequestSessions(supabase, requestId): Promise<number>` — `appointments` count (head: true) where `request_id` and status in active+completed (`pending_deposit`, `confirmed`, `completed`).

- [ ] **Step 1: Implement** (complete code in the file's established fetch/map style; `count` via `{ count: "exact", head: true }`). **Step 2:** tsc + commit `feat(booking): roster, grant, and project data access`.

---

### Task 3: Projects wired into request lifecycle

**Files:**
- Modify: `app/book/actions.ts` (`respondToBookingRequest`, `scheduleFromRequest`)
- Modify: `components/booking/customer-request-panel.tsx` (multi-session repeat scheduling + progress)
- Modify: `components/booking/request-detail-panel.tsx` (multi-session progress line for the artist)
- Modify: `components/dashboard/customer/customer-dashboard.tsx` (pass `sessionCount`)

**Behavior contract:**
1. `respondToBookingRequest` accept branch, AFTER the status-guarded transition succeeds: if `request.isMultiSession`, admin-insert a project `{ request_id, customer_id, artist_id, title: request.description.slice(0, 60), estimated_sessions: request.estimatedSessions, status: "active" }`. The transition's 1-row guarantee makes this run at most once — no dedup needed.
2. `scheduleFromRequest`, after appointment insert: if `request.isMultiSession`, `fetchProjectByRequest` (admin) and UPDATE the appointment's `project_id` (admin). No project → skip silently.
3. `CustomerRequestPanel` gains `sessionCount: number` prop. Scheduling UI visibility: currently hidden when `scheduled`; new rule — for `isMultiSession` requests with `schedulingMode === "open_calendar"`, scheduling stays available; the "Scheduled" box shows "Sessions booked: {sessionCount}{estimatedSessions ? \` of ~${estimatedSessions}\` : ""}" plus copy "Book your next session below" and the SlotPicker renders beneath it. Propose-mode multi-session books session 1 only (offered times are single-use); a one-line hint says further sessions are arranged with the artist. This is a deliberate v1 limit — comment it.
4. `customer-dashboard.tsx` computes `sessionCount` for the selected request from `appointmentRecords.filter(a => a.requestId === selectedRequestId && a.status !== "cancelled" && a.status !== "no_show").length` and passes it.
5. `RequestDetailPanel` (artist, non-pending view): when `isMultiSession`, show "Multi-session project · ~{estimatedSessions} sessions" in the read-only status box.

- [ ] **Steps:** implement 1-5, verify (39 checks, tsc, lint scoped), commit `feat(booking): multi-session projects with repeat scheduling`.

---

### Task 4: Appointment lifecycle actions

**Files:**
- Modify: `app/book/deposit-actions.ts` → grow into the appointment-operations module (keep filename; it already holds artist-verified transitions): append `completeAppointment`, `markNoShow`, `cancelAppointment`

**Behavior contract:**
- `completeAppointment(appointmentId)` / `markNoShow(appointmentId)`: provider-only (reuse `requireAppointmentArtist`; a granted studio passes RLS but v1 verifies the artist — front-desk lifecycle ops arrive with the roster card actions if needed later). Transition: `confirmed` → `completed` / `no_show`, status-guarded, 0 rows → "already handled". No-show on a paid deposit leaves it `paid` (forfeited — that is what the deposit is for).
- `cancelAppointment(input: unknown)` parsed by `CancelAppointmentSchema`. Caller may be the CUSTOMER (`customer_id = auth.uid()`) or the PROVIDER (artist check). Steps: user-scoped fetch of the row (RLS-visible or 404); determine `cancelledBy` (`"customer"` when caller is the customer, else `"artist"`); fetch `booking_settings.cancellation_window_hours` via admin (default 48 when absent); `refundDecision(...)`; single status-guarded UPDATE from `in ("pending_deposit","confirmed")` → `cancelled` with `cancelled_by`, `cancellation_reason`, and `deposit_status: "refund_due"` ONLY when the decision is `refund_due` (forfeit/none leave deposit_status untouched). Supabase has no `.in` on update filters via `.in("status", [...])` — it does support it; use it. Return `{ success, refund: "refund_due" | "forfeit" | "none" }` so the UI can phrase the outcome.

- [ ] **Steps:** implement, verify, commit `feat(booking): appointment lifecycle with policy-aware refunds`.

---

### Task 5: Artist-side lifecycle + grant UI

**Files:**
- Modify: `components/booking/upcoming-appointments-card.tsx` (confirmed rows get Complete / No-show / Cancel row actions, same compact button style as `DepositActions`, wired to Task 4 actions + `refresh`)
- Modify: `components/booking/booking-settings-panel.tsx` (artist variant: "Studio front desk" grant section)
- Modify: `components/booking/use-booking-settings.ts` (expose grants + toggle)

**Behavior contract:**
- `useBookingSettings` gains: `grants: { id; manageBookings: boolean; studioName: string }[]` loaded in the same init effect via `fetchOwnGrantRows` (artist entities only), and `toggleGrant(id, value)` calling `setManageBookings` then updating local state.
- Settings panel (artist only, `!isStudio`): "Studio front desk" dashed box listing each active affiliation: studio name + ToggleSwitch bound to `manageBookings`, hint "Front desk can accept requests and manage your calendar". Empty list → render nothing.
- Upcoming card: `confirmed` rows show three compact buttons (Complete / No-show / Cancel). Cancel uses `cancelAppointment({ appointmentId })`; on success show nothing fancy — `refresh()`. Keep the deposit buttons for `pending_deposit` rows as-is.

- [ ] **Steps:** implement, verify, commit `feat(booking): lifecycle actions on upcoming card and front-desk grants`.

---

### Task 6: Customer appointment panel

**Files:**
- Modify: `components/dashboard/customer/customer-appointments-section.tsx` (add `onSelect?: (id: string) => void`, rows become buttons — exact same edit pattern as `customer-booking-requests-section.tsx` from Phase 2)
- Create: `components/booking/customer-appointment-panel.tsx`
- Modify: `components/dashboard/customer/customer-dashboard.tsx` (selection state + render)
- Modify: `components/booking/index.tsx`

**Behavior contract:**
- Panel props: `{ appointment: AppointmentRecord | null; onClose; onChanged }`. Shows artist name, type, formatted time (both the appointment's `timezone` and viewer-local when they differ — `Intl` with `timeZone` vs default), price/deposit lines, status.
- Active (`pending_deposit`/`confirmed`) future appointments get a Cancel button with policy copy: "Cancel appointment — deposits may be non-refundable inside the artist's cancellation window." On result, show the refund outcome line: refund_due → "Your deposit refund is owed to you — the artist will process it."; forfeit → "Inside the cancellation window — the deposit is non-refundable."; then `onChanged()`.
- `pending_deposit` + `depositCheckoutUrl` also shows the Pay deposit link (same anchor style as the banner).
- Dashboard: `selectedAppointmentId` state; find record in `appointmentRecords`; `onChanged` = `refreshBooking`.

- [ ] **Steps:** implement, verify, commit `feat(booking): customer appointment panel with policy-aware cancel`.

---

### Task 7: Studio dashboard — settings, front desk, roster

**Files:**
- Create: `app/book/front-desk-actions.ts` (`frontDeskCreateAppointment`)
- Create: `components/booking/front-desk-panel.tsx` + `components/booking/use-front-desk.ts`
- Create: `components/booking/roster-schedule-card.tsx` + `components/booking/use-roster-schedule.ts`
- Modify: `components/dashboard/studio/studio-dashboard.tsx` (two quick actions + two panels + roster card in a column; read the file first — same QuickAction/panels pattern as the artist dashboard)
- Modify: `components/booking/index.tsx`

**Behavior contract:**
- `frontDeskCreateAppointment(input: unknown)`: parse `FrontDeskSchema`; `requireStudioOwner()` (import from `lib/integrations/route-helpers`); artist target → verify grant via user-scoped read of `affiliations` (`artist_id`, `studio_id = owner.studioId`, `status = 'active'`, `manage_bookings = true`) else "That artist has not granted front-desk booking."; insert (user client — RLS `studio_manages_artist` / `owns_studio` enforces): `{ customer_id: null, customer_name, artist_id?: , studio_id: owner.studioId, type, start_at, end_at: startAt + durationMin, timezone: studio settings timezone via admin fetch or default "America/New_York", status: "confirmed", deposit_cents: 0, deposit_status: "not_required", notes }`. Comment: front desk may book outside online availability on purpose; only the exclusion constraint guards artist rows. `23P01` → "{That artist} is already booked then."
- `use-front-desk.ts`: loads roster artists for the picker — `resolveBookingEntity` won't do (studio context); fetch via `getRosterArtistRows(supabase, studioId)` + own grants readable? The GRANTED subset matters: fetch `affiliations` where `studio_id`, `status active`, `manage_bookings = true` joined `artists(id, name)` (readable under affiliations RLS), plus studioId from `studioIdForUser`-style query (`studios.claimed_by = user.id`).
- `front-desk-panel.tsx`: SlideOverPanel "Front Desk": SelectRow target ("Walk-in (studio)" + granted artists), Input customer name, SelectRow type (walk-in target locks to walk_in; artist target offers session/consultation), native `datetime-local` input, SelectRow duration (30m-6h), optional notes Input, submit → action → success line + form reset. Errors inline.
- `use-roster-schedule.ts` + `roster-schedule-card.tsx`: studio's next-7-days schedule — resolve studioId, `getRosterArtistRows` for names/ids, `fetchRosterAppointments`; group by local day; row = color dot (stable per artist: index into a 6-color ink palette array), artist name (or "Walk-in"), customer_name, time, type, "awaiting deposit" tag when pending. Card chrome mirrors `UpcomingAppointmentsCard`. Read-only v1.
- Studio dashboard: quick actions "Booking Settings" (opens the existing entity-agnostic `BookingSettingsPanel` — it already resolves studios) and "Front Desk"; roster card rendered in the left column under existing cards (read the file, place with the grain).

- [ ] **Steps:** implement, verify (39 checks, tsc, lint), commit `feat(booking): studio front desk, roster schedule, studio booking settings`.

---

### Task 8: Sweep + smoke + spec sync

- [ ] **Step 1:** Full run — 39 booking + 44 builder checks, tsc clean, lint at 17-error baseline.
- [ ] **Step 2:** Service-role smoke (scratchpad, deleted after): multi-session accept → project row exists exactly once; session appointment links project_id; walk-in insert (studio-only, customer_name, no customer_id) succeeds and OVERLAPPING walk-ins coexist (no constraint on studio rows); cancel transition with refund_due lands once and is idempotent; forfeit path leaves deposit_status paid.
- [ ] **Step 3:** Spec amendment — `docs/superpowers/specs/2026-07-14-booking-system-design.md` Out of Scope gains: "Customer-facing online booking of studio-level walk-ins (front desk quick-add covers walk-ins; they do not pre-book by definition)." Commit with the sweep.
- [ ] **Step 4:** Report manual verification steps.

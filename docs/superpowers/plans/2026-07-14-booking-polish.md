# Booking Phase 6 (Polish) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close out the booking system: in-app notification events + a dashboard bell, messaging system-lines when requests are answered, Book links on studio-site rosters, and the CLAUDE.md booking-section rewrite that retires the partner-first strategy.

**Architecture:** Notifications are best-effort service-role inserts from the existing actions (a failed notification must NEVER fail a booking — every call is wrapped). The bell mounts once in `DashboardShell` so all three dashboards get it. Messaging system-lines reuse the 009 `conversations`/`messages` schema with the acting artist as sender and templated `[Booking]` content; the conversation id is saved onto the request. Studio-site booking entry is an additive `bookHref` on `StudioSiteArtist` flowing through the existing one-engine pipeline (builder preview = public parity, per the builder truth model).

**Tech Stack:** Established stack only. No migration (notifications table shipped in 019).

## Global Constraints

- Supabase `cktvpfenygxhfaodihbz` only. No emoji. No AI attribution. No `npm run dev`/`build`.
- Verification: `npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint` (17-error lint baseline). `check-builder.ts` MUST stay at 44 green — the studio-site change is additive-optional only.
- NEVER touch the site navigation header (standing rule about header buttons) — the bell lives in `DashboardShell`.
- Notification and messaging side effects: always `try/catch`-wrapped, after the primary transition succeeds, never awaited into the error path.

---

### Task 1: Notification events (TDD on the pure builder)

**Files:**
- Create: `lib/booking/notify.ts`
- Modify: `app/book/actions.ts` (5 wiring points), `app/book/deposit-actions.ts` (cancel), `app/book/front-desk-actions.ts` (artist target), `lib/booking/deposits/confirm.ts` (deposit paid)
- Modify: `scripts/check-booking.ts` (+1 check → 40)

**Interfaces:**
- `buildNotification(kind: BookingNotificationKind, ctx: { actorName?: string; otherName?: string; whenIso?: string; apptType?: string }): { message: string }` — pure, checked. Kinds: `request_received | request_accepted | request_declined | appointment_booked | appointment_cancelled | deposit_paid`.
- `notifyUser(admin, userId: string | null | undefined, kind, ctx): Promise<void>` — no-ops on falsy userId; inserts `{ user_id, kind, payload: buildNotification(...) }`; swallows errors.
- `artistUserId(admin, artistId: string): Promise<string | null>` — `artists.user_id ?? claimed_by`.

- [ ] **Step 1: Failing check**

```ts
// ─── phase 6: notifications ──────────────────────────────────────────────
import { buildNotification } from "../lib/booking/notify";

check("buildNotification renders human copy per kind", () => {
  assert.ok(
    buildNotification("request_received", { actorName: "Jess" }).message.includes("Jess")
  );
  assert.ok(
    buildNotification("request_accepted", { otherName: "Mar" }).message.includes("Mar")
  );
  assert.ok(
    buildNotification("appointment_booked", {
      actorName: "Jess",
      apptType: "flash",
      whenIso: "2026-08-01T17:00:00Z",
    }).message.length > 10
  );
  assert.ok(buildNotification("deposit_paid", { actorName: "Jess" }).message.includes("deposit"));
});
```

- [ ] **Step 2: Implement `lib/booking/notify.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type BookingNotificationKind =
  | "request_received"
  | "request_accepted"
  | "request_declined"
  | "appointment_booked"
  | "appointment_cancelled"
  | "deposit_paid";

interface NotificationCtx {
  actorName?: string;
  otherName?: string;
  whenIso?: string;
  apptType?: string;
}

function fmtWhen(iso?: string): string {
  if (!iso) return "";
  return ` for ${new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** Pure copy builder so the wording is checkable. */
export function buildNotification(
  kind: BookingNotificationKind,
  ctx: NotificationCtx
): { message: string } {
  const actor = ctx.actorName ?? "A client";
  const other = ctx.otherName ?? "The artist";
  switch (kind) {
    case "request_received":
      return { message: `${actor} sent you a booking request` };
    case "request_accepted":
      return { message: `${other} accepted your booking request — pick a time` };
    case "request_declined":
      return { message: `${other} declined your booking request` };
    case "appointment_booked":
      return { message: `${actor} booked a ${ctx.apptType ?? "session"}${fmtWhen(ctx.whenIso)}` };
    case "appointment_cancelled":
      return { message: `${actor} cancelled an appointment${fmtWhen(ctx.whenIso)}` };
    case "deposit_paid":
      return { message: `${actor} paid their deposit — booking confirmed` };
  }
}

/** Best-effort insert: a failed notification must never fail a booking. */
export async function notifyUser(
  admin: SupabaseClient,
  userId: string | null | undefined,
  kind: BookingNotificationKind,
  ctx: NotificationCtx
): Promise<void> {
  if (!userId) return;
  try {
    await admin.from("notifications").insert({ user_id: userId, kind, payload: buildNotification(kind, ctx) });
  } catch {
    // Swallow — observability only.
  }
}

export async function artistUserId(
  admin: SupabaseClient,
  artistId: string
): Promise<string | null> {
  const { data } = await admin
    .from("artists")
    .select("user_id, claimed_by")
    .eq("id", artistId)
    .maybeSingle();
  return data?.user_id ?? data?.claimed_by ?? null;
}
```

- [ ] **Step 3: Wire** (each after the primary success, admin client, fire-and-forget with `await` but inside the notify's own try/catch):
  1. `submitBookingRequest` → `notifyUser(admin*, await artistUserId(admin, d.artistId), "request_received", { actorName: customer_name })` (*create admin locally).
  2. `respondToBookingRequest` → `notifyUser(admin, request.customerId, accepted ? "request_accepted" : "request_declined", { otherName: request.artistName })`.
  3. `scheduleFromRequest` / `bookConsultation` / `bookFlash` → notify the artist (`artistUserId`) `"appointment_booked"` with `{ actorName: customerName, apptType, whenIso: chosen.startAt }`.
  4. `cancelAppointment` → notify the OTHER party: customer cancelled → artist user; artist cancelled → `appt.customer_id`.
  5. `frontDeskCreateAppointment` (artist target only) → `"appointment_booked"` to the artist.
  6. `confirmDepositPaid` in `confirm.ts`: on `"confirmed"` result, look up the appointment's `artist_id`/`customer_name` (single select) → notify artist `"deposit_paid"`.

- [ ] **Step 4:** `40 checks passed`, tsc clean, commit `feat(booking): notification events across the booking lifecycle`.

---

### Task 2: Dashboard notification bell

**Files:**
- Create: `components/booking/use-notifications-feed.ts`, `components/booking/notifications-bell.tsx`
- Modify: `components/dashboard/dashboard-shell.tsx` (mount once, next to the eyebrow header — read the file, place with the grain; do NOT touch the site nav)
- Modify: `components/booking/index.tsx`

**Behavior:**
- Hook: fetch own latest 15 notifications (RLS user-scoped) + unread count (`read_at is null`), inline-IIFE effect; `markAllRead()` updates `read_at = now` where null, zeroes local unread.
- Bell: icon button (inline SVG bell, 44px target) with unread badge; click toggles an absolutely-positioned dropdown card (rounded-[14px], same borders as other cards) listing message + relative day; opening calls `markAllRead`. Signed-out or zero notifications ever → still renders the bell with empty state "Nothing yet". Close on second click (no outside-click machinery — YAGNI).

- [ ] **Steps:** implement, tsc + lint scoped clean, commit `feat(booking): notifications bell in dashboard shell`.

---

### Task 3: Messaging system-lines on request response

**Files:**
- Create: `lib/booking/messaging.ts`
- Modify: `app/book/actions.ts` (`respondToBookingRequest`)

**Interfaces:**
- `postBookingMessage(admin, input: { artistUserId: string; customerId: string; content: string; requestId: string }): Promise<void>` — best-effort:
  1. Find conversation: `.contains("participant_ids", [artistUserId, customerId])` limit 1; else insert `{ participant_ids: [artistUserId, customerId], last_message_at: now, last_message: content, unread_count: { [customerId]: 1 } }`.
  2. Insert message `{ conversation_id, sender_id: artistUserId, content }` (the acting artist is the honest sender).
  3. Update conversation: `last_message`, `last_message_at`, `unread_count` with the customer's count incremented (read current jsonb, spread, +1).
  4. Save `conversation_id` onto the request row.
  All in one try/catch; failures are silent.
- Wiring in `respondToBookingRequest` after transition + project creation: content templates — accept: `[Booking] Accepted your request${quote ? \` — quote $min-$max\` : ""}. ${propose ? "I offered times — pick one from your dashboard." : "Book a time from your dashboard."}`; decline: `[Booking] Declined your request${reason ? `: ${reason}` : ""}.` Needs `artistUserId(admin, request.artistId)` (Task 1 helper).

- [ ] **Steps:** implement, verify, commit `feat(booking): system messages into conversations on request response`.

---

### Task 4: Book links on studio-site rosters

**Files:**
- Modify: `components/studio-site/studio-site-data.ts` (`StudioSiteArtist` gains `bookHref?: string`)
- Modify: `lib/hooks/use-studio-live-content.ts` + `lib/data/studio-page.ts` (populate `bookHref: \`/book/${artist.id}\`` wherever `profileHref` is populated for LIVE artists — grep both files for `profileHref` and mirror; demo/sample artists get none)
- Modify: `components/builder/preview/artist-strips-section.tsx` + `components/studio-site/studio-profile-basic.tsx` (render a compact "Book" link when `bookHref` present, exactly mirroring how `profileHref` renders — same element type, adjacent placement, `font-mono text-[10px] uppercase` link styling consistent with each file's idiom)

**Guardrails:** additive-optional only; `check-builder.ts` fixtures untouched and its 44 checks stay green; builder preview shows the same link (public parity per the builder truth model).

- [ ] **Steps:** grep `profileHref` in the four files, mirror the pattern, run `npx tsx scripts/check-builder.ts` (44) + tsc + lint, commit `feat(booking): book links on studio site rosters`.

---

### Task 5: CLAUDE.md rewrite + memory sync

**Files:**
- Modify: `CLAUDE.md` — replace the "Booking Model" block under Domain Context with:

```markdown
### Booking Model
- First-party booking engine (built 2026-07: spec `docs/superpowers/specs/2026-07-14-booking-system-design.md`)
- Four flows: custom requests (artist-gated w/ quote + deposit), consultations, flash slot booking, multi-session projects
- Slots are derived, never stored (`lib/booking/availability.ts`); double-booking is impossible at the DB layer (gist exclusion constraint on active artist appointments)
- Deposits run on the artist/studio's OWN Stripe/Square account (`lib/booking/deposits/`) — the platform never holds funds; manual mark-received fallback
- All transitions are status-guarded UPDATEs; `confirmDepositPaid` is the single idempotent paid-transition (webhook/return/sweep/manual converge)
- Studio side: front-desk quick-add (artist-granted via `affiliations.manage_bookings`), walk-ins are studio-level rows with no overlap constraint
- Fast-follows deliberately deferred: Google Calendar sync, API-executed refunds, email/SMS reminders (notifications table is the outbox)
```

- [ ] **Steps:** apply, commit `docs: CLAUDE.md booking section — first-party engine replaces partner-first`.

---

### Task 6: Final sweep + smoke + report

- [ ] **Step 1:** Full run — 40 booking + 44 builder checks, tsc clean, lint at baseline.
- [ ] **Step 2:** Service-role smoke (scratchpad, deleted): notification insert lands and is user-readable shape; conversation find-or-create + message insert + unread increment works and is idempotent-safe on the find path; cleanup.
- [ ] **Step 3:** Update project memory (phase 6 shipped, project complete) and deliver the final report: manual verification checklist + the go-live env/webhook list from Phase 4.

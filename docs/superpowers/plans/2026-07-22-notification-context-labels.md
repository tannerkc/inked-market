# Notification Context Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Label notifications with the recipient's active context: `Studio`, `Artist`, or `Your booking`.

**Architecture:** Persist an explicit `recipientContext` in each notification JSON payload at creation time. Producers determine context from the booking target or customer-side transition; the feed maps that enum to display copy and never infers role from prose. Existing request notifications are repaired from their stored `requestId`.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Supabase/Postgres JSONB, Tailwind CSS v4, assert-based checks via `tsx`.

## Global Constraints

- Persist exactly `"studio" | "artist" | "customer"`.
- Display exactly `Studio`, `Artist`, or `Your booking`.
- Context describes why the recipient received the notification, never the sender.
- Do not infer context from notification copy or the user's global profile role.
- Leave ambiguous messages unlabeled.
- Add no schema migration or dependency.
- Preserve existing quick actions, unread/archive behavior, request IDs, and dark mode.

---

### Task 1: Define and test the context contract

**Files:**
- Modify: `lib/booking/notify.ts`
- Modify: `scripts/check-booking.ts`

**Interfaces:**
- Produces: `NotificationRecipientContext = "studio" | "artist" | "customer"`
- Produces: `notificationContextForTarget(target): "artist" | "studio"`
- Produces: `notificationContextLabel(context): "Studio" | "Artist" | "Your booking"`
- Extends: `NotificationCtx.recipientContext?` and the `buildNotification` result.

- [ ] **Step 1: Add failing pure checks**

Replace the phase-six notification checks in `scripts/check-booking.ts` with:

```ts
import {
  buildNotification,
  notificationContextForTarget,
  notificationContextLabel,
} from "../lib/booking/notify";

check("notification context maps targets and labels", () => {
  assert.equal(notificationContextForTarget({ studioId: "studio-1" }), "studio");
  assert.equal(notificationContextForTarget({ artistId: "artist-1" }), "artist");
  assert.equal(notificationContextLabel("studio"), "Studio");
  assert.equal(notificationContextLabel("artist"), "Artist");
  assert.equal(notificationContextLabel("customer"), "Your booking");
});

check("request copy preserves explicit recipient context", () => {
  assert.deepEqual(
    buildNotification("request_received", {
      actorName: "Tanner",
      recipientContext: "studio",
    }),
    {
      message: "Tanner requested a booking",
      actorName: "Tanner",
      recipientContext: "studio",
    }
  );
  assert.deepEqual(
    buildNotification("request_accepted", {
      otherName: "Drunken Regurtz",
      recipientContext: "customer",
    }),
    {
      message: "Drunken Regurtz approved your booking request",
      actorName: "Drunken Regurtz",
      recipientContext: "customer",
    }
  );
});
```

- [ ] **Step 2: Verify the checks fail**

Run: `npx tsx scripts/check-booking.ts`

Expected: FAIL because the context helpers and property do not exist.

- [ ] **Step 3: Implement the contract**

Add to `lib/booking/notify.ts`:

```ts
export type NotificationRecipientContext = "studio" | "artist" | "customer";

export function notificationContextForTarget(target: {
  artistId?: string | null;
  studioId?: string | null;
}): Exclude<NotificationRecipientContext, "customer"> {
  return target.artistId ? "artist" : "studio";
}

export function notificationContextLabel(
  context: NotificationRecipientContext
): "Studio" | "Artist" | "Your booking" {
  if (context === "studio") return "Studio";
  if (context === "artist") return "Artist";
  return "Your booking";
}
```

Extend `NotificationCtx` with:

```ts
recipientContext?: NotificationRecipientContext;
```

Change `buildNotification` to return `recipientContext` when supplied. Use this helper inside it:

```ts
const result = (message: string, actorName: string) => ({
  message,
  actorName,
  ...(ctx.recipientContext ? { recipientContext: ctx.recipientContext } : {}),
});
```

Use concise request copy:

```ts
case "request_received":
  return result(`${actor} requested a booking`, actor);
case "request_accepted":
  return result(`${other} approved your booking request`, other);
case "request_declined":
  return result(`${other} declined your booking request`, other);
```

Convert the remaining branches to `result(...)` without changing their copy. `notifyUser` already spreads `buildNotification(kind, ctx)`, so the field persists automatically.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npx tsx scripts/check-booking.ts
npx tsc --noEmit
```

Expected: checks pass and TypeScript exits 0.

Commit only these files:

```bash
git add lib/booking/notify.ts scripts/check-booking.ts
git commit -m "feat(notifications): define recipient context contract"
```

### Task 2: Assign context at booking notification producers

**Files:**
- Modify: `app/book/actions.ts`
- Modify: `app/book/deposit-actions.ts`
- Modify: `app/book/front-desk-actions.ts`
- Modify: `lib/booking/deposits/confirm.ts`

**Interfaces:**
- Consumes: `notificationContextForTarget(target)` from Task 1.
- Produces: explicit context on every unambiguous booking notification.

- [ ] **Step 1: Wire business-side contexts**

Import `notificationContextForTarget` where a call uses `bookingTargetUserId`. Add this to each matching notification context object:

```ts
recipientContext: notificationContextForTarget(target),
```

For `submitBookingRequest`, use the parsed target and preserve the request ID:

```ts
await notifyUser(admin, await bookingTargetUserId(admin, d), "request_received", {
  actorName: customerName ?? undefined,
  requestId: created.id,
  recipientContext: notificationContextForTarget(d),
});
```

For artist-only flash, front-desk, and deposit-paid notifications, add:

```ts
recipientContext: "artist",
```

- [ ] **Step 2: Wire customer-side decisions**

In `respondToBookingRequest`, use:

```ts
await notifyUser(
  admin,
  request.customerId,
  d.action === "accept" ? "request_accepted" : "request_declined",
  {
    otherName: request.artistName ?? request.studioName,
    requestId: request.id,
    recipientContext: "customer",
  }
);
```

- [ ] **Step 3: Wire cancellation context**

In `app/book/deposit-actions.ts`, pass the appointment target to the helper:

```ts
recipientContext: notificationContextForTarget({
  artistId: appointment.artistId,
  studioId: appointment.studioId,
}),
```

Use the row's actual camel- or snake-case property names as declared by the local selected type. Do not infer from the signed-in profile.

- [ ] **Step 4: Keep direct messages unlabeled**

Do not add context to `app/messages/actions.ts`; current conversation data does not establish whether the recipient is acting professionally or personally.

- [ ] **Step 5: Verify and commit**

Run:

```bash
rg -n -A8 "notifyUser\(" app/book app/messages lib/booking
npx tsc --noEmit
npx eslint app/book/actions.ts app/book/deposit-actions.ts app/book/front-desk-actions.ts lib/booking/deposits/confirm.ts lib/booking/notify.ts
```

Expected: every unambiguous booking notification has context, message notifications do not, and checks exit 0.

Commit:

```bash
git add app/book/actions.ts app/book/deposit-actions.ts app/book/front-desk-actions.ts lib/booking/deposits/confirm.ts
git commit -m "feat(notifications): assign booking recipient contexts"
```

### Task 3: Render labels and repair legacy request rows

**Files:**
- Modify: `components/booking/use-notifications-feed.ts`
- Modify: `components/booking/notifications-bell.tsx`
- Create: `scripts/backfill-notification-contexts.mjs`

**Interfaces:**
- Consumes: `NotificationRecipientContext` and `notificationContextLabel`.
- Extends: `NotificationItem.recipientContext?`.
- Produces: compact metadata labels without changing quick actions.

- [ ] **Step 1: Deserialize context without inference**

In `use-notifications-feed.ts`:

```ts
import type { NotificationRecipientContext } from "@/lib/booking/notify";
```

Add `recipientContext?: NotificationRecipientContext` to `NotificationItem` and to `DbNotification.payload`. Map it with:

```ts
recipientContext: r.payload?.recipientContext,
```

Do not synthesize it from kind, message, or user profile.

- [ ] **Step 2: Render context before timestamp**

Import `notificationContextLabel` in `notifications-bell.tsx`, then replace the timestamp paragraph with:

```tsx
<p className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] text-ink-black/30 dark:text-ink-cream/30">
  {n.recipientContext ? (
    <span className="font-semibold uppercase tracking-wide text-ink-black/55 dark:text-ink-cream/55">
      {notificationContextLabel(n.recipientContext)}
    </span>
  ) : null}
  {n.recipientContext ? <span aria-hidden="true">·</span> : null}
  <span>{timestamp(n.createdAt)}</span>
</p>
```

- [ ] **Step 3: Create an idempotent legacy backfill**

Create `scripts/backfill-notification-contexts.mjs`. Load `.env.local`, initialize the Supabase admin client, and select request notifications. Skip payloads already containing `recipientContext`.

- For `request_accepted` and `request_declined`, write `customer`.
- For `request_received` with `payload.requestId`, fetch `booking_requests.artist_id, studio_id`; write `artist` when `artist_id` exists, otherwise `studio` when `studio_id` exists.
- Preserve the complete payload:

```js
const nextPayload = { ...row.payload, recipientContext };
const { error } = await supabase
  .from("notifications")
  .update({ payload: nextPayload })
  .eq("id", row.id);
if (error) throw error;
```

Print each changed row. Exit nonzero on errors. Never modify messages or ambiguous rows.

- [ ] **Step 4: Verify static behavior and idempotent data repair**

Run:

```bash
npx tsc --noEmit
npx eslint components/booking/use-notifications-feed.ts components/booking/notifications-bell.tsx lib/booking/notify.ts
npx tsx scripts/check-booking.ts
git diff --check
node scripts/backfill-notification-contexts.mjs
node scripts/backfill-notification-contexts.mjs
```

Expected: static checks exit 0; first backfill repairs eligible rows; second reports zero changes.

- [ ] **Step 5: Smoke-test mixed-role UX**

With the existing development server:

- A studio-targeted `Tanner requested a booking` row shows `Studio`.
- An artist-targeted request shows `Artist`.
- `Drunken Regurtz approved your booking request` shows `Your booking`.
- Ambiguous direct messages show no context.
- View request, Pick a time, reply, read/unread, and archive still work.
- Labels remain legible in light/dark mode and at the 320px popover width.

- [ ] **Step 6: Commit and run final regression checks**

Commit:

```bash
git add components/booking/use-notifications-feed.ts components/booking/notifications-bell.tsx scripts/backfill-notification-contexts.mjs
git commit -m "feat(notifications): show recipient context labels"
```

Then run:

```bash
npx tsx scripts/check-booking.ts
npx tsc --noEmit
npx eslint lib/booking/notify.ts app/book/actions.ts app/book/deposit-actions.ts app/book/front-desk-actions.ts lib/booking/deposits/confirm.ts components/booking/use-notifications-feed.ts components/booking/notifications-bell.tsx
npm run build
```

Expected: all checks and the production build exit 0. Review `git status --short` to ensure pre-existing unrelated worktree changes remain untouched.

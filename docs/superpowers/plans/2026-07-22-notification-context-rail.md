# Notification Context Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the understated inline notification context label with the approved context rail and eyebrow treatment.

**Architecture:** Keep persisted context and notification behavior unchanged. Add one pure context-tone helper for tested business-versus-personal presentation logic, then use it in the notification row to select existing rust or sage tokens for the rail and eyebrow.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, assert-based checks via `tsx`.

## Global Constraints

- A 3px rounded rail and uppercase mono eyebrow always appear together on labeled rows.
- `Studio` and `Artist` use `ink-rust`; `Your booking` uses `ink-sage`.
- Unlabeled notifications keep the existing layout and render no rail.
- The unread red dot continues to represent unread state only.
- Timestamp returns to a timestamp-only metadata line.
- Quick actions, inline replies, request previews, slide-overs, keyboard order, and hit areas remain unchanged.
- Use existing tokens only; add no raw color, primitive, animation, dependency, or data change.
- Preserve the 320px popover layout and WCAG AA text contrast in light and dark modes.

---

### Task 1: Implement and verify the context rail

**Files:**
- Modify: `lib/booking/notify.ts`
- Modify: `scripts/check-booking.ts`
- Modify: `components/booking/notifications-bell.tsx`

**Interfaces:**
- Produces: `notificationContextTone(context: NotificationRecipientContext): "business" | "personal"`.
- Consumes: existing `notificationContextLabel(context)`.
- Produces: rail/eyebrow row structure without changing notification behavior.

- [ ] **Step 1: Add a failing presentation-tone check**

In the notification section of `scripts/check-booking.ts`, import `notificationContextTone` from the existing notifications namespace and add:

```ts
check("notification context tone separates business from personal bookings", () => {
  assert.equal(notificationContextTone("studio"), "business");
  assert.equal(notificationContextTone("artist"), "business");
  assert.equal(notificationContextTone("customer"), "personal");
});
```

- [ ] **Step 2: Run the booking checks and verify RED**

Run: `npx tsx scripts/check-booking.ts`

Expected: FAIL because `notificationContextTone` is not exported.

- [ ] **Step 3: Implement the pure tone helper**

Add to `lib/booking/notify.ts`:

```ts
export function notificationContextTone(
  context: NotificationRecipientContext
): "business" | "personal" {
  return context === "customer" ? "personal" : "business";
}
```

This helper maps recipient intent, not notification kind or actor identity.

- [ ] **Step 4: Add row tone derivation without changing actions**

In `components/booking/notifications-bell.tsx`, import `notificationContextTone`. Change the `visible.map` callback to a block so each row derives:

```tsx
const contextTone = n.recipientContext
  ? notificationContextTone(n.recipientContext)
  : null;
```

Return the existing `<li>` unchanged except for the row/cue layout in the next step.

- [ ] **Step 5: Render the approved rail and eyebrow**

Make the row `relative` and add left inset only for labeled rows:

```tsx
className={cn(
  "relative flex items-start gap-2 border-b border-ink-black/[0.04] py-2 last:border-0 dark:border-ink-cream/[0.04]",
  n.recipientContext && "pl-2"
)}
```

As the first child of labeled rows, render a decorative rail:

```tsx
{contextTone ? (
  <span
    aria-hidden="true"
    className={cn(
      "absolute inset-y-2 left-0 w-[3px] rounded-full",
      contextTone === "business" ? "bg-ink-rust" : "bg-ink-sage"
    )}
  />
) : null}
```

Inside the content column, render the eyebrow immediately before the message:

```tsx
{n.recipientContext && contextTone ? (
  <p
    className={cn(
      "mb-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em]",
      contextTone === "business"
        ? "text-ink-rust dark:text-ink-rust"
        : "text-ink-sage dark:text-ink-sage"
    )}
  >
    {notificationContextLabel(n.recipientContext)}
  </p>
) : null}
```

Replace the current context-plus-timestamp metadata line with timestamp only:

```tsx
<p className="mt-0.5 font-mono text-[9px] text-ink-black/30 dark:text-ink-cream/30">
  {timestamp(n.createdAt)}
</p>
```

Do not move or change the unread dot, message copy, actions, expanded content, handlers, or focusable elements.

- [ ] **Step 6: Run static verification**

Run:

```bash
npx tsx scripts/check-booking.ts
npx tsc --noEmit
npx eslint lib/booking/notify.ts scripts/check-booking.ts components/booking/notifications-bell.tsx
git diff --check
```

Expected: booking checks include the new tone check and all commands exit 0. The only acceptable console noise is the existing `baseline-browser-mapping` freshness advisory.

- [ ] **Step 7: Perform the 320px visual smoke check**

With the existing development server, open a signed-in notification bell containing business, personal-booking, and unlabeled rows. Confirm:

- Studio and Artist show a rust rail plus rust eyebrow.
- Your booking shows a sage rail plus sage eyebrow.
- Direct messages without context show neither cue.
- The unread dot remains red and visually distinct from context.
- Timestamp, quick actions, inline reply, request preview, and scheduling actions do not clip or collide.
- Light and dark themes preserve readable eyebrow contrast.

- [ ] **Step 8: Run final build and commit**

Run:

```bash
npm run build
```

Expected: production build exits 0.

Commit only this refinement:

```bash
git add lib/booking/notify.ts scripts/check-booking.ts components/booking/notifications-bell.tsx docs/superpowers/plans/2026-07-22-notification-context-rail.md
git commit -m "feat(notifications): emphasize recipient context"
```

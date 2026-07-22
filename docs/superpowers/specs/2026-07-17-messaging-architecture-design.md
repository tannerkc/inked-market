# Messaging Architecture: Hub-and-Spoke

**Date:** 2026-07-17
**Status:** Approved (option C)

## Decision

`/messages` stays the single canonical inbox (the hub). Every other surface is a
spoke that advertises it and deep-links into it — never a second messenger.

Rationale: customers message episodically around a booking (threads must be
reachable from booking context); artists message daily as a lead pipeline
(inbox must be one tap from anywhere, Instagram-DM muscle memory). Messages
belong to the *identity*, not the `viewMode` lens, so the hub lives outside the
role-switched dashboard. Mobile can't host a two-pane messenger inside a
dashboard tab. Precedent: Airbnb/Etsy/Booksy all resolve this the same way.

## Scope (this iteration)

1. **Nav entry + unread badge** — a Messages icon button beside the
   notifications bell (desktop and mobile), badge = count of conversations with
   unread messages. Polls lightly (30s + tab-visibility + a
   `inked:messages-read` window event fired when the hub marks a thread read).
   Active state when on `/messages`. Rendered only when authenticated.
   Component: `components/messages/messages-nav-button.tsx`.

2. **Pro-dashboard spokes** — `components/dashboard/messages-card.tsx`:
   `DashboardSection("Messages", action: View all → /messages)` + the hub's own
   `ConversationRow`s (exported from `components/messages`), rows deep-link to
   `/messages?c=`. Self-fetches via `fetchInbox()` unless given `conversations`
   prop. Placed next to `ArtistRequestsSection` in artist and studio dashboards.

3. **Customer dashboard unification** — replace `CustomerMessagesSection` with
   the same `MessagesCard` (data passed from `use-customer-data`, which now
   stores native `InboxConversation[]`; Activity-tab badge = sum of unread).
   Delete the legacy section component and the two mock data functions.

4. **Request ↔ thread linkage (both directions)**
   - `BookingRequestRecord.conversationId` added (column already exists).
   - `RequestDetailPanel` (artist/studio): "Message client" →
     `/messages?to=<customerId>` — always the *current user's* thread with the
     customer (honest-sender model survives front-desk operators who aren't in
     the artist's thread).
   - `CustomerRequestPanel`: "Message artist/studio" → `?c=<conversationId>`
     when a thread exists, else `?to=artist:<id>|studio:<id>`.
   - Thread context strip: `fetchInbox` attaches the latest linked booking
     request (`booking: { requestId, status }`, lazy-expired) per conversation;
     the thread header shows "Booking request · <status>" linking to
     `/dashboard`.

## Non-goals

Realtime transport (polling stays), per-user archive/delete (schema change),
typing indicators, a second messenger surface anywhere.

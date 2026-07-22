# Notification Context Labels

## Goal

Help people who use Inked Market both professionally and personally understand which role each notification belongs to at a glance.

## Labels

Each notification may display one compact recipient-context label:

- `Studio` when the notification was sent to the recipient as a studio owner.
- `Artist` when the notification was sent to the recipient as an independent artist.
- `Your booking` when the notification concerns the recipient's own tattoo booking.

The label describes why the recipient received the notification. It does not describe the sender or merely repeat the event type. `Your booking` is used instead of `Customer` because it names the user's goal rather than an internal account role.

Examples:

- `Studio · Tanner requested a booking`
- `Artist · Tanner requested a booking`
- `Your booking · Drunken Regurtz approved your booking request`

## Data Contract

Notification payloads gain an optional `recipientContext` field with one of these values:

```ts
type NotificationRecipientContext = "studio" | "artist" | "customer";
```

Context is assigned when the notification is created:

- Business-side booking events use the actual booking target. A studio target produces `studio`; an artist target produces `artist`.
- Customer-side booking events use `customer`.
- Messages only receive a context when the conversation or related booking establishes it unambiguously. Otherwise they remain unlabeled.

The feed maps the stored value directly to display copy. It must not infer context from notification wording or the recipient's global profile role, because one account can act in multiple roles.

## Existing Notifications

Legacy booking notifications without `recipientContext` use a narrow fallback:

- `request_received`, `appointment_booked`, `appointment_cancelled`, and `deposit_paid` derive `Studio` or `Artist` from the referenced booking request when available.
- `request_accepted` and `request_declined` display `Your booking`.
- Ambiguous notifications remain unlabeled rather than showing a potentially incorrect context.

No schema migration is required because notification payloads are JSON.

## Presentation

The context label appears on the metadata line before the timestamp. It uses the existing compact metadata styling and remains visually secondary to notification copy and quick actions. The label is text, not color alone, so context remains accessible in both light and dark modes.

## Copy

Booking copy should be concise and role-neutral:

- Request received: `{name} requested a booking`
- Request accepted: `{name} approved your booking request`
- Request declined: `{name} declined your booking request`

Existing actor-name emphasis remains unchanged.

## Verification

- Pure notification-builder checks cover every booking kind and its expected context.
- Feed mapping checks cover all three labels and an absent context.
- UI verification covers mixed Studio/Artist and `Your booking` rows in one notification list.
- Existing quick actions, unread state, archive state, and legacy request-ID behavior remain unchanged.

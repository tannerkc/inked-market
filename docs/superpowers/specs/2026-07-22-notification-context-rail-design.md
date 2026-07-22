# Notification Context Rail

## Goal

Make notification context immediately scannable for mixed-role users without adding a visually heavy badge to an already dense popover.

## Approved Treatment

Each labeled notification row uses a context rail:

- A 3px rounded vertical rail sits at the row's left edge.
- A compact uppercase mono eyebrow appears above the notification message.
- `Studio` and `Artist` use the business-context ink-rust treatment.
- `Your booking` uses the personal-booking ink-sage treatment.
- The existing unread red dot remains separate and continues to communicate unread state only.
- Unlabeled notifications, including ambiguous direct messages, render with the existing row layout and no rail.

The rail and label always appear together. Color reinforces context but never carries meaning alone because the text label remains visible.

## Layout

Labeled rows gain enough left inset to keep the rail clear of the unread dot. The context eyebrow moves above the message; the metadata line returns to timestamp-only. Quick actions, expanded reply fields, request previews, and slide-over behavior remain unchanged.

The design must hold at the existing 320px popover width and in both light and dark themes.

## Visual Tokens

Use existing design tokens only:

- Business rail/label: `ink-rust`
- Personal-booking rail/label: `ink-sage`
- Utility typography: existing mono family, 9px, uppercase, semibold/bold, deliberate tracking
- No new raw colors, UI primitive, animation, or dependency

Artist and Studio share the business color because the primary perceptual distinction is professional context versus the user's own booking. Their text labels preserve the finer role distinction.

## Accessibility

- The context text remains in the DOM and is not replaced by color.
- Rail decoration is hidden from assistive technology.
- Text contrast must meet WCAG AA for normal text in light and dark modes.
- The rail must not reduce action hit areas or alter keyboard order.

## Verification

- Render checks cover business, personal-booking, and unlabeled rows.
- Existing notification context parser tests remain unchanged.
- TypeScript, scoped ESLint, booking checks, and production build pass.
- Visual smoke-check at 320px confirms no clipping or collisions with the unread dot, timestamp, actions, inline reply, or request preview.


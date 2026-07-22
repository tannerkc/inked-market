/**
 * App-managed email confirmation with a grace period.
 *
 * Supabase's "Confirm email" gate is OFF so signups get an immediate session.
 * Instead, we track confirmation in `app_metadata.email_confirmation`
 * (admin-writable only — user_metadata would be user-editable and unsafe):
 *
 *   { sent_at, deadline, confirmed_at }
 *
 * plus a top-level `app_metadata.paused` flag set by the daily cron once the
 * deadline passes unconfirmed. Clicking any emailed auth link proves mailbox
 * ownership; the /auth/callback route stamps confirmed_at and unpauses.
 */

export const CONFIRMATION_GRACE_DAYS = 5;

export interface EmailConfirmationMeta {
  sent_at?: string;
  deadline?: string;
  confirmed_at?: string;
}

export type AccountAccess = "exempt" | "confirmed" | "pending" | "paused";

/**
 * Derives account access from confirmation metadata.
 * - No deadline stamp (pre-feature or admin-created accounts) → exempt.
 * - Past-deadline unconfirmed accounts read as paused immediately, even
 *   before the cron has flagged them.
 */
export function accountAccess(
  meta: EmailConfirmationMeta | null | undefined,
  paused: boolean,
  now: Date = new Date(),
): AccountAccess {
  if (meta?.confirmed_at) return "confirmed";
  if (paused) return "paused";
  if (!meta?.deadline) return "exempt";
  if (new Date(meta.deadline).getTime() <= now.getTime()) return "paused";
  return "pending";
}

/** Whole days remaining until the deadline (never negative). */
export function daysLeft(deadline: string, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - now.getTime()) / 86_400_000));
}

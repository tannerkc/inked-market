"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { daysLeft } from "@/lib/utils/email-confirmation";
import { useResendState } from "./use-resend-state";

/**
 * Floating reminder shown while an account is inside its confirmation grace
 * period. Rendered by AuthGuard so it appears across all account pages.
 */
export function ConfirmEmailBanner() {
  const { user, sendConfirmationEmail } = useAuth();
  const { send, status, sending } = useResendState(sendConfirmationEmail);

  const deadline = user?.emailConfirmation?.deadline;
  if (!user || !deadline) return null;

  const remaining = daysLeft(deadline);

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-sm z-50">
      <div className="rounded-[14px] border border-ink-black/[0.08] border-l-[3px] border-l-ink-rust bg-white shadow-lg p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-rust mb-1">
          Action Needed
        </p>
        <p className="text-[13px] font-semibold text-ink-black mb-0.5">
          Confirm your email &mdash; {remaining} {remaining === 1 ? "day" : "days"} left
        </p>
        <p className="text-[11px] text-ink-black/45 mb-3">
          We sent a link to <span className="font-medium text-ink-black/70">{user.email}</span>.
          Unconfirmed accounts are paused after the deadline.
        </p>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ink-outline" size="sm" onClick={send} disabled={sending}>
            {sending ? "Sending…" : "Resend Link"}
          </Button>
          {status ? (
            <p className="text-[10px] font-mono tracking-[0.1em] text-ink-black/45">{status}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

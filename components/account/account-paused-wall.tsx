"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { useResendState } from "./use-resend-state";

/**
 * Full-screen block shown when an account passed its email-confirmation
 * deadline. Confirming via the emailed link unpauses immediately
 * (/auth/callback clears the flag).
 */
export function AccountPausedWall() {
  const { user, sendConfirmationEmail, logout } = useAuth();
  const { send, status, sending } = useResendState(sendConfirmationEmail);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark flex items-center justify-center overflow-hidden">
      <FilmGrainOverlay className="opacity-[0.025]" />

      <div className="relative z-10 w-full max-w-[400px] mx-auto px-4 text-center">
        <Eyebrow text="Account Paused" color="red" />
        <Headline
          variant="mixed"
          size="sm"
          words={[
            { text: "Confirm", font: "pirata" },
            { text: "Your", font: "rye" },
            { text: "Email", font: "cook", color: "text-ink-red" },
          ]}
        />
        <Subtitle
          text="The 5-day confirmation window has passed, so this account is paused. Confirm your email to pick up right where you left off."
          className="mb-6"
        />

        <div className="p-6 rounded-[14px] border border-ink-black/[0.08] bg-white text-left">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/30 mb-1">
            Confirmation Link
          </p>
          <p className="text-[12px] text-ink-black/50 mb-4">
            We&apos;ll send a fresh link to{" "}
            <span className="font-semibold text-ink-black">{user?.email}</span>. Clicking it
            reactivates your account instantly.
          </p>

          <Button
            type="button"
            variant="ink"
            size="lg"
            statusDot
            className="w-full"
            onClick={send}
            disabled={sending}
          >
            {sending ? "Sending…" : "Send Confirmation Link"}
          </Button>

          {status ? (
            <p className="text-[11px] font-mono tracking-[0.1em] text-ink-black/45 mt-3 text-center">
              {status}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void logout().then(() => (window.location.href = "/login"))}
          className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-5 cursor-pointer"
        >
          Sign Out &rarr;
        </button>
      </div>
    </div>
  );
}

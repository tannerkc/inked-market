"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

interface ConfirmEmailNoticeProps {
  email: string;
}

/**
 * Shown after signup when Supabase requires email confirmation before a
 * session exists. Lets the user re-send the confirmation link.
 */
export function ConfirmEmailNotice({ email }: ConfirmEmailNoticeProps) {
  const { resendConfirmation } = useAuth();
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (sending) return;
    setSending(true);
    setStatus("");
    const result = await resendConfirmation(email);
    setStatus(result.message);
    setSending(false);
  };

  return (
    <div className="p-6 rounded-[14px] border border-ink-black/[0.08] bg-white text-center">
      <div className="flex justify-center mb-3">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-rust"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold text-ink-black mb-1.5">Check your email</h3>
      <p className="text-[12px] text-ink-black/50 mb-1">
        We sent a confirmation link to <span className="font-semibold text-ink-black">{email}</span>.
      </p>
      <p className="text-[12px] text-ink-black/50 mb-4">
        Click it to activate your account, then sign in.
      </p>

      <Button
        type="button"
        variant="ink-outline"
        size="md"
        className="w-full"
        onClick={handleResend}
        disabled={sending}
      >
        {sending ? "Sending…" : "Resend Email"}
      </Button>

      {status ? (
        <p className="text-[11px] font-mono tracking-[0.1em] text-ink-black/45 mt-3">{status}</p>
      ) : null}

      <Link
        href="/login"
        className="block font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-4"
      >
        Go to Sign In &rarr;
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAuth, type SignupProgress } from "@/components/providers/auth-provider";

/**
 * Shared final-step signup handling: runs completeSignup, surfaces errors,
 * switches to the confirm-email state when Supabase requires verification,
 * and redirects on immediate success.
 */
export function useSignupCompletion(redirectTo: string) {
  const { completeSignup } = useAuth();
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const complete = async (extra?: Partial<SignupProgress>) => {
    if (pending) return;
    setError("");
    setPending(true);
    try {
      const result = await completeSignup(extra);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.needsEmailConfirmation) {
        setConfirmEmail(result.user.email);
        return;
      }
      window.location.href = redirectTo;
    } finally {
      setPending(false);
    }
  };

  return { complete, error, confirmEmail, pending };
}

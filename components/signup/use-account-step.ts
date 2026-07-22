"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAuth,
  EMAIL_EXISTS_MESSAGE,
  type UserRole,
} from "@/components/providers/auth-provider";

/**
 * Shared account-step handling for multi-step signups (studio, artist):
 * blocks emails that already have an account before the user invests in the
 * rest of the flow, then stores progress and advances. completeSignup remains
 * the authoritative duplicate check at the end of the flow.
 */
export function useAccountStep(role: UserRole, nextPath: string) {
  const router = useRouter();
  const { updateSignupProgress, signupProgress } = useAuth();
  const [error, setError] = useState("");

  const onSubmit = async (data: { email: string; password: string; name?: string }) => {
    setError("");
    let exists = false;
    try {
      const res = await fetch("/api/auth/email-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (res.ok) exists = (await res.json()).exists === true;
    } catch {
      // fail open — completeSignup rejects duplicates at the end of the flow
    }
    if (exists) {
      setError(EMAIL_EXISTS_MESSAGE);
      return;
    }

    updateSignupProgress({ role, email: data.email, password: data.password, name: data.name });
    // Client-side nav keeps the in-memory password (never persisted)
    router.push(nextPath);
  };

  return { onSubmit, error, signupProgress };
}

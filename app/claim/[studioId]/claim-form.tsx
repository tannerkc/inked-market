"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ClaimFormProps {
  studioId: string;
  hasEmail: boolean;
}

type ClaimState = "idle" | "sending" | "sent" | "error";

export function ClaimForm({ studioId, hasEmail }: ClaimFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<ClaimState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // No email on file — manual claim path
  if (!hasEmail) {
    return (
      <div className="text-center px-4 py-6 rounded-lg border border-ink-cream/10">
        <p className="font-mono text-[11px] text-ink-cream/50 mb-2">
          No email on file for this listing.
        </p>
        <p className="font-mono text-[9px] text-ink-cream/30">
          Contact{" "}
          <a
            href="mailto:support@inkedmarket.com"
            className="text-ink-sage underline"
          >
            support@inkedmarket.com
          </a>{" "}
          with proof of ownership to claim this listing.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studioId, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMessage(data.error || "Something went wrong. Try again.");
        return;
      }

      setState("sent");
    } catch {
      setState("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  if (state === "sent") {
    return (
      <div className="text-center px-4 py-8 rounded-lg border border-ink-sage/20 bg-ink-sage/[0.05]">
        <p className="font-mono text-[13px] text-ink-sage mb-2">
          Check your email
        </p>
        <p className="font-mono text-[10px] text-ink-cream/35">
          We sent a verification link to{" "}
          <span className="text-ink-cream/60">{email}</span>. Click it to
          complete your claim.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="claim-email"
          className="block font-mono text-[9px] tracking-[0.12em] uppercase text-ink-cream/40 mb-2"
        >
          Business Email
        </label>
        <input
          id="claim-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter the business email on file"
          required
          className={cn(
            "w-full px-4 py-3 rounded-lg",
            "bg-ink-cream/[0.05] border border-ink-cream/10",
            "font-mono text-[12px] text-ink-cream placeholder:text-ink-cream/20",
            "focus:outline-none focus:border-ink-sage/40 transition-colors"
          )}
        />
      </div>

      {state === "error" && (
        <p className="font-mono text-[10px] text-ink-red/70">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending" || !email.trim()}
        className={cn(
          "w-full px-4 py-3 rounded-lg",
          "bg-ink-sage/20 border border-ink-sage/30",
          "font-mono text-[11px] tracking-[0.1em] uppercase text-ink-sage",
          "hover:bg-ink-sage/30 transition-colors duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {state === "sending" ? "Sending..." : "Send Verification Link"}
      </button>
    </form>
  );
}

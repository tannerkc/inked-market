"use client";

import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/app/help/contact/actions";

const CONTACT_TOPICS = [
  { value: "account-issue", label: "Account Issue" },
  { value: "booking-problem", label: "Booking Problem" },
  { value: "report-bug", label: "Report a Bug" },
  { value: "feature-request", label: "Feature Request" },
  { value: "business-inquiry", label: "Business Inquiry" },
];

interface ContactFormProps {
  variant?: "light" | "dark";
  className?: string;
}

export function ContactForm({ variant = "dark", className }: ContactFormProps) {
  const isDark = variant === "dark";
  const [state, formAction, pending] = useActionState(submitContactForm, null);

  if (state?.success) {
    return (
      <div
        className={cn(
          "rounded-2xl border p-8 sm:p-10 text-center",
          isDark
            ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
            : "border-ink-black/[0.06] bg-ink-black/[0.02]",
          className
        )}
      >
        <div
          className={cn(
            "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
            isDark ? "bg-ink-sage/10" : "bg-ink-sage/15"
          )}
        >
          <svg
            className="h-6 w-6 text-ink-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3
          className={cn(
            "text-lg font-semibold mb-2",
            isDark ? "text-ink-cream" : "text-ink-black"
          )}
        >
          Message Sent
        </h3>
        <p
          className={cn(
            "text-sm mb-6",
            isDark ? "text-ink-cream/40" : "text-ink-black/40"
          )}
        >
          We&apos;ll get back to you within 24 hours.
        </p>
        <Button
          variant="ink-outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Send Another
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn(
        "rounded-2xl border p-6 sm:p-8 space-y-4",
        isDark
          ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
          : "border-ink-black/[0.06] bg-ink-black/[0.02]",
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="name"
          label="Your Name"
          placeholder="Full name"
          variant={variant}
          required
        />
        <Input
          name="email"
          label="Email Address"
          placeholder="you@example.com"
          type="email"
          variant={variant}
          required
        />
      </div>

      <Select
        name="topic"
        label="What can we help with?"
        placeholder="Select a topic…"
        options={CONTACT_TOPICS}
        variant={variant}
        required
        defaultValue=""
      />

      <Textarea
        name="message"
        label="Message"
        placeholder="Tell us more…"
        variant={variant}
        required
      />

      {state?.error && (
        <p className="text-sm text-ink-red">{state.error}</p>
      )}

      <Button
        type="submit"
        variant="ink"
        size="md"
        disabled={pending}
        className="w-full sm:w-auto"
      >
        {pending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}

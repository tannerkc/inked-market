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
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContactForm, null);

  if (state?.success) {
    return (
      <div
        className={cn(
          "rounded-2xl border p-8 sm:p-10 text-center",
          "border-ink-black/[0.06] bg-ink-black/[0.02]",
          "dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]",
          className
        )}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-sage/15 dark:bg-ink-sage/10">
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
        <h3 className="text-lg font-semibold mb-2 text-ink-black dark:text-ink-cream">
          Message Sent
        </h3>
        <p className="text-sm mb-6 text-ink-black/40 dark:text-ink-cream/40">
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
        "border-ink-black/[0.06] bg-ink-black/[0.02]",
        "dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]",
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input name="name" label="Your Name" placeholder="Full name" required />
        <Input
          name="email"
          label="Email Address"
          placeholder="you@example.com"
          type="email"
          required
        />
      </div>

      <Select
        name="topic"
        label="What can we help with?"
        placeholder="Select a topic…"
        options={CONTACT_TOPICS}
        required
        defaultValue=""
      />

      <Textarea
        name="message"
        label="Message"
        placeholder="Tell us more…"
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

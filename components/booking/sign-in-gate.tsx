import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlowHeader } from "./flow-header";
import { StepList } from "./step-list";

const REQUEST_STEPS = [
  "Describe your idea",
  "Get a quote and proposed times",
  "A deposit locks in your appointment",
];

interface SignInGateProps {
  /** Tunes the copy: "request" for custom work, "booking" for consults + flash. */
  intent: "request" | "booking";
  entityName?: string;
}

/** The signed-out cover of a booking flow: sells the path instead of blocking it. */
export function SignInGate({ intent, entityName }: SignInGateProps) {
  const isRequest = intent === "request";
  return (
    <div className="space-y-5">
      <FlowHeader
        icon="sign-in"
        eyebrow={isRequest ? "Before you send" : "Before you book"}
        title={isRequest ? "Sign in to send your request" : "Sign in to book"}
      >
        {isRequest
          ? `Your idea goes straight to ${entityName ?? "the artist"}, and every reply lands in your dashboard.`
          : "Your appointment, reminders, and any changes all live in your dashboard."}
      </FlowHeader>

      {isRequest ? <StepList steps={REQUEST_STEPS} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ink" as={Link} href="/login" className="min-h-[44px]">
          Sign in
        </Button>
        <Button
          variant="ink-outline"
          as={Link}
          href="/signup/customer"
          className="min-h-[44px]"
        >
          Create an account
        </Button>
      </div>
      <p className="font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">
        {isRequest ? "No payment now — you approve the quote first" : "Takes less than a minute"}
      </p>
    </div>
  );
}

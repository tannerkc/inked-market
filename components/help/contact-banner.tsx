import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ContactBannerProps {
  variant?: "light" | "dark";
  className?: string;
}

function ContactBanner({ variant = "dark", className }: ContactBannerProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border",
        isDark
          ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
          : "border-ink-black/[0.06] bg-ink-black/[0.02]",
        className
      )}
    >
      <div className="text-center sm:text-left">
        <h4 className={cn(
          "text-sm font-semibold mb-1",
          isDark ? "text-ink-cream" : "text-ink-black"
        )}>
          Can&apos;t find what you&apos;re looking for?
        </h4>
        <p className={cn(
          "text-xs",
          isDark ? "text-ink-cream/30" : "text-ink-black/35"
        )}>
          Our team is here to help &mdash; reach out and we&apos;ll get back to
          you within 24 hours.
        </p>
      </div>
      <Button
        as={Link}
        href="/help/contact"
        variant="ink-outline"
        size="sm"
        leftIcon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
        className="shrink-0"
      >
        Contact Support
      </Button>
    </div>
  );
}

export { ContactBanner };

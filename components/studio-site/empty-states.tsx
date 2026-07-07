"use client";

import { cn } from "@/lib/utils";
import { useStudioSite, type ContentGroup } from "./studio-site-context";

/**
 * Builder-only affordance overlaid on real empty states. Renders nothing on
 * the public site (no onEditContent in context). Click never toggles the
 * section's style popover (stopPropagation).
 */
export function PromptChip({
  group,
  label,
  className,
}: {
  group: ContentGroup;
  label: string;
  className?: string;
}) {
  const { onEditContent } = useStudioSite();
  if (!onEditContent) return null;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onEditContent(group);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "text-[11px] font-semibold transition-transform duration-150 hover:scale-[1.03]",
        "focus-visible:outline-none focus-visible:ring-2",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
        className,
      )}
      style={{
        borderColor: "var(--accent)",
        color: "var(--accent)",
        backgroundColor: "var(--accent-bg)",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M5 1v8M1 5h8" />
      </svg>
      {label}
    </button>
  );
}

/**
 * A designed, public-facing empty state. Shown identically in the builder and
 * on the live site (full-parity decision). Inherits the active template's
 * fonts/colors so an empty section still looks unmistakably on-brand.
 */
export function SectionEmptyState({
  eyebrow,
  message,
  prompt,
  className,
}: {
  eyebrow?: string;
  message: string;
  prompt?: { group: ContentGroup; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
      {eyebrow ? <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--accent)" }}
        >
          {eyebrow}
        </p> : null}
      <p
        className="max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--text-muted)", fontFamily: "var(--body-font)" }}
      >
        {message}
      </p>
      {prompt ? <PromptChip group={prompt.group} label={prompt.label} /> : null}
    </div>
  );
}

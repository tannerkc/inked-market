"use client";

import { cn } from "@/lib/utils";
import type { ContentGroup } from "@/components/studio-site/studio-site-context";

export function GroupSection({
  id,
  title,
  saved,
  highlighted,
  children,
}: {
  id: ContentGroup;
  title: string;
  saved?: boolean;
  highlighted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      data-content-group={id}
      className={cn(
        "rounded-xl border bg-ink-black-raised p-4 transition-shadow duration-500",
        highlighted
          ? "border-ink-red/60 shadow-[0_0_0_1px_rgba(255,51,51,0.25)]"
          : "border-chrome-border",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-tertiary">
          {title}
        </h3>
        <span
          aria-live="polite"
          className={cn(
            "flex items-center gap-1 text-[10px] font-semibold text-ink-sage transition-opacity duration-300",
            saved ? "opacity-100" : "opacity-0",
          )}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M1.5 5.5 4 8l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Saved
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

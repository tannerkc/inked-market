"use client";

import { cn } from "@/lib/utils";

interface MagnumUpsellHintProps {
  title: string;
  description: string;
  className?: string;
}

export function MagnumUpsellHint({
  title,
  description,
  className,
}: MagnumUpsellHintProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-chrome-border bg-chrome-surface/60 p-4 opacity-60",
        className
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <svg className="h-4 w-4 text-chrome-text-dim" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <span className="text-xs font-medium text-chrome-text-primary">{title}</span>
        <span className="ml-auto rounded bg-ink-red/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-red">
          Magnum
        </span>
      </div>
      <p className="pl-6 text-[11px] leading-snug text-chrome-text-dim">
        {description}
      </p>
    </div>
  );
}

MagnumUpsellHint.displayName = "MagnumUpsellHint";

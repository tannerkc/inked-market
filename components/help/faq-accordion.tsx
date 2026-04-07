"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { HelpFaqItem } from "@/lib/data/help-types";

interface FaqAccordionProps {
  items: HelpFaqItem[];
  accentColor?: "red" | "rust" | "sage";
  variant?: "light" | "dark";
  allowMultiple?: boolean;
  className?: string;
}

function FaqAccordion({
  items,
  accentColor = "rust",
  variant = "dark",
  allowMultiple = false,
  className,
}: FaqAccordionProps) {
  const isDark = variant === "dark";
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            id={item.id}
            className={cn(
              "rounded-xl border transition-colors duration-300 scroll-mt-28",
              isOpen
                ? isDark
                  ? "border-ink-cream/[0.08] bg-ink-cream/[0.03]"
                  : "border-ink-black/[0.08] bg-ink-black/[0.03]"
                : isDark
                  ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
                  : "border-ink-black/[0.06] bg-ink-black/[0.02]"
            )}
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left group"
            >
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isOpen
                    ? isDark ? "text-ink-cream/80" : "text-ink-black/80"
                    : isDark
                      ? "text-ink-cream/50 group-hover:text-ink-cream/65"
                      : "text-ink-black/50 group-hover:text-ink-black/65"
                )}
              >
                {item.question}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={cn(
                  "shrink-0 ml-4 transition-transform duration-300",
                  isDark ? "text-ink-cream/25" : "text-ink-black/25",
                  isOpen && "rotate-180"
                )}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className={cn(
                "px-5 pb-5 text-sm leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-ink-rust/40 [&_strong]:font-medium",
                isDark
                  ? "text-ink-cream/45 [&_strong]:text-ink-cream/60"
                  : "text-ink-black/45 [&_strong]:text-ink-black/60"
              )}>
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { FaqAccordion };

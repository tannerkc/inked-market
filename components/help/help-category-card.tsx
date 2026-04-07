import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/icon-box";
import type { HelpCategory } from "@/lib/data/help-types";

interface HelpCategoryCardProps {
  category: HelpCategory;
  variant?: "light" | "dark";
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  "pen-tool": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  storefront: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

const HelpCategoryCard = React.forwardRef<HTMLAnchorElement, HelpCategoryCardProps>(
  ({ category, variant = "dark", className }, ref) => {
    const isDark = variant === "dark";

    return (
      <Link
        ref={ref}
        href={`/help/${category.slug}`}
        className={cn(
          "group relative block p-6 rounded-2xl border transition-all duration-300",
          isDark
            ? "border-ink-cream/[0.06] bg-ink-cream/[0.02] hover:bg-ink-cream/[0.04] hover:border-ink-cream/[0.1]"
            : "border-ink-black/[0.06] bg-ink-black/[0.02] hover:bg-ink-black/[0.04] hover:border-ink-black/[0.1]",
          className
        )}
      >
        <IconBox color={category.accentColor} size="md" className="mb-4">
          {iconMap[category.icon]}
        </IconBox>

        <h3 className={cn(
          "text-[15px] font-semibold mb-1.5",
          isDark ? "text-ink-cream" : "text-ink-black"
        )}>
          {category.title}
        </h3>
        <p className={cn(
          "text-xs leading-relaxed",
          isDark ? "text-ink-cream/30" : "text-ink-black/35"
        )}>
          {category.description}
        </p>

        <div className="flex items-center gap-2.5 mt-4">
          <span className={cn(
            "font-mono text-[9px] tracking-[0.1em]",
            isDark ? "text-ink-cream/18" : "text-ink-black/18"
          )}>
            {category.articleCount} articles
          </span>
          <div className="flex gap-1">
            {category.formats.map((f) => (
              <span
                key={f}
                className={cn(
                  "font-mono text-[8px] tracking-[0.06em] uppercase px-1.5 py-px rounded border",
                  isDark
                    ? "border-ink-cream/[0.06] text-ink-cream/22"
                    : "border-ink-black/[0.06] text-ink-black/22"
                )}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </Link>
    );
  }
);
HelpCategoryCard.displayName = "HelpCategoryCard";

export { HelpCategoryCard };

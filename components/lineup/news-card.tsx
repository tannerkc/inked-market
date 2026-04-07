import React from "react";
import { cn } from "@/lib/utils";
import type { LineupArticle } from "@/lib/types/lineup";

export interface NewsCardProps {
  article: LineupArticle;
  variant?: "light" | "dark";
  className?: string;
}

const NewsCard = React.forwardRef<HTMLDivElement, NewsCardProps>(
  ({ article, variant = "dark", className }, ref) => {
    const isLight = variant === "light";
    const { category, headline, excerpt, readTime, date } = article;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border p-6 transition-colors duration-200",
          isLight
            ? "border-ink-black/[0.08] hover:border-ink-black/[0.15] hover:bg-ink-black/[0.02]"
            : "border-ink-cream/[0.06] hover:border-ink-cream/[0.12] hover:bg-ink-cream/[0.02]",
          className
        )}
      >
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-rust mb-2.5">
          {category}
        </p>
        <h4
          className={cn(
            "text-lg font-bold leading-snug mb-2 transition-colors duration-500",
            isLight ? "text-ink-black" : "text-ink-cream"
          )}
        >
          {headline}
        </h4>
        <p
          className={cn(
            "text-sm leading-relaxed mb-3 transition-colors duration-500",
            isLight ? "text-ink-black/50" : "text-ink-cream/45"
          )}
        >
          {excerpt}
        </p>
        <p
          className={cn(
            "font-mono text-[11px] tracking-wide transition-colors duration-500",
            isLight ? "text-ink-black/25" : "text-ink-cream/25"
          )}
        >
          {date} · {readTime}
        </p>
      </div>
    );
  }
);

NewsCard.displayName = "NewsCard";

export { NewsCard };

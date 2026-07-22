import React from "react";
import { cn } from "@/lib/utils";
import type { LineupArticle } from "@/lib/types/lineup";

export interface NewsCardProps {
  article: LineupArticle;
  className?: string;
}

const NewsCard = React.forwardRef<HTMLDivElement, NewsCardProps>(
  ({ article, className }, ref) => {
    const { category, headline, excerpt, readTime, date } = article;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border p-6 transition-colors duration-200",
          "border-ink-black/[0.08] hover:border-ink-black/[0.15] hover:bg-ink-black/[0.02]",
          "dark:border-ink-cream/[0.06] dark:hover:border-ink-cream/[0.12] dark:hover:bg-ink-cream/[0.02]",
          className
        )}
      >
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-rust mb-2.5">
          {category}
        </p>
        <h4 className="text-lg font-bold leading-snug mb-2 transition-colors duration-500 text-ink-black dark:text-ink-cream">
          {headline}
        </h4>
        <p className="text-sm leading-relaxed mb-3 transition-colors duration-500 text-ink-black/50 dark:text-ink-cream/45">
          {excerpt}
        </p>
        <p className="font-mono text-[11px] tracking-wide transition-colors duration-500 text-ink-black/25 dark:text-ink-cream/25">
          {date} · {readTime}
        </p>
      </div>
    );
  }
);

NewsCard.displayName = "NewsCard";

export { NewsCard };

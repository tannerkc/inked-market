import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/ui/section-label";
import { dotColorMap } from "@/lib/constants/color-maps";
import type { HelpArticle } from "@/lib/data/help-types";

interface PopularArticlesProps {
  articles: HelpArticle[];
  className?: string;
}

function PopularArticles({ articles, className }: PopularArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <div className={cn("", className)}>
      <SectionLabel
        label="Popular Right Now"
        variant="muted"
        stretch
        className="mb-6"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${article.categorySlug}/${article.slug}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border text-xs transition-all",
              "border-ink-black/[0.05] text-ink-black/35 hover:bg-ink-black/[0.03] hover:border-ink-black/[0.1] hover:text-ink-black/60",
              "dark:border-ink-cream/[0.05] dark:text-ink-cream/35 dark:hover:bg-ink-cream/[0.03] dark:hover:border-ink-cream/[0.1] dark:hover:text-ink-cream/60"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                dotColorMap[article.accentColor]
              )}
            />
            {article.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export { PopularArticles };

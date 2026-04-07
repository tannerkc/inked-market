import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/ui/section-label";
import type { HelpArticle } from "@/lib/data/help-types";

interface PopularArticlesProps {
  articles: HelpArticle[];
  variant?: "light" | "dark";
  className?: string;
}

const dotColorMap: Record<string, string> = {
  red: "bg-ink-red shadow-[0_0_5px_rgba(255,51,51,0.3)]",
  rust: "bg-ink-rust shadow-[0_0_5px_rgba(183,118,74,0.3)]",
  sage: "bg-ink-sage shadow-[0_0_5px_rgba(122,140,110,0.3)]",
};

function PopularArticles({ articles, variant = "dark", className }: PopularArticlesProps) {
  if (articles.length === 0) return null;
  const isDark = variant === "dark";

  return (
    <div className={cn("", className)}>
      <SectionLabel
        label="Popular Right Now"
        variant={isDark ? "dark-muted" : "parchment"}
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
              isDark
                ? "border-ink-cream/[0.05] text-ink-cream/35 hover:bg-ink-cream/[0.03] hover:border-ink-cream/[0.1] hover:text-ink-cream/60"
                : "border-ink-black/[0.05] text-ink-black/35 hover:bg-ink-black/[0.03] hover:border-ink-black/[0.1] hover:text-ink-black/60"
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

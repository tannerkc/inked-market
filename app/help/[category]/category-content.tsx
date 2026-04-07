"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { PageHero, ContentCard, BackToTop } from "@/components/content";
import { FaqAccordion, ContactBanner } from "@/components/help";
import type { HelpCategory, HelpArticle, HelpFaqItem } from "@/lib/data/help-types";
import { cn } from "@/lib/utils";

function ArticleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

interface CategoryContentProps {
  category: HelpCategory;
  guideArticles: HelpArticle[];
  allFaqItems: HelpFaqItem[];
  slug: string;
}

export function CategoryContent({ category, guideArticles, allFaqItems, slug }: CategoryContentProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const accentColor = category.accentColor === "red"
    ? "red" as const
    : category.accentColor === "sage"
      ? "sage" as const
      : "rust" as const;

  return (
    <div className={isDark ? "min-h-screen bg-ink-black" : "min-h-screen bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"}>
      <PageHero
        headline={category.title.toUpperCase()}
        subtitle={category.description.slice(0, 60)}
        accentColor={accentColor}
        variant={mode}
        className="pb-10"
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 pb-32">
        {guideArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {guideArticles.map((article) => (
              <ContentCard
                key={article.slug}
                title={article.title}
                subtitle={article.tags.join(", ")}
                href={`/help/${slug}/${article.slug}`}
                icon={<ArticleIcon />}
                accentColor={category.accentColor}
                variant={mode}
                metadata={[{ label: "", value: article.format.toUpperCase() }]}
              />
            ))}
          </div>
        )}

        {allFaqItems.length > 0 && (
          <div className="mb-12">
            <p className={cn(
              "font-mono text-[9px] tracking-[0.25em] uppercase mb-4",
              isDark ? "text-ink-cream/20" : "text-ink-black/20"
            )}>
              Frequently Asked Questions
            </p>
            <FaqAccordion
              items={allFaqItems}
              accentColor={category.accentColor}
              variant={mode}
              allowMultiple
            />
          </div>
        )}

        <ContactBanner variant={mode} />
      </div>

      <BackToTop variant={mode} />
    </div>
  );
}

"use client";

import { useTheme } from "@/components/providers/theme-provider";
import {
  PageHero,
  ContentSidebar,
  ContentSection,
  ReadingProgress,
  BackToTop,
} from "@/components/content";
import { ContactBanner } from "@/components/help";
import type { HelpArticle } from "@/lib/data/help-types";

interface ArticleContentProps {
  article: HelpArticle;
  categorySlug: string;
}

export function ArticleContent({ article, categorySlug }: ArticleContentProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const accentColor =
    article.accentColor === "red"
      ? ("red" as const)
      : article.accentColor === "sage"
        ? ("sage" as const)
        : ("rust" as const);

  const sidebarSections = article.sections!.map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title,
  }));

  return (
    <div className={isDark ? "min-h-screen bg-ink-black" : "min-h-screen bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"}>
      <ReadingProgress accentColor={accentColor} />

      <PageHero
        headline={article.headline}
        subtitle={article.subtitle}
        accentColor={accentColor}
        variant={mode}
      />

      <div className="flex max-w-7xl mx-auto px-6 md:px-12 gap-12 pb-32">
        <ContentSidebar
          sections={sidebarSections}
          accentColor={accentColor}
          variant={mode}
          hubHref={`/help/${categorySlug}`}
          hubLabel="Back to Category"
        />

        <main className="flex-1 min-w-0 space-y-16">
          {article.sections!.map((section) => (
            <ContentSection
              key={section.id}
              id={section.id}
              number={section.number}
              title={section.title}
              personalityIntro={section.personalityIntro}
              accentColor={accentColor}
              variant={mode}
            >
              {section.content}
            </ContentSection>
          ))}

          <ContactBanner variant={mode} className="mt-16" />
        </main>
      </div>

      <BackToTop variant={mode} />
    </div>
  );
}

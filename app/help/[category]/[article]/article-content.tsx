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
    <div className="min-h-screen bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark dark:bg-ink-black dark:bg-none">
      <ReadingProgress accentColor={accentColor} />

      <PageHero
        headline={article.headline}
        subtitle={article.subtitle}
        accentColor={accentColor}
      />

      <div className="flex max-w-7xl mx-auto px-6 md:px-12 gap-12 pb-32">
        <ContentSidebar
          sections={sidebarSections}
          accentColor={accentColor}
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
            >
              {section.content}
            </ContentSection>
          ))}

          <ContactBanner className="mt-16" />
        </main>
      </div>

      <BackToTop />
    </div>
  );
}

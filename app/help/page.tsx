"use client";

import { Suspense } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { PageHero } from "@/components/content";
import { Divider } from "@/components/ui/divider";
import {
  HelpSearch,
  AudiencePills,
  PopularArticles,
  ContactBanner,
} from "@/components/help";
import { helpCategories } from "@/lib/data/help-categories";
import { getPopularArticles } from "@/lib/data/help-articles";
import { HelpCategoryGrid } from "./help-category-grid";

const popularArticles = getPopularArticles(8);

export default function HelpCenterPage() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={isDark ? "min-h-screen bg-ink-black" : "min-h-screen bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"}>
      <PageHero
        headline="HELP CENTER"
        subtitle="guides &middot; tutorials &middot; faq"
        eyebrow="We've Got Answers"
        accentColor="red"
        variant={mode}
        description="Everything you need to get the most out of Inked Market — whether you're discovering your next artist, managing your portfolio, or running your studio."
        statusText="Always here to help"
      >
        <Suspense>
          <HelpSearch variant={mode} className="mt-6 px-4" />
        </Suspense>
      </PageHero>

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <Suspense>
          <AudiencePills variant={mode} className="mb-8" />
        </Suspense>

        <Suspense>
          <HelpCategoryGrid categories={helpCategories} />
        </Suspense>

        <Divider variant={mode} className="my-12" />

        <PopularArticles articles={popularArticles} variant={mode} className="mb-12" />

        <ContactBanner variant={mode} className="mb-16" />
      </div>
    </div>
  );
}

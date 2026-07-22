import { Suspense } from "react";
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark dark:bg-ink-black dark:bg-none">
      <PageHero
        headline="HELP CENTER"
        subtitle="guides &middot; tutorials &middot; faq"
        eyebrow="We've Got Answers"
        accentColor="red"
        description="Everything you need to get the most out of Inked Market — whether you're discovering your next artist, managing your portfolio, or running your studio."
        statusText="Always here to help"
      >
        <Suspense>
          <HelpSearch className="mt-6 px-4" />
        </Suspense>
      </PageHero>

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <Suspense>
          <AudiencePills className="mb-8" />
        </Suspense>

        <Suspense>
          <HelpCategoryGrid categories={helpCategories} />
        </Suspense>

        <Divider className="my-12" />

        <PopularArticles articles={popularArticles} className="mb-12" />

        <ContactBanner className="mb-16" />
      </div>
    </div>
  );
}

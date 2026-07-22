import type { Metadata } from "next";
import { termsOfService } from "@/lib/data/legal-terms";
import { LegalHero } from "@/components/legal/legal-hero";
import { LegalSection } from "@/components/legal/legal-section";
import { LegalSidebar } from "@/components/legal/legal-sidebar";
import { ReadingProgress } from "@/components/legal/reading-progress";
import { BackToTop } from "@/components/content";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const sidebarSections = termsOfService.sections.map((s) => ({
  id: s.id,
  number: s.number,
  title: s.title,
}));

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-ink-black">
      <ReadingProgress accentColor="rust" />

      <LegalHero
        headline={termsOfService.headline}
        subtitle={termsOfService.subtitle}
        accentColor={termsOfService.accentColor}
        effectiveDate={termsOfService.effectiveDate}
        version={termsOfService.version}
      />

      <div className="flex max-w-7xl mx-auto px-6 md:px-12 gap-12 pb-32">
        <LegalSidebar
          sections={sidebarSections}
          accentColor="rust"
        />

        <main className="flex-1 min-w-0 space-y-16">
          {termsOfService.sections.map((section) => (
            <LegalSection
              key={section.id}
              id={section.id}
              number={section.number}
              title={section.title}
              personalityIntro={section.personalityIntro}
              accentColor="rust"
            >
              {section.content}
            </LegalSection>
          ))}
        </main>
      </div>

      <BackToTop />
    </div>
  );
}

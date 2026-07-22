import type { Metadata } from "next";
import { privacyPolicy } from "@/lib/data/legal-privacy";
import { LegalHero } from "@/components/legal/legal-hero";
import { LegalSection } from "@/components/legal/legal-section";
import { LegalSidebar } from "@/components/legal/legal-sidebar";
import { ReadingProgress } from "@/components/legal/reading-progress";
import { BackToTop } from "@/components/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const sidebarSections = privacyPolicy.sections.map((s) => ({
  id: s.id,
  number: s.number,
  title: s.title,
}));

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ink-black">
      <ReadingProgress accentColor="sage" />

      <LegalHero
        headline={privacyPolicy.headline}
        subtitle={privacyPolicy.subtitle}
        accentColor={privacyPolicy.accentColor}
        effectiveDate={privacyPolicy.effectiveDate}
        version={privacyPolicy.version}
      />

      <div className="flex max-w-7xl mx-auto px-6 md:px-12 gap-12 pb-32">
        <LegalSidebar
          sections={sidebarSections}
          accentColor="sage"
        />

        <main className="flex-1 min-w-0 space-y-16">
          {privacyPolicy.sections.map((section) => (
            <LegalSection
              key={section.id}
              id={section.id}
              number={section.number}
              title={section.title}
              personalityIntro={section.personalityIntro}
              accentColor="sage"
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

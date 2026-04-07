import type { Metadata } from "next";
import { LegalHero } from "@/components/legal/legal-hero";
import { LegalDocCard } from "@/components/legal/legal-doc-card";
import { privacyPolicy } from "@/lib/data/legal-privacy";
import { termsOfService } from "@/lib/data/legal-terms";

export const metadata: Metadata = {
  title: "Legal",
};

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h12a2 2 0 002-2v-2H10v2a2 2 0 01-2 2zm0 0a2 2 0 01-2-2V5a2 2 0 012-2h8l4 4v10" />
      <path d="M16 3v4h4" />
    </svg>
  );
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-ink-black">
      <LegalHero
        headline="THE FINE PRINT"
        subtitle="because transparency matters"
        badge="Legal Center"
        description="We keep things honest. Here&rsquo;s everything you need to know about how we handle your data and what you agree to when you use Inked Market."
        accentColor="rust"
      />

      <div className="max-w-2xl mx-auto px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LegalDocCard
            title="Your Ink, Your Data"
            subtitle="How we collect, use, and protect your personal information."
            href="/legal/privacy"
            icon={<ShieldIcon />}
            accentColor="sage"
            lastUpdated={privacyPolicy.effectiveDate}
            version={privacyPolicy.version}
          />
          <LegalDocCard
            title="The House Rules"
            subtitle="What you agree to when you use Inked Market."
            href="/legal/terms"
            icon={<ScrollIcon />}
            accentColor="rust"
            lastUpdated={termsOfService.effectiveDate}
            version={termsOfService.version}
          />
        </div>
      </div>
    </div>
  );
}

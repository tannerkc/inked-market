"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { PageHero, BackToTop } from "@/components/content";
import { ContactForm } from "@/components/help/contact-form";
import { cn } from "@/lib/utils";

export function ContactPageContent() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-ink-black"
          : "min-h-screen bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"
      }
    >
      <PageHero
        headline="CONTACT US"
        subtitle="questions · feedback · support"
        eyebrow="Get In Touch"
        accentColor="red"
        variant={mode}
        description="Have a question, found a bug, or want to work together? Drop us a line and we'll get back to you within 24 hours."
        statusText="Typically responds within 24 hours"
      />

      <div className="max-w-2xl mx-auto px-6 md:px-12 pb-32">
        <ContactForm variant={mode} className="mb-10" />

        <div className="text-center">
          <p
            className={cn(
              "font-mono text-[9px] tracking-[0.25em] uppercase mb-2",
              isDark ? "text-ink-cream/20" : "text-ink-black/20"
            )}
          >
            Or email us directly
          </p>
          <a
            href="mailto:support@inkedmarket.com"
            className={cn(
              "text-sm transition-colors duration-300",
              isDark
                ? "text-ink-cream/50 hover:text-ink-cream/80"
                : "text-ink-black/50 hover:text-ink-black/80"
            )}
          >
            support@inkedmarket.com
          </a>
        </div>
      </div>

      <BackToTop variant={mode} />
    </div>
  );
}

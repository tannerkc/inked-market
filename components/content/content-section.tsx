import React from "react";
import { cn } from "@/lib/utils";
import { bebasNeue } from "@/lib/fonts";
import type { InkAccentColor } from "@/lib/types";

type SectionAccentColor = InkAccentColor;

interface ContentSectionProps {
  id: string;
  number: string;
  title: string;
  personalityIntro?: string;
  accentColor?: SectionAccentColor;
  children: React.ReactNode;
  className?: string;
}

const numberColorMap: Record<SectionAccentColor, string> = {
  sage: "text-ink-sage/60",
  rust: "text-ink-rust/60",
  red: "text-ink-red/60",
};

const ContentSection = React.forwardRef<HTMLElement, ContentSectionProps>(
  (
    {
      id,
      number,
      title,
      personalityIntro,
      accentColor = "rust",
      children,
      className,
    },
    ref
  ) => (
    <section ref={ref} id={id} className={cn("scroll-mt-28", className)}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={cn(
              "font-mono text-[10px] tracking-[0.2em] uppercase shrink-0",
              numberColorMap[accentColor]
            )}
          >
            {number}
          </span>
          <div className="h-px flex-1 bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]" />
        </div>
        <h2
          className={cn(
            `${bebasNeue.className} text-2xl sm:text-3xl tracking-wide`,
            "text-ink-black dark:text-ink-cream"
          )}
        >
          {title}
        </h2>
      </div>

      {personalityIntro && (
        <p className="italic mb-6 text-[15px] leading-relaxed text-ink-black/40 dark:text-ink-cream/40">
          {personalityIntro}
        </p>
      )}

      <div className={cn(
        "leading-relaxed text-[15px] space-y-4",
        "text-ink-black/50 [&_h3]:text-ink-black/70 [&_strong]:text-ink-black/65 [&_th]:text-ink-black/60 [&_th]:border-ink-black/[0.06] [&_td]:border-ink-black/[0.04] [&_td]:text-ink-black/45",
        "dark:text-ink-cream/50 dark:[&_h3]:text-ink-cream/70 dark:[&_strong]:text-ink-cream/65 dark:[&_th]:text-ink-cream/60 dark:[&_th]:border-ink-cream/[0.06] dark:[&_td]:border-ink-cream/[0.04] dark:[&_td]:text-ink-cream/45",
        "[&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-ink-rust/40 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:marker:text-ink-rust/40 [&_a]:text-ink-rust [&_a]:hover:text-ink-rust/80 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-ink-rust/30 [&_strong]:font-medium [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:font-mono [&_th]:text-[11px] [&_th]:tracking-[0.1em] [&_th]:uppercase [&_th]:pb-2 [&_th]:border-b [&_td]:py-2 [&_td]:border-b"
      )}>
        {children}
      </div>
    </section>
  )
);
ContentSection.displayName = "ContentSection";

export { ContentSection };
export type { ContentSectionProps };

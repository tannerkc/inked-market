"use client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { useTheme } from "@/components/providers/theme-provider";

export function ArtistPortfolioSection() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <DashboardSection title="Portfolio" action={{ label: "+ Add work", onClick: () => {} }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {/* Upload CTA */}
        <div className={`aspect-square rounded-[14px] border border-dashed flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02] ${isDark ? "border-ink-cream/[0.1] bg-ink-cream/[0.02]" : "border-ink-black/[0.1] bg-ink-black/[0.02]"}`}>
          <div className="text-center">
            <div className={`text-[28px] ${isDark ? "text-ink-cream/10" : "text-ink-black/10"}`}>+</div>
            <div className={`font-mono text-[8px] tracking-[0.12em] uppercase ${isDark ? "text-ink-cream/10" : "text-ink-black/10"}`}>Upload</div>
          </div>
        </div>
        {/* Empty placeholder slots */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className={`aspect-square rounded-[14px] border border-dashed ${i < 2 ? (isDark ? "border-ink-cream/[0.06]" : "border-ink-black/[0.06]") : (isDark ? "border-ink-cream/[0.04]" : "border-ink-black/[0.04]")}`} />
        ))}
      </div>
    </DashboardSection>
  );
}

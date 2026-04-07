"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import type { StatusBadgeColor } from "@/components/ui/status-badge";
import type { DesignBrief, DesignBriefStatus } from "@/lib/types";

interface CustomerDesignBriefsSectionProps {
  briefs: DesignBrief[];
  onNewBrief: () => void;
  className?: string;
}

const briefStatusColors: Record<DesignBriefStatus, StatusBadgeColor> = {
  draft: BADGE_COLORS.muted,
  submitted: BADGE_COLORS.rust,
  "in-review": {
    dark: "border-ink-cream/10 text-ink-cream/50 bg-ink-cream/[0.06]",
    light: "border-ink-black/10 text-ink-black/50 bg-ink-black/[0.06]",
  },
  accepted: BADGE_COLORS.sage,
  declined: BADGE_COLORS.red,
};

function formatBudget(budget: { min: number; max: number }): string {
  return `$${budget.min} – $${budget.max}`;
}

const CustomerDesignBriefsSection = React.forwardRef<
  HTMLDivElement,
  CustomerDesignBriefsSectionProps
>(({ briefs, onNewBrief, className, ...props }, ref) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div ref={ref} className={className} {...props}>
      <DashboardSection
        title="Design Briefs"
        action={{ label: "New Brief", onClick: onNewBrief }}
      >
        {briefs.length === 0 ? (
          <EmptyState
            message="No design briefs yet"
            description="Start a consultation with an artist"
            action={{ label: "Create Brief", onClick: onNewBrief }}
          />
        ) : (
          <div className="space-y-1.5">
            {briefs.map((brief) => (
                <div
                  key={brief.id}
                  className={cn(
                    "py-2.5 px-3 rounded-lg transition-colors",
                    isDark
                      ? "bg-ink-cream/[0.03] hover:bg-ink-cream/[0.04]"
                      : "bg-ink-black/[0.03] hover:bg-ink-black/[0.04]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-[12px]",
                        isDark ? "text-ink-cream" : "text-ink-black"
                      )}
                    >
                      {brief.placement} &middot; {brief.size}
                    </p>

                    <StatusBadge
                      label={brief.status}
                      color={briefStatusColors[brief.status]}
                      className="flex-shrink-0"
                    />
                  </div>

                  {brief.artistName && (
                    <p
                      className={cn(
                        "text-[11px] mt-0.5",
                        isDark ? "text-ink-cream/40" : "text-ink-black/40"
                      )}
                    >
                      {brief.artistName}
                    </p>
                  )}

                  <p
                    className={cn(
                      "text-[11px] line-clamp-2 mt-1",
                      isDark ? "text-ink-cream/35" : "text-ink-black/35"
                    )}
                  >
                    {brief.description}
                  </p>

                  {brief.budget && (
                    <p
                      className={cn(
                        "font-mono text-[11px] tracking-[0.05em] mt-1",
                        isDark ? "text-ink-cream/30" : "text-ink-black/30"
                      )}
                    >
                      {formatBudget(brief.budget)}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
});
CustomerDesignBriefsSection.displayName = "CustomerDesignBriefsSection";

export { CustomerDesignBriefsSection };
export type { CustomerDesignBriefsSectionProps };

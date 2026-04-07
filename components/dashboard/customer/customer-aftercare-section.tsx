"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn, formatDate } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import type { AftercareTimeline } from "@/lib/types";

interface CustomerAftercareSectionProps {
  timelines: AftercareTimeline[];
  onToggleStep: (timelineId: string, stepId: string) => void;
  className?: string;
}

const CustomerAftercareSection = React.forwardRef<
  HTMLDivElement,
  CustomerAftercareSectionProps
>(({ timelines, onToggleStep, className, ...props }, ref) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div ref={ref} className={className} {...props}>
      <DashboardSection title="Aftercare">
        {timelines.length === 0 ? (
          <EmptyState
            message="No active aftercare plans"
            description="These appear after your appointments"
          />
        ) : (
          <div className="space-y-4">
            {timelines.map((timeline) => (
              <div
                key={timeline.id}
                className={cn(
                  "rounded-lg p-3",
                  isDark ? "bg-ink-cream/[0.03]" : "bg-ink-black/[0.03]"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <p
                    className={cn(
                      "text-[12px] font-semibold",
                      isDark ? "text-ink-cream" : "text-ink-black"
                    )}
                  >
                    {timeline.artistName}
                  </p>
                  <span
                    className={cn(
                      "font-mono text-[9px] tracking-[0.1em]",
                      isDark ? "text-ink-cream/25" : "text-ink-black/25"
                    )}
                  >
                    Started {formatDate(timeline.startDate)}
                  </span>
                </div>

                <div className="relative ml-2">
                  <div
                    className={cn(
                      "absolute left-[4px] top-1 bottom-1 w-px",
                      isDark ? "bg-ink-cream/[0.08]" : "bg-ink-black/[0.08]"
                    )}
                  />

                  <div className="space-y-3">
                    {timeline.steps.map((step) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => onToggleStep(timeline.id, step.id)}
                        className="flex items-start gap-3 w-full text-left cursor-pointer group"
                      >
                        <div className="relative flex-shrink-0 mt-0.5">
                          {step.completed ? (
                            <div className="w-[9px] h-[9px] rounded-full bg-ink-sage/60" />
                          ) : (
                            <div
                              className={cn(
                                "w-[9px] h-[9px] rounded-full border",
                                isDark
                                  ? "border-ink-cream/20 group-hover:border-ink-cream/40"
                                  : "border-ink-black/20 group-hover:border-ink-black/40"
                              )}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "font-mono text-[9px] tracking-[0.15em] uppercase mb-0.5",
                              isDark
                                ? "text-ink-cream/25"
                                : "text-ink-black/25"
                            )}
                          >
                            Day {step.day}
                          </p>
                          <p
                            className={cn(
                              "text-[12px]",
                              step.completed
                                ? isDark
                                  ? "text-ink-cream/30 line-through"
                                  : "text-ink-black/30 line-through"
                                : isDark
                                  ? "text-ink-cream"
                                  : "text-ink-black"
                            )}
                          >
                            {step.title}
                          </p>
                          <p
                            className={cn(
                              "text-[11px] mt-0.5",
                              isDark
                                ? "text-ink-cream/35"
                                : "text-ink-black/35"
                            )}
                          >
                            {step.instructions}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {timeline.customNotes && (
                  <div
                    className={cn(
                      "flex items-start gap-2 mt-3 pt-2.5 border-t",
                      isDark
                        ? "border-ink-cream/[0.06]"
                        : "border-ink-black/[0.06]"
                    )}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className={cn(
                        "flex-shrink-0 mt-0.5",
                        isDark ? "text-ink-cream/25" : "text-ink-black/25"
                      )}
                    >
                      <path
                        d="M7 1H3C2.44772 1 2 1.44772 2 2V10C2 10.5523 2.44772 11 3 11H9C9.55228 11 10 10.5523 10 10V4L7 1Z"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 1V4H10"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p
                      className={cn(
                        "text-[11px] italic",
                        isDark ? "text-ink-cream/30" : "text-ink-black/30"
                      )}
                    >
                      {timeline.customNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
});
CustomerAftercareSection.displayName = "CustomerAftercareSection";

export { CustomerAftercareSection };
export type { CustomerAftercareSectionProps };

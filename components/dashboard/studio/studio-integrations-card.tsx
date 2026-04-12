"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { INTEGRATION_PLATFORMS } from "@/lib/data/integration-platforms";

interface StudioIntegrationsCardProps {
  connectedCount: number;
  onOpen: () => void;
}

export function StudioIntegrationsCard({ connectedCount, onOpen }: StudioIntegrationsCardProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const totalCount = INTEGRATION_PLATFORMS.length;

  return (
    <div className="mb-6">
      <h3 className={cn(
        "font-mono text-[9px] tracking-[0.2em] uppercase mb-2.5",
        isDark ? "text-ink-cream/35" : "text-ink-black/35"
      )}>
        Integrations
      </h3>

      <div className={cn(
        "rounded-[20px] border p-5",
        isDark ? "bg-ink-cream/[0.02] border-ink-cream/[0.06]" : "bg-ink-black/[0.02] border-ink-black/[0.06]"
      )}>
        {/* Icon */}
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center mb-3 border",
          "bg-ink-sage/[0.06] border-ink-sage/[0.1]"
        )}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-ink-sage">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>

        {/* Count */}
        <p className={cn("text-[13px] font-medium mb-0.5", isDark ? "text-ink-cream/70" : "text-ink-black/70")}>
          {connectedCount > 0 ? `${connectedCount} linked` : "No services linked"}
        </p>
        <p className={cn("text-[10px] mb-4", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
          {connectedCount > 0
            ? `${connectedCount} of ${totalCount} available integrations`
            : "Connect Google, Yelp, booking tools, and more"
          }
        </p>

        {/* Progress bar */}
        <div className={cn("w-full h-1 rounded-full mb-4", isDark ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]")}>
          <div
            className="h-full rounded-full bg-ink-sage/60 transition-all duration-500"
            style={{ width: `${Math.min((connectedCount / totalCount) * 100, 100)}%` }}
          />
        </div>

        <Button
          variant={isDark ? "ink-light-outline" : "ink-outline"}
          size="sm"
          className="w-full"
          onClick={onOpen}
        >
          Manage Integrations
        </Button>
      </div>
    </div>
  );
}

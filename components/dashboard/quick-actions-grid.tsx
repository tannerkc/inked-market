"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { SectionLabel } from "@/components/ui/section-label";
import type { QuickAction } from "@/lib/types";

interface QuickActionsGridProps {
  actions: QuickAction[];
}

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <>
      <SectionLabel
        label="quick actions"
        variant={isDark ? "dark-muted" : "parchment"}
        stretch
        className="my-6"
      />
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((action) => (
          <button
            type="button"
            key={action.label}
            onClick={action.onClick}
            className={`rounded-2xl p-4 border cursor-pointer transition-all hover:-translate-y-px text-left ${isDark ? "bg-ink-cream/[0.03] border-ink-cream/[0.06] hover:border-ink-cream/[0.12]" : "bg-ink-black/[0.02] border-ink-black/[0.06] hover:border-ink-black/[0.12]"}`}
          >
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center mb-2.5 border ${action.iconBgClass || (isDark ? "bg-ink-red/[0.06]" : "bg-ink-rust/[0.06]")} ${action.iconBorderClass || (isDark ? "border-ink-red/[0.1]" : "border-ink-rust/[0.1]")}`}>
              {action.icon}
            </div>
            <p className={`text-[12px] font-medium mb-0.5 ${isDark ? "text-ink-cream/70" : "text-ink-black/70"}`}>{action.label}</p>
            <p className={`text-[10px] ${isDark ? "text-ink-cream/25" : "text-ink-black/25"}`}>{action.description}</p>
          </button>
        ))}
      </div>
    </>
  );
}

"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { bebasNeue } from "@/lib/fonts";
import type { DashboardStat } from "@/lib/types";

interface StatsPanelProps {
  stats: DashboardStat[];
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={`rounded-[20px] p-5 border ${isDark ? "bg-ink-cream/[0.03] border-ink-cream/[0.06]" : "bg-ink-black/[0.02] border-ink-black/[0.06]"}`}>
      <p className={`font-mono text-[9px] tracking-[0.2em] uppercase mb-3 ${isDark ? "text-ink-cream/35" : "text-ink-black/35"}`}>This Week</p>
      <div className="grid grid-cols-3 text-center">
        {stats.map((stat, i) => (
          <div key={stat.label} className={i < stats.length - 1 ? `border-r ${isDark ? "border-ink-cream/[0.06]" : "border-ink-black/[0.06]"}` : ""}>
            <div className={`${bebasNeue.className} text-[32px] tracking-wider leading-none ${stat.empty ? (isDark ? "text-ink-cream/25" : "text-ink-black/25") : (isDark ? "text-ink-cream" : "text-ink-black")}`}>
              {stat.value}
            </div>
            <div className={`font-mono text-[8px] tracking-[0.15em] uppercase mt-1 ${isDark ? "text-ink-cream/30" : "text-ink-black/30"}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

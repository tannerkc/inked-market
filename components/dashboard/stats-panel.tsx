import * as React from "react";
import { bebasNeue } from "@/lib/fonts";
import type { DashboardStat } from "@/lib/types";

interface StatsPanelProps {
  stats: DashboardStat[];
  title?: string;
}

export function StatsPanel({ stats, title = "This Week" }: StatsPanelProps) {
  return (
    <div className="rounded-[20px] p-5 border bg-ink-black/[0.02] border-ink-black/[0.06] dark:bg-ink-cream/[0.03] dark:border-ink-cream/[0.06]">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-black/60 dark:text-ink-cream/60">{title}</p>
      <div className="grid grid-cols-3 text-center">
        {stats.map((stat, i) => (
          <div key={stat.label} className={i < stats.length - 1 ? "border-r border-ink-black/[0.06] dark:border-ink-cream/[0.06]" : ""}>
            <div className={`${bebasNeue.className} text-[32px] tracking-wider leading-none ${stat.empty ? "text-ink-black/40 dark:text-ink-cream/40" : "text-ink-black dark:text-ink-cream"}`}>
              {stat.value}
            </div>
            <div className="font-mono text-[8px] tracking-[0.15em] uppercase mt-1 text-ink-black/60 dark:text-ink-cream/60">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

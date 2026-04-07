"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import type { BillingCycle, BillingStatus, TierSlug } from "@/lib/types";

interface PlanCardProps {
  plan: TierSlug | null;
  status: BillingStatus;
  cycle: BillingCycle;
  nextBillingDate?: string;
  cancelledAt?: string;
  isFree?: boolean;
  className?: string;
}

const TIER_LABELS: Record<string, string> = {
  liner: "Liner",
  shader: "Shader",
  magnum: "Magnum",
};

function formatPrice(plan: TierSlug | null, cycle: BillingCycle, isFree: boolean): string {
  if (isFree) return "Free";
  const prices: Record<string, { monthly: number; annual: number }> = {
    liner: { monthly: 19.85, annual: 15.85 },
    shader: { monthly: 14.85, annual: 11.85 },
    magnum: { monthly: 79.85, annual: 63.85 },
  };
  // Artist shader vs studio liner/shader/magnum
  if (!plan || !prices[plan]) return "Free";
  const p = prices[plan];
  return `$${cycle === "annual" ? p.annual : p.monthly}/mo`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PlanCard = React.forwardRef<HTMLDivElement, PlanCardProps>(
  ({ plan, status, cycle, nextBillingDate, cancelledAt, isFree, className }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[16px] border p-5",
          isDark
            ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
            : "border-ink-black/[0.06] bg-ink-black/[0.02]",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <span
            className={cn(
              "font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-md font-medium",
              plan === "magnum"
                ? "bg-ink-rust/15 text-ink-rust"
                : plan === "shader"
                  ? "bg-ink-red/15 text-ink-red"
                  : isDark
                    ? "bg-ink-cream/[0.06] text-ink-cream/50"
                    : "bg-ink-black/[0.06] text-ink-black/50"
            )}
          >
            {plan ? TIER_LABELS[plan] : "No Plan"}
          </span>
          {status === "cancelled" && (
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-ink-red/60">
              Cancels {formatDate(nextBillingDate)}
            </span>
          )}
        </div>

        <p className={cn("text-[22px] font-semibold", isDark ? "text-ink-cream/80" : "text-ink-black/80")}>
          {formatPrice(plan, cycle, !!isFree)}
        </p>

        {!isFree && status === "active" && (
          <div className="mt-2 space-y-0.5">
            <p className={cn("text-[10px]", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
              Billed {cycle === "annual" ? "annually" : "monthly"}
            </p>
            {nextBillingDate && (
              <p className={cn("text-[10px]", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
                Next billing: {formatDate(nextBillingDate)}
              </p>
            )}
          </div>
        )}

        {status === "cancelled" && cancelledAt && (
          <p className={cn("text-[10px] mt-2", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
            Cancelled on {formatDate(cancelledAt)}. Access continues until {formatDate(nextBillingDate)}.
          </p>
        )}
      </div>
    );
  }
);
PlanCard.displayName = "PlanCard";

export { PlanCard };

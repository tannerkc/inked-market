import * as React from "react";
import { cn } from "@/lib/utils";
import type { BillingCycle, BillingStatus, TierSlug } from "@/lib/types";
import {
  artistTiers as signupArtistTiers,
  studioTiers as signupStudioTiers,
} from "@/lib/data/signup-tiers";

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

const tierPrices: Record<string, { monthly: number; annual: number }> = Object.fromEntries(
  [...signupStudioTiers, ...signupArtistTiers]
    .filter((t) => t.price > 0)
    .map((t) => [t.slug, { monthly: t.price, annual: t.annualPrice ?? t.price }])
);

function formatPrice(plan: TierSlug | null, cycle: BillingCycle, isFree: boolean): string {
  if (isFree) return "Free";
  if (!plan || !tierPrices[plan]) return "Free";
  const p = tierPrices[plan];
  return `$${cycle === "annual" ? p.annual : p.monthly}/mo`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PlanCard = React.forwardRef<HTMLDivElement, PlanCardProps>(
  ({ plan, status, cycle, nextBillingDate, cancelledAt, isFree, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[16px] border p-5",
        "border-ink-black/[0.06] bg-ink-black/[0.02]",
        "dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]",
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
                : "bg-ink-black/[0.06] text-ink-black/50 dark:bg-ink-cream/[0.06] dark:text-ink-cream/50"
          )}
        >
          {plan ? TIER_LABELS[plan] : "No Plan"}
        </span>
        {cancelledAt && status !== "cancelled" && (
          <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-ink-red/60">
            Cancels {formatDate(cancelledAt)}
          </span>
        )}
        {status === "trialing" && (
          <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-ink-rust/70">
            Free Trial
          </span>
        )}
      </div>

      <p className="text-[22px] font-semibold text-ink-black/80 dark:text-ink-cream/80">
        {formatPrice(plan, cycle, !!isFree)}
      </p>

      {!isFree && (status === "active" || status === "past_due") && (
        <div className="mt-2 space-y-0.5">
          <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">
            Billed {cycle === "annual" ? "annually" : "monthly"}
          </p>
          {nextBillingDate && (
            <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">
              Next billing: {formatDate(nextBillingDate)}
            </p>
          )}
        </div>
      )}

      {!isFree && status === "trialing" && nextBillingDate && (
        <p className="text-[10px] mt-2 text-ink-black/25 dark:text-ink-cream/25">
          Free trial — first bill {formatDate(nextBillingDate)}
        </p>
      )}

      {status === "past_due" && (
        <p className="text-[10px] mt-2 text-ink-red/60">
          Payment issue — update your card to keep your plan.
        </p>
      )}
    </div>
  )
);
PlanCard.displayName = "PlanCard";

export { PlanCard };

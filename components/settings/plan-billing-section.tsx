"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { PlanCard } from "./plan-card";
import { PlanComparison } from "./plan-comparison";
import { BillingCycleToggle } from "./billing-cycle-toggle";
import { usePlanBilling } from "./use-plan-billing";

export function PlanBillingSection() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const {
    role,
    tiers,
    currentPlan,
    status,
    cycle,
    setCycle,
    billing,
    changePlan,
    cancelPlan,
    resumePlan,
    showConfirmCancel,
    setShowConfirmCancel,
  } = usePlanBilling();

  const isFree = role === "artist" && currentPlan === "liner";
  const isStudioDraft = role === "studio" && status === "draft";

  return (
    <SettingsSection title="Plan & Billing" description="Manage your subscription and billing preferences">
      {/* Studio Draft State */}
      {isStudioDraft && (
        <div
          className={cn(
            "rounded-[16px] border border-dashed p-6 text-center mb-6",
            isDark ? "border-ink-cream/[0.08]" : "border-ink-black/[0.08]"
          )}
        >
          <p className={cn("text-[14px] font-medium mb-1", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
            Your studio is in draft mode
          </p>
          <p className={cn("text-[11px] mb-4", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
            You have full access to the page builder. Choose a plan when you&apos;re ready to publish.
          </p>
        </div>
      )}

      {/* Current Plan Card (not shown for studio draft) */}
      {!isStudioDraft && (
        <PlanCard
          plan={currentPlan}
          status={status}
          cycle={cycle}
          nextBillingDate={billing.nextBillingDate}
          cancelledAt={billing.cancelledAt}
          isFree={isFree}
          className="mb-6"
        />
      )}

      {/* Resume button for cancelled plans */}
      {status === "cancelled" && (
        <Button variant="ink" size="sm" className="mb-6" onClick={resumePlan}>
          Resume Plan
        </Button>
      )}

      {/* Billing Cycle Toggle */}
      <BillingCycleToggle cycle={cycle} onChange={setCycle} className="mb-5" />

      {/* Plan Comparison */}
      <PlanComparison
        tiers={tiers}
        currentPlan={currentPlan}
        cycle={cycle}
        onSelect={changePlan}
        className="mb-6"
      />

      {/* Cancel Subscription */}
      {!isFree && !isStudioDraft && status === "active" && (
        <>
          <div className={cn("border-t pt-4 mt-2", isDark ? "border-ink-cream/[0.04]" : "border-ink-black/[0.04]")}>
            {!showConfirmCancel ? (
              <button
                type="button"
                onClick={() => setShowConfirmCancel(true)}
                className={cn(
                  "font-mono text-[9px] tracking-[0.12em] uppercase cursor-pointer transition-colors",
                  isDark ? "text-ink-cream/25 hover:text-ink-red/60" : "text-ink-black/25 hover:text-ink-red/60"
                )}
              >
                Cancel Subscription
              </button>
            ) : (
              <div
                className={cn(
                  "rounded-[14px] border border-dashed p-4",
                  "border-ink-red/20 bg-ink-red/[0.03]"
                )}
              >
                <p className={cn("text-[12px] font-medium mb-1", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
                  Are you sure?
                </p>
                <p className={cn("text-[10px] mb-3", isDark ? "text-ink-cream/30" : "text-ink-black/30")}>
                  {billing.nextBillingDate
                    ? `Your plan stays active until ${new Date(billing.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. After that:`
                    : "After cancellation:"}
                </p>
                <ul className={cn("text-[10px] space-y-1 mb-4 pl-3", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
                  {role === "artist" ? (
                    <>
                      <li>• Your profile will be removed from Discover</li>
                      <li>• Your portfolio remains accessible via direct link</li>
                    </>
                  ) : (
                    <>
                      <li>• Your public listing will be unpublished</li>
                      <li>• Your affiliated artists will be notified</li>
                    </>
                  )}
                </ul>
                <div className="flex gap-2">
                  <Button
                    variant={isDark ? "ink-light-outline" : "ink-outline"}
                    size="sm"
                    onClick={() => setShowConfirmCancel(false)}
                  >
                    Keep Plan
                  </Button>
                  <Button variant="ink-red" size="sm" onClick={cancelPlan}>
                    Cancel Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </SettingsSection>
  );
}

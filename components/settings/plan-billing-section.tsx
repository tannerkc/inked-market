"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { PlanCard } from "./plan-card";
import { PlanComparison } from "./plan-comparison";
import { BillingCycleToggle } from "./billing-cycle-toggle";
import { usePlanBilling } from "./use-plan-billing";

export function PlanBillingSection() {
  const {
    role,
    tiers,
    currentPlan,
    tierSource,
    status,
    nextBillingDate,
    cancelledAt,
    cycle,
    setCycle,
    changePlan,
    cancelPlan,
    manageBilling,
    busy,
    showConfirmCancel,
    setShowConfirmCancel,
  } = usePlanBilling();

  const isFree = role === "artist" && currentPlan === "liner" && tierSource !== "subscription";
  const isStudioDraft = role === "studio" && currentPlan === null;
  const isComped = tierSource === "grant";
  const hasSubscription = tierSource === "subscription";

  return (
    <SettingsSection title="Plan & Billing" description="Manage your subscription and billing preferences">
      {/* Studio Draft State */}
      {isStudioDraft ? <div className="rounded-[16px] border border-dashed p-6 text-center mb-6 border-ink-black/[0.08] dark:border-ink-cream/[0.08]">
          <p className="text-[14px] font-medium mb-1 text-ink-black/60 dark:text-ink-cream/60">
            Your studio is in draft mode
          </p>
          <p className="text-[11px] mb-4 text-ink-black/25 dark:text-ink-cream/25">
            You have full access to the page builder. Choose a plan when you&apos;re ready to publish.
          </p>
        </div> : null}

      {/* Complimentary access (staff grant) — nothing to bill or cancel */}
      {isComped ? <div className="rounded-[16px] border border-dashed p-4 mb-6 border-ink-red/20 bg-ink-red/[0.03]">
          <p className="text-[12px] font-medium mb-0.5 text-ink-black/60 dark:text-ink-cream/60">
            Complimentary access
          </p>
          <p className="text-[10px] text-ink-black/30 dark:text-ink-cream/30">
            Your {currentPlan} plan was granted by Inked Market. No billing required.
          </p>
        </div> : null}

      {/* Current Plan Card (not shown for studio draft) */}
      {!isStudioDraft ? <PlanCard
          plan={currentPlan}
          status={status}
          cycle={cycle}
          nextBillingDate={nextBillingDate ?? undefined}
          cancelledAt={cancelledAt ?? undefined}
          isFree={isFree || isComped}
          className="mb-6"
        /> : null}

      {/* Payment issue: card update lives in the Stripe portal */}
      {status === "past_due" ? <Button variant="ink" size="sm" className="mb-6" onClick={manageBilling} disabled={busy}>
          Update Payment Method
        </Button> : null}

      {/* Resume for cancel-at-period-end subscriptions (still active until then) */}
      {cancelledAt && status !== "cancelled" && hasSubscription ? <Button variant="ink" size="sm" className="mb-6" onClick={manageBilling} disabled={busy}>
          Resume Plan
        </Button> : null}

      {/* Billing Cycle Toggle */}
      <BillingCycleToggle cycle={cycle} onChange={setCycle} className="mb-5" />

      {/* Plan Comparison — selecting a paid tier starts Stripe Checkout */}
      <PlanComparison
        tiers={tiers}
        currentPlan={currentPlan}
        cycle={cycle}
        onSelect={changePlan}
        className="mb-6"
      />

      {/* Manage / Cancel subscription (Stripe Customer Portal) */}
      {hasSubscription ? <div className="border-t pt-4 mt-2 border-ink-black/[0.04] dark:border-ink-cream/[0.04]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={manageBilling}
              disabled={busy}
              className="font-mono text-[9px] tracking-[0.12em] uppercase cursor-pointer transition-colors text-ink-black/40 hover:text-ink-black/70 dark:text-ink-cream/40 dark:hover:text-ink-cream/70"
            >
              Manage Billing
            </button>
            {!cancelledAt && (status === "active" || status === "trialing") && !showConfirmCancel ? <button
                type="button"
                onClick={() => setShowConfirmCancel(true)}
                className="font-mono text-[9px] tracking-[0.12em] uppercase cursor-pointer transition-colors text-ink-black/25 hover:text-ink-red/60 dark:text-ink-cream/25 dark:hover:text-ink-red/60"
              >
                Cancel Subscription
              </button> : null}
          </div>
          {showConfirmCancel ? <div className={cn(
              "rounded-[14px] border border-dashed p-4 mt-3",
              "border-ink-red/20 bg-ink-red/[0.03]"
            )}>
              <p className="text-[12px] font-medium mb-1 text-ink-black/60 dark:text-ink-cream/60">
                Are you sure?
              </p>
              <p className="text-[10px] mb-3 text-ink-black/30 dark:text-ink-cream/30">
                {nextBillingDate
                  ? `Your plan stays active until ${new Date(nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. After that:`
                  : "After cancellation:"}
              </p>
              <ul className="text-[10px] space-y-1 mb-4 pl-3 text-ink-black/25 dark:text-ink-cream/25">
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
                <Button variant="ink-outline" size="sm" onClick={() => setShowConfirmCancel(false)}>
                  Keep Plan
                </Button>
                <Button variant="ink-red" size="sm" onClick={cancelPlan} disabled={busy}>
                  Continue to Cancel
                </Button>
              </div>
            </div> : null}
        </div> : null}
    </SettingsSection>
  );
}

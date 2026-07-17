"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useEntitlement } from "@/lib/hooks/use-entitlement";
import { artistTiers, studioTiers } from "@/lib/data/signup-tiers";
import { startCheckout, openBillingPortal } from "@/app/billing/actions";
import type { BillingCycle, TierSlug } from "@/lib/types";

/** Billing state + actions, backed by profiles (the entitlement engine's
 *  output) and Stripe Checkout/Portal. This client never mutates billing
 *  fields — lapse/downgrade/unpublish all happen server-side (webhook sync,
 *  cron sweep), so the old client-side lapse sweep is gone. */
export function usePlanBilling() {
  const { user } = useAuth();
  const role = user?.role ?? "customer";
  const entitlement = useEntitlement();

  // Artists are always at least Liner (free tier); studios start with nothing.
  const currentPlan: TierSlug | null =
    entitlement.tier ?? (role === "artist" ? "liner" : null);

  const tiers = role === "studio" ? studioTiers : artistTiers;
  const [cycle, setCycle] = useState<BillingCycle>(entitlement.cycle);
  const [busy, setBusy] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Paid plan changes all go through Stripe Checkout; the webhook + return
  // route write the new state.
  const changePlan = useCallback(
    (newPlan: TierSlug) => {
      if (busy) return;
      setBusy(true);
      void startCheckout({ tier: newPlan, cycle, intent: "upgrade" }).then((r) => {
        if (r.url) window.location.assign(r.url);
        else setBusy(false);
      });
    },
    [busy, cycle]
  );

  // Cancel/resume/card/plan-switch for existing subscribers: Stripe Portal.
  const manageBilling = useCallback(() => {
    if (busy) return;
    setBusy(true);
    void openBillingPortal().then((r) => {
      if (r.url) window.location.assign(r.url);
      else setBusy(false);
    });
  }, [busy]);

  const cancelPlan = useCallback(() => {
    setShowConfirmCancel(false);
    manageBilling();
  }, [manageBilling]);

  return {
    role,
    tiers,
    currentPlan,
    tierSource: entitlement.source,
    status: entitlement.status,
    nextBillingDate: entitlement.nextBillingDate,
    cancelledAt: entitlement.cancelledAt,
    cycle,
    setCycle,
    changePlan,
    cancelPlan,
    manageBilling,
    busy,
    showConfirmCancel,
    setShowConfirmCancel,
  };
}

"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { artistTiers, studioTiers } from "@/lib/data/signup-tiers";
import type { BillingInfo, BillingCycle, BillingStatus, TierSlug } from "@/lib/types";

const DEFAULT_BILLING: BillingInfo = {
  plan: null,
  cycle: "monthly",
  status: "draft",
};

export function usePlanBilling() {
  const { user, updateUser } = useAuth();
  const role = user?.role ?? "customer";
  const billing: BillingInfo = { ...DEFAULT_BILLING, ...user?.billing };

  // Derive plan from legacy `plan` field if billing not yet set
  const effectivePlan = useMemo((): TierSlug | null => {
    if (billing.plan) return billing.plan;
    // Map legacy plan names
    const legacy = user?.plan?.toLowerCase();
    if (!legacy || legacy === "free") return role === "artist" ? "liner" : null;
    if (legacy === "pro" || legacy === "shader") return "shader";
    if (legacy === "basic" || legacy === "liner") return "liner";
    if (legacy === "studio" || legacy === "magnum") return "magnum";
    return null;
  }, [billing.plan, user?.plan, role]);

  const effectiveStatus = useMemo((): BillingStatus => {
    if (billing.status !== "draft") return billing.status;
    if (effectivePlan && (role === "artist" ? effectivePlan !== "liner" : true)) return "active";
    if (role === "artist") return "active"; // artists always have at least liner
    return "draft"; // studio with no plan
  }, [billing.status, effectivePlan, role]);

  const tiers = role === "studio" ? studioTiers : artistTiers;
  const [cycle, setCycle] = useState<BillingCycle>(billing.cycle);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const changePlan = useCallback(
    (newPlan: TierSlug) => {
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + (cycle === "annual" ? 12 : 1));

      const updated: BillingInfo = {
        plan: newPlan,
        cycle,
        status: "active",
        nextBillingDate: nextBilling.toISOString(),
        cancelledAt: undefined,
      };
      updateUser({ billing: updated, plan: newPlan });
    },
    [cycle, updateUser]
  );

  const cancelPlan = useCallback(() => {
    const updated: BillingInfo = {
      ...billing,
      plan: effectivePlan,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    };
    updateUser({ billing: updated });
    setShowConfirmCancel(false);
  }, [billing, effectivePlan, updateUser]);

  const resumePlan = useCallback(() => {
    const updated: BillingInfo = {
      ...billing,
      plan: effectivePlan,
      status: "active",
      cancelledAt: undefined,
    };
    updateUser({ billing: updated });
  }, [billing, effectivePlan, updateUser]);

  return {
    role,
    tiers,
    currentPlan: effectivePlan,
    status: effectiveStatus,
    cycle,
    setCycle,
    billing,
    changePlan,
    cancelPlan,
    resumePlan,
    showConfirmCancel,
    setShowConfirmCancel,
  };
}

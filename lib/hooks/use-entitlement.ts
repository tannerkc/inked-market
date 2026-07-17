"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import type { BillingCycle, BillingStatus, TierSlug } from "@/lib/types";

interface EntitlementState {
  tier: TierSlug | null;
  source: "subscription" | "grant" | null;
  status: BillingStatus;
  cycle: BillingCycle;
  nextBillingDate: string | null;
  cancelledAt: string | null;
}

const EMPTY: EntitlementState = {
  tier: null, source: null, status: "none", cycle: "monthly",
  nextBillingDate: null, cancelledAt: null,
};

/** Billing truth for the signed-in user, read from profiles (RLS: own row).
 *  Written only by the server entitlement engine — the client never mutates
 *  billing state. Artists with no paid plan are effectively liner; callers
 *  get that via tier ?? (role === "artist" ? "liner" : null).
 *  All setState happens in the async fetch resolution (never synchronously
 *  inside the effect), per the repo's set-state-in-effect rule. */
export function useEntitlement() {
  const { user } = useAuth();
  const userId = user?.id;
  const [loaded, setLoaded] = useState<{ forUser: string; state: EntitlementState } | null>(null);

  const refresh = useCallback(() => {
    if (!userId) return;
    void createClient()
      .from("profiles")
      .select("tier, tier_source, billing_status, billing_cycle, next_billing_date, cancelled_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setLoaded({
          forUser: userId,
          state: data
            ? {
                tier: data.tier, source: data.tier_source, status: data.billing_status,
                cycle: data.billing_cycle, nextBillingDate: data.next_billing_date,
                cancelledAt: data.cancelled_at,
              }
            : EMPTY,
        });
      });
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const current = userId && loaded?.forUser === userId ? loaded.state : EMPTY;
  const loading = Boolean(userId) && loaded?.forUser !== userId;
  return { ...current, loading, refresh };
}

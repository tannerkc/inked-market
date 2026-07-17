import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveEntitlement, type Entitlement } from "./entitlements-core";
import { unpublishStudioForOwner } from "@/lib/studios/publish";

/** Reads Stripe mirror + grants, stamps the effective tier onto profiles, and
 *  enforces studio publish/visibility consequences. Every writer converges
 *  here (webhook sync, verify-on-return, staff grants, sweeps). */
export async function recomputeEntitlements(admin: SupabaseClient, userId: string): Promise<Entitlement> {
  const [{ data: bc }, { data: grants }, { data: profile }] = await Promise.all([
    admin.from("billing_customers")
      .select("sub_tier, sub_status, sub_cycle, current_period_end, cancel_at")
      .eq("user_id", userId).maybeSingle(),
    admin.from("plan_grants")
      .select("tier, expires_at, revoked_at")
      .eq("user_id", userId),
    admin.from("profiles").select("role, tier").eq("id", userId).maybeSingle(),
  ]);

  const entitlement = resolveEntitlement(
    { tier: bc?.sub_tier ?? null, status: bc?.sub_status ?? null },
    (grants ?? []).map((g) => ({ tier: g.tier, expiresAt: g.expires_at, revokedAt: g.revoked_at }))
  );

  const hasLiveSub = Boolean(bc?.sub_tier) &&
    ["trialing", "active", "past_due"].includes(bc?.sub_status ?? "");

  await admin.from("profiles").update({
    tier: entitlement.tier,
    tier_source: entitlement.source,
    billing_status: hasLiveSub ? bc!.sub_status : bc?.sub_status === "canceled" ? "cancelled" : "none",
    billing_cycle: bc?.sub_cycle ?? "monthly",
    next_billing_date: hasLiveSub ? bc?.current_period_end ?? null : null,
    cancelled_at: bc?.cancel_at ?? null,
  }).eq("id", userId);

  if (profile?.role === "studio") {
    const tier = entitlement.tier;
    if (tier !== "shader" && tier !== "magnum") {
      await unpublishStudioForOwner(admin, userId, { unlist: tier === null });
    }
  }
  return entitlement;
}

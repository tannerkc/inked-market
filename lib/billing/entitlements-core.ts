import type { TierSlug } from "@/lib/types";
import { TIER_ORDER } from "@/lib/utils/integration-helpers";

/** Pure entitlement resolution: max(subscription tier, best active grant).
 *  Mirrored in SQL by sweep_entitlements() (migration 026) — keep in sync. */

export const ENTITLED_SUB_STATUSES = ["trialing", "active", "past_due"] as const;

export type TierSource = "subscription" | "grant";
export interface Entitlement { tier: TierSlug | null; source: TierSource | null }
export interface GrantLike { tier: TierSlug; expiresAt: string | null; revokedAt: string | null }
export interface SubLike { tier: TierSlug | null; status: string | null }

export function resolveEntitlement(sub: SubLike, grants: GrantLike[], now: Date = new Date()): Entitlement {
  const subTier =
    sub.tier && (ENTITLED_SUB_STATUSES as readonly string[]).includes(sub.status ?? "")
      ? sub.tier : null;

  const grantTier = grants
    .filter((g) => !g.revokedAt && (!g.expiresAt || new Date(g.expiresAt) > now))
    .reduce<TierSlug | null>(
      (best, g) => (!best || TIER_ORDER[g.tier] > TIER_ORDER[best] ? g.tier : best),
      null
    );

  if (!subTier && !grantTier) return { tier: null, source: null };
  if (grantTier && (!subTier || TIER_ORDER[grantTier] > TIER_ORDER[subTier])) {
    return { tier: grantTier, source: "grant" };
  }
  return { tier: subTier, source: "subscription" };
}

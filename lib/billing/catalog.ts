import type { BillingCycle, TierSlug } from "@/lib/types";

/** Maps (role, tier, cycle) to Stripe price ids held in env.
 *  Prices are created once per mode by scripts/setup-stripe-catalog.ts. */

export type PaidRole = "artist" | "studio";

export const PAID_TIERS: Record<PaidRole, TierSlug[]> = {
  artist: ["shader"],
  studio: ["liner", "shader", "magnum"],
};

const envKey = (role: PaidRole, tier: TierSlug, cycle: BillingCycle) =>
  `STRIPE_PRICE_${role.toUpperCase()}_${tier.toUpperCase()}_${cycle.toUpperCase()}`;

export function priceIdFor(role: PaidRole, tier: TierSlug, cycle: BillingCycle): string {
  if (!PAID_TIERS[role].includes(tier)) throw new Error(`${role}/${tier} is not a purchasable tier`);
  const id = process.env[envKey(role, tier, cycle)];
  if (!id) throw new Error(`Missing env ${envKey(role, tier, cycle)}`);
  return id;
}

export function lookupPrice(priceId: string): { role: PaidRole; tier: TierSlug; cycle: BillingCycle } | null {
  for (const role of ["artist", "studio"] as const)
    for (const tier of PAID_TIERS[role])
      for (const cycle of ["monthly", "annual"] as const)
        if (process.env[envKey(role, tier, cycle)] === priceId) return { role, tier, cycle };
  return null;
}

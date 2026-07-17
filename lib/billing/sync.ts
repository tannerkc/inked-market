import type { SupabaseClient } from "@supabase/supabase-js";
import { latestSubscriptionForCustomer } from "./stripe";
import { lookupPrice } from "./catalog";
import { recomputeEntitlements } from "./entitlements";

/** Re-fetches subscription truth from the Stripe API (never the webhook
 *  payload) and mirrors it into billing_customers, then recomputes. */
export async function syncBillingState(admin: SupabaseClient, stripeCustomerId: string): Promise<void> {
  const { data: bc } = await admin
    .from("billing_customers")
    .select("user_id, trial_used")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  if (!bc) return; // customer we did not create — a deposit-side or foreign event

  const sub = await latestSubscriptionForCustomer(stripeCustomerId);
  const price = sub?.priceId ? lookupPrice(sub.priceId) : null;

  await admin.from("billing_customers").update({
    stripe_subscription_id: sub?.id ?? null,
    sub_tier: price?.tier ?? null,
    sub_status: sub?.status ?? null,
    sub_cycle: price?.cycle ?? null,
    current_period_end: sub?.currentPeriodEnd ?? null,
    cancel_at: sub?.cancelAt ?? null,
    trial_used: bc.trial_used || Boolean(sub),
  }).eq("user_id", bc.user_id);

  await recomputeEntitlements(admin, bc.user_id);
}

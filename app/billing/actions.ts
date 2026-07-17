"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceIdFor, PAID_TIERS, type PaidRole } from "@/lib/billing/catalog";
import {
  createCustomer,
  createPortalSession,
  createSubscriptionCheckout,
  stripeBillingConfigured,
} from "@/lib/billing/stripe";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return user;
}

const CheckoutInput = z.object({
  tier: z.enum(["liner", "shader", "magnum"]),
  cycle: z.enum(["monthly", "annual"]),
  intent: z.enum(["publish", "upgrade", "golive"]),
});

const CANCEL_PATHS = { publish: "/dashboard/builder", golive: "/dashboard", upgrade: "/settings" } as const;

export async function startCheckout(raw: unknown): Promise<{ url?: string; error?: string }> {
  try {
    if (!stripeBillingConfigured()) return { error: "Billing is not configured." };
    const input = CheckoutInput.parse(raw);
    const user = await requireUser();
    const admin = createAdminClient();

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = profile?.role as PaidRole | "customer" | undefined;
    if (role !== "artist" && role !== "studio") return { error: "Only artist and studio accounts have paid plans." };
    if (!PAID_TIERS[role].includes(input.tier)) return { error: "That plan is not available for this account." };

    let { data: bc } = await admin
      .from("billing_customers")
      .select("stripe_customer_id, trial_used")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!bc) {
      const customerId = await createCustomer({ email: user.email ?? "", userId: user.id });
      const inserted = await admin
        .from("billing_customers")
        .insert({ user_id: user.id, stripe_customer_id: customerId })
        .select("stripe_customer_id, trial_used")
        .single();
      bc = inserted.data;
    }
    if (!bc) return { error: "Could not create a billing profile." };

    const session = await createSubscriptionCheckout({
      customerId: bc.stripe_customer_id,
      priceId: priceIdFor(role, input.tier, input.cycle),
      userId: user.id,
      intent: input.intent,
      withTrial: !bc.trial_used,
      successUrl: `${appUrl()}/api/billing/return?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl()}${CANCEL_PATHS[input.intent]}`,
    });
    return { url: session.url };
  } catch (err) {
    console.error("startCheckout failed:", err);
    return { error: "Could not start checkout. Try again." };
  }
}

export async function openBillingPortal(): Promise<{ url?: string; error?: string }> {
  try {
    const user = await requireUser();
    const admin = createAdminClient();
    const { data: bc } = await admin
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!bc) return { error: "No billing profile yet — start a plan first." };
    const url = await createPortalSession({
      customerId: bc.stripe_customer_id,
      returnUrl: `${appUrl()}/settings`,
    });
    return { url };
  } catch (err) {
    console.error("openBillingPortal failed:", err);
    return { error: "Could not open the billing portal. Try again." };
  }
}

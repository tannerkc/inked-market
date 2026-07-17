/** Platform-account Stripe Billing, SDK-free (house style: lib/booking/deposits/stripe.ts).
 *  No Stripe-Account header here — subscriptions bill the platform, deposits
 *  bill connected accounts; the two coexist on one Stripe account. */

const API = "https://api.stripe.com";
const secretKey = () => process.env.STRIPE_SECRET_KEY ?? "";

export const stripeBillingConfigured = () => Boolean(secretKey());

async function form(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function get(path: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${secretKey()}` } });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

// ── Customers ────────────────────────────────────────────────────────────────

export async function createCustomer(input: { email: string; userId: string }): Promise<string> {
  const c = (await form("/v1/customers", {
    email: input.email,
    "metadata[user_id]": input.userId,
  })) as { id?: string };
  if (!c.id) throw new Error("Stripe customer missing id");
  return c.id;
}

// ── Checkout ─────────────────────────────────────────────────────────────────

export async function createSubscriptionCheckout(input: {
  customerId: string;
  priceId: string;
  userId: string;
  intent: "publish" | "upgrade" | "golive";
  withTrial: boolean;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const params: Record<string, string> = {
    mode: "subscription",
    customer: input.customerId,
    "line_items[0][price]": input.priceId,
    "line_items[0][quantity]": "1",
    allow_promotion_codes: "true",
    client_reference_id: input.userId,
    "metadata[user_id]": input.userId,
    "metadata[intent]": input.intent,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };
  if (input.withTrial) {
    params["subscription_data[trial_period_days]"] = "14";
    params.payment_method_collection = "if_required";
    params["subscription_data[trial_settings][end_behavior][missing_payment_method]"] = "cancel";
  }
  const s = (await form("/v1/checkout/sessions", params)) as { id?: string; url?: string };
  if (!s.id || !s.url) throw new Error("Stripe checkout session missing id/url");
  return { id: s.id, url: s.url };
}

export async function getCheckoutSession(sessionId: string): Promise<{
  id: string; status: string | null; customer: string | null;
  subscription: string | null; metadata: Record<string, string>;
}> {
  const s = (await get(`/v1/checkout/sessions/${sessionId}`)) as {
    id: string; status?: string; customer?: string; subscription?: string;
    metadata?: Record<string, string>;
  };
  return {
    id: s.id, status: s.status ?? null, customer: s.customer ?? null,
    subscription: s.subscription ?? null, metadata: s.metadata ?? {},
  };
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export interface StripeSubscription {
  id: string;
  status: string;
  priceId: string | null;
  currentPeriodEnd: string | null;   // ISO
  cancelAt: string | null;           // ISO
  created: number;
}

const iso = (unix: number | null | undefined) => (unix ? new Date(unix * 1000).toISOString() : null);

function mapSub(raw: Record<string, unknown>): StripeSubscription {
  const r = raw as {
    id: string; status: string; created: number;
    cancel_at?: number | null;
    items?: { data?: Array<{ price?: { id?: string }; current_period_end?: number }> };
    current_period_end?: number;
  };
  const item = r.items?.data?.[0];
  return {
    id: r.id, status: r.status, created: r.created,
    priceId: item?.price?.id ?? null,
    currentPeriodEnd: iso(item?.current_period_end ?? r.current_period_end),
    cancelAt: iso(r.cancel_at),
  };
}

/** Most relevant subscription: newest entitled-status sub, else newest of any status. */
export async function latestSubscriptionForCustomer(customerId: string): Promise<StripeSubscription | null> {
  const res = (await get(`/v1/subscriptions?customer=${customerId}&status=all&limit=10`)) as {
    data?: Array<Record<string, unknown>>;
  };
  const subs = (res.data ?? []).map(mapSub).sort((a, b) => b.created - a.created);
  if (!subs.length) return null;
  const live = subs.find((s) => ["trialing", "active", "past_due"].includes(s.status));
  return live ?? subs[0] ?? null;
}

// ── Customer Portal ──────────────────────────────────────────────────────────

export async function createPortalSession(input: { customerId: string; returnUrl: string }): Promise<string> {
  const s = (await form("/v1/billing_portal/sessions", {
    customer: input.customerId,
    return_url: input.returnUrl,
  })) as { url?: string };
  if (!s.url) throw new Error("Stripe portal session missing url");
  return s.url;
}

// ── Promotion codes (staff marketing tool) ──────────────────────────────────

export interface PromoInput {
  code: string;                      // customer-facing, e.g. LAUNCH30
  percentOff: number;                // 1-100
  duration: "once" | "forever" | { months: number };
  maxRedemptions?: number;
  expiresAt?: string;                // ISO
  firstTimeOnly?: boolean;
}

export async function createPromo(input: PromoInput): Promise<{ id: string; code: string }> {
  const couponParams: Record<string, string> = { percent_off: String(input.percentOff) };
  if (input.duration === "once" || input.duration === "forever") couponParams.duration = input.duration;
  else { couponParams.duration = "repeating"; couponParams.duration_in_months = String(input.duration.months); }
  const coupon = (await form("/v1/coupons", couponParams)) as { id?: string };
  if (!coupon.id) throw new Error("Stripe coupon missing id");

  const promoParams: Record<string, string> = { coupon: coupon.id, code: input.code };
  if (input.maxRedemptions) promoParams.max_redemptions = String(input.maxRedemptions);
  if (input.expiresAt) promoParams.expires_at = String(Math.floor(new Date(input.expiresAt).getTime() / 1000));
  if (input.firstTimeOnly) promoParams["restrictions[first_time_transaction]"] = "true";
  const promo = (await form("/v1/promotion_codes", promoParams)) as { id?: string; code?: string };
  if (!promo.id || !promo.code) throw new Error("Stripe promotion code missing id/code");
  return { id: promo.id, code: promo.code };
}

export interface PromoRow {
  id: string; code: string; active: boolean; timesRedeemed: number;
  maxRedemptions: number | null; expiresAt: string | null;
  percentOff: number | null; duration: string; durationInMonths: number | null;
}

export async function listPromos(): Promise<PromoRow[]> {
  const res = (await get("/v1/promotion_codes?limit=100&expand[]=data.coupon")) as {
    data?: Array<{
      id: string; code: string; active: boolean; times_redeemed: number;
      max_redemptions?: number | null; expires_at?: number | null;
      coupon?: { percent_off?: number | null; duration?: string; duration_in_months?: number | null };
    }>;
  };
  return (res.data ?? []).map((p) => ({
    id: p.id, code: p.code, active: p.active, timesRedeemed: p.times_redeemed,
    maxRedemptions: p.max_redemptions ?? null, expiresAt: iso(p.expires_at),
    percentOff: p.coupon?.percent_off ?? null, duration: p.coupon?.duration ?? "once",
    durationInMonths: p.coupon?.duration_in_months ?? null,
  }));
}

export async function setPromoActive(promotionCodeId: string, active: boolean): Promise<void> {
  await form(`/v1/promotion_codes/${promotionCodeId}`, { active: String(active) });
}

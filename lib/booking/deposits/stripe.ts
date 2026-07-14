import type { CheckoutLink, DepositProvider } from "./types";

/**
 * Stripe Connect Standard, SDK-free (matches the repo's fetch-based provider
 * style). Charges run on the CONNECTED account via the Stripe-Account header
 * with the platform secret key — the platform never holds funds and takes no
 * fee. Docs: stripe.com/docs/connect/standard-accounts,
 * stripe.com/docs/api/checkout/sessions/create.
 */

const API = "https://api.stripe.com";
const CONNECT = "https://connect.stripe.com";

const secretKey = () => process.env.STRIPE_SECRET_KEY ?? "";
const clientId = () => process.env.STRIPE_CLIENT_ID ?? "";

async function stripeForm(
  path: string,
  params: Record<string, string>,
  accountId?: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(accountId ? { "Stripe-Account": accountId } : {}),
    },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function stripeGet(path: string, accountId?: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      ...(accountId ? { "Stripe-Account": accountId } : {}),
    },
  });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

// ─── Connect Standard OAuth (account linking) ──────────────────────────────

export function stripeOAuthConfigured(): boolean {
  return Boolean(secretKey() && clientId());
}

export function stripeAuthorizeUrl(input: { state: string; redirectUri: string }): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    scope: "read_write",
    redirect_uri: input.redirectUri,
    state: input.state,
  });
  return `${CONNECT}/oauth/authorize?${params.toString()}`;
}

export async function stripeExchangeCode(code: string): Promise<{ accountId: string }> {
  const res = await fetch(`${CONNECT}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code }).toString(),
  });
  if (!res.ok) throw new Error(`Stripe token exchange failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { stripe_user_id?: string };
  if (!json.stripe_user_id) throw new Error("Stripe token exchange returned no account id.");
  return { accountId: json.stripe_user_id };
}

export async function stripeAccountName(accountId: string): Promise<string> {
  try {
    const acct = (await stripeGet(`/v1/accounts/${accountId}`)) as {
      settings?: { dashboard?: { display_name?: string } };
      business_profile?: { name?: string };
    };
    return acct.settings?.dashboard?.display_name ?? acct.business_profile?.name ?? accountId;
  } catch {
    return accountId;
  }
}

// ─── Deposit checkout ───────────────────────────────────────────────────────

export const stripeDeposits: DepositProvider = {
  key: "stripe",
  isConfigured: () => Boolean(secretKey()),
  // tokens unused: Standard accounts are charged via platform key + header.
  async createCheckoutLink({ accountId, amountCents, description, appointmentId, returnUrl }) {
    const session = (await stripeForm(
      "/v1/checkout/sessions",
      {
        mode: "payment",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": String(amountCents),
        "line_items[0][price_data][product_data][name]": description,
        "metadata[appointment_id]": appointmentId,
        success_url: returnUrl,
        cancel_url: returnUrl,
      },
      accountId
    )) as { id?: string; url?: string };
    if (!session.id || !session.url) throw new Error("Stripe session missing id/url.");
    return { url: session.url, checkoutId: session.id } satisfies CheckoutLink;
  },
  async verifyCheckout({ accountId, checkoutId }) {
    const session = (await stripeGet(`/v1/checkout/sessions/${checkoutId}`, accountId)) as {
      payment_status?: string;
    };
    return session.payment_status === "paid" ? "paid" : "open";
  },
};

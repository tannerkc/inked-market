import { randomUUID } from "node:crypto";
import type { CheckoutLink, DepositProvider } from "./types";
import type { TokenSet } from "@/lib/integrations/types";

/**
 * Square Payment Links on the merchant's OWN token (sealed connection).
 * Docs: developer.squareup.com/reference/square/checkout-api/create-payment-link.
 * The link's order_id is the checkoutId — webhooks (payment.updated) and
 * order lookups both key on it.
 */

const IS_PROD = process.env.SQUARE_ENVIRONMENT === "production";
const BASE = IS_PROD ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
const SQUARE_VERSION = process.env.SQUARE_API_VERSION ?? "2026-05-20";

async function squareCall(
  path: string,
  tokens: TokenSet,
  init?: { method?: string; body?: unknown }
): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) throw new Error(`Square ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function firstActiveLocationId(tokens: TokenSet): Promise<string> {
  const json = (await squareCall("/v2/locations", tokens)) as {
    locations?: { id: string; status?: string }[];
  };
  const location = json.locations?.find((l) => l.status === "ACTIVE") ?? json.locations?.[0];
  if (!location) throw new Error("Square account has no locations.");
  return location.id;
}

export const squareDeposits: DepositProvider = {
  key: "square",
  isConfigured: () =>
    Boolean(process.env.SQUARE_OAUTH_CLIENT_ID && process.env.SQUARE_OAUTH_CLIENT_SECRET),
  async createCheckoutLink({ tokens, amountCents, description }) {
    const locationId = await firstActiveLocationId(tokens);
    const json = (await squareCall("/v2/online-checkout/payment-links", tokens, {
      method: "POST",
      body: {
        idempotency_key: randomUUID(),
        quick_pay: {
          name: description.slice(0, 255),
          price_money: { amount: amountCents, currency: "USD" },
          location_id: locationId,
        },
      },
    })) as { payment_link?: { id: string; url: string; order_id: string } };
    if (!json.payment_link?.url || !json.payment_link.order_id) {
      throw new Error("Square payment link missing url/order_id.");
    }
    return {
      url: json.payment_link.url,
      checkoutId: json.payment_link.order_id,
    } satisfies CheckoutLink;
  },
  async verifyCheckout({ tokens, checkoutId }) {
    const json = (await squareCall(`/v2/orders/${checkoutId}`, tokens)) as {
      order?: { state?: string };
    };
    return json.order?.state === "COMPLETED" ? "paid" : "open";
  },
};

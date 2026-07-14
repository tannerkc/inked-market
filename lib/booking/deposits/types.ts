import type { TokenSet } from "@/lib/integrations/types";

export type PaymentProviderKey = "stripe" | "square";

export interface CheckoutLink {
  url: string;
  checkoutId: string;
}

/**
 * Checkout on the artist's own account — the platform never holds funds.
 * verifyCheckout is the webhook's redundant twin: redirect, sweep, and
 * webhook all converge on the same idempotent DB transition.
 */
export interface DepositProvider {
  key: PaymentProviderKey;
  isConfigured(): boolean;
  createCheckoutLink(input: {
    tokens: TokenSet;
    accountId: string;
    amountCents: number;
    description: string;
    appointmentId: string;
    returnUrl: string;
  }): Promise<CheckoutLink>;
  verifyCheckout(input: {
    tokens: TokenSet;
    accountId: string;
    checkoutId: string;
  }): Promise<"paid" | "open">;
}

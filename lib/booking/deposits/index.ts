import type { DepositProvider, PaymentProviderKey } from "./types";
import { stripeDeposits } from "./stripe";
import { squareDeposits } from "./square";

const PROVIDERS: Record<PaymentProviderKey, DepositProvider> = {
  stripe: stripeDeposits,
  square: squareDeposits,
};

export function getDepositProvider(key: PaymentProviderKey): DepositProvider {
  return PROVIDERS[key];
}

export * from "./types";
export { depositPlanFor } from "./plan";
export { verifyStripeSignature, verifySquareSignature } from "./signatures";

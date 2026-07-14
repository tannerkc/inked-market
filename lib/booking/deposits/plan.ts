import type { PaymentProviderKey } from "./types";

/** How a deposit ask gets collected. "manual" = artist marks it received. */
export function depositPlanFor(input: {
  depositCents: number;
  provider: PaymentProviderKey | null;
  connected: boolean;
  configured: boolean;
}): "none" | "provider" | "manual" {
  if (input.depositCents <= 0) return "none";
  if (input.provider && input.connected && input.configured) return "provider";
  return "manual";
}

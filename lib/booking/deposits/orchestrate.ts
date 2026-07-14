import type { SupabaseClient } from "@supabase/supabase-js";
import { depositPlanFor } from "./plan";
import { getDepositProvider } from "./index";
import type { PaymentProviderKey } from "./types";
import { getPaymentConnection } from "@/lib/integrations/connections";

/**
 * Attach collection rails to a just-inserted pending_deposit appointment.
 * Provider-backed: create a checkout link and store it. Otherwise: manual
 * (artist marks received). Link failures degrade to manual — a checkout
 * hiccup must never lose the booking.
 */
export async function applyDepositToAppointment(
  admin: SupabaseClient,
  input: {
    appointmentId: string;
    artistId: string;
    depositCents: number;
    description: string;
    origin: string;
  }
): Promise<{ checkoutUrl: string | null }> {
  if (input.depositCents <= 0) return { checkoutUrl: null };

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("payment_provider")
    .eq("artist_id", input.artistId)
    .maybeSingle();
  const providerKey = (settingsRow?.payment_provider ?? null) as PaymentProviderKey | null;
  const connection = providerKey
    ? await getPaymentConnection(admin, input.artistId, providerKey)
    : null;
  const provider = providerKey ? getDepositProvider(providerKey) : null;

  const plan = depositPlanFor({
    depositCents: input.depositCents,
    provider: providerKey,
    connected: Boolean(connection),
    configured: Boolean(provider?.isConfigured()),
  });

  if (plan === "provider" && provider && connection) {
    try {
      const link = await provider.createCheckoutLink({
        tokens: connection.tokens,
        accountId: connection.accountId,
        amountCents: input.depositCents,
        description: input.description,
        appointmentId: input.appointmentId,
        returnUrl: `${input.origin}/api/booking/deposit-return?appointment=${input.appointmentId}`,
      });
      await admin
        .from("appointments")
        .update({
          deposit_provider: provider.key,
          deposit_checkout_id: link.checkoutId,
          deposit_checkout_url: link.url,
        })
        .eq("id", input.appointmentId);
      return { checkoutUrl: link.url };
    } catch {
      // Degrade to manual below — never lose the booking over a checkout hiccup.
    }
  }

  await admin
    .from("appointments")
    .update({ deposit_provider: "manual" })
    .eq("id", input.appointmentId);
  return { checkoutUrl: null };
}

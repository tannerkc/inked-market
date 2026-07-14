import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentConnection } from "@/lib/integrations/connections";
import { requireArtistOwner } from "@/lib/integrations/route-helpers";
import { stripeOAuthConfigured } from "@/lib/booking/deposits/stripe";
import { squareDeposits } from "@/lib/booking/deposits/square";

export interface PaymentStatusResponse {
  stripe: { configured: boolean; connected: boolean; accountName: string | null };
  square: { configured: boolean; connected: boolean; accountName: string | null };
  chosen: "stripe" | "square" | null;
}

/** Connection state for the signed-in artist's payment providers. No tokens. */
export async function GET() {
  const owner = await requireArtistOwner();
  if (!owner.ok) return NextResponse.json({ error: owner.reason }, { status: 401 });

  const admin = createAdminClient();
  const [stripeConn, squareConn, settings] = await Promise.all([
    getPaymentConnection(admin, owner.artistId, "stripe"),
    getPaymentConnection(admin, owner.artistId, "square"),
    admin
      .from("booking_settings")
      .select("payment_provider")
      .eq("artist_id", owner.artistId)
      .maybeSingle(),
  ]);

  const body: PaymentStatusResponse = {
    stripe: {
      configured: stripeOAuthConfigured(),
      connected: Boolean(stripeConn),
      accountName: stripeConn?.accountName ?? null,
    },
    square: {
      configured: squareDeposits.isConfigured(),
      connected: Boolean(squareConn),
      accountName: squareConn?.accountName ?? null,
    },
    chosen: (settings.data?.payment_provider ?? null) as "stripe" | "square" | null,
  };
  return NextResponse.json(body);
}

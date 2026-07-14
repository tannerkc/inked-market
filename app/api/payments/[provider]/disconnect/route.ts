import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deletePaymentConnection } from "@/lib/integrations/connections";
import { requireArtistOwner } from "@/lib/integrations/route-helpers";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  if (provider !== "stripe" && provider !== "square") {
    return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  }
  const owner = await requireArtistOwner();
  if (!owner.ok) return NextResponse.json({ error: owner.reason }, { status: 401 });

  const admin = createAdminClient();
  await deletePaymentConnection(admin, owner.artistId, provider);
  // Clear the chosen provider if it pointed at the deleted connection.
  await admin
    .from("booking_settings")
    .update({ payment_provider: null })
    .eq("artist_id", owner.artistId)
    .eq("payment_provider", provider);

  return NextResponse.json({ ok: true });
}

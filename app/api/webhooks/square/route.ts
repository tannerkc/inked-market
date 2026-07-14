import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySquareSignature } from "@/lib/booking/deposits/signatures";
import { confirmDepositPaid } from "@/lib/booking/deposits/confirm";

/**
 * Application-level Square webhook (payment.updated across all authorized
 * merchants). Signature covers the exact notification URL + raw body, so the
 * configured webhook URL must match request.url exactly.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const valid = verifySquareSignature(
    raw,
    request.headers.get("x-square-hmacsha256-signature"),
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ?? "",
    request.url
  );
  if (!valid) return NextResponse.json({ error: "bad signature" }, { status: 400 });

  let event: {
    type?: string;
    data?: { object?: { payment?: { status?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ received: true });
  }

  const payment = event.data?.object?.payment;
  if (event.type !== "payment.updated" || payment?.status !== "COMPLETED" || !payment.order_id) {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("appointments")
    .select("id")
    .eq("deposit_checkout_id", payment.order_id)
    .eq("deposit_provider", "square")
    .maybeSingle();
  if (row) {
    await confirmDepositPaid(admin, row.id);
  }
  return NextResponse.json({ received: true });
}

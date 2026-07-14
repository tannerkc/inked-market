import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStripeSignature } from "@/lib/booking/deposits/signatures";
import { confirmDepositPaid } from "@/lib/booking/deposits/confirm";

/**
 * Connect application webhook: receives checkout.session.completed for all
 * connected accounts. Signature is verified against the raw body BEFORE any
 * parsing; the session id must match the stored deposit_checkout_id.
 * Always 200 after verification — Stripe retries non-2xx.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const valid = verifyStripeSignature(
    raw,
    request.headers.get("stripe-signature"),
    process.env.STRIPE_WEBHOOK_SECRET ?? ""
  );
  if (!valid) return NextResponse.json({ error: "bad signature" }, { status: 400 });

  let event: {
    type?: string;
    data?: { object?: { id?: string; payment_status?: string; metadata?: { appointment_id?: string } } };
  };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ received: true });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });
  const session = event.data?.object;
  const appointmentId = session?.metadata?.appointment_id;
  if (!session?.id || !appointmentId || session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("appointments")
    .select("id, deposit_checkout_id, deposit_provider")
    .eq("id", appointmentId)
    .maybeSingle();
  if (row && row.deposit_provider === "stripe" && row.deposit_checkout_id === session.id) {
    await confirmDepositPaid(admin, appointmentId);
  }
  return NextResponse.json({ received: true });
}

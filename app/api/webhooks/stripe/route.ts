import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStripeSignature } from "@/lib/booking/deposits/signatures";
import { confirmDepositPaid } from "@/lib/booking/deposits/confirm";
import { syncBillingState } from "@/lib/billing/sync";

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
    id?: string;
    type?: string;
    data?: {
      object?: {
        id?: string;
        mode?: string;
        customer?: string;
        payment_status?: string;
        metadata?: { appointment_id?: string };
      };
    };
  };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  // ── Platform subscription events → one idempotent sync ────────────────────
  const SUB_EVENTS = new Set([
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed",
  ]);
  const isSubCheckout =
    event.type === "checkout.session.completed" && event.data?.object?.mode === "subscription";

  if ((SUB_EVENTS.has(event.type ?? "") || isSubCheckout) && event.id) {
    const { data: seen } = await admin
      .from("stripe_events")
      .insert({ id: event.id })
      .select("id")
      .maybeSingle();
    const customer = event.data?.object?.customer;
    if (seen && customer) {
      try {
        await syncBillingState(admin, customer);
      } catch (err) {
        console.error("billing sync failed:", err);
        // Still 200: the daily sweep is the safety net; Stripe retry storms
        // against a failing handler do not help.
      }
    }
    return NextResponse.json({ received: true });
  }

  // ── Connect deposit events (existing logic, unchanged) ────────────────────
  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });
  const session = event.data?.object;
  const appointmentId = session?.metadata?.appointment_id;
  if (!session?.id || !appointmentId || session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }
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

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCheckoutSession } from "@/lib/billing/stripe";
import { syncBillingState } from "@/lib/billing/sync";
import { publishStudioForOwner } from "@/lib/studios/publish";

/** Checkout success landing: verify with the Stripe API, sync immediately
 *  (webhooks race the redirect), then finish the user's original intent. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const settings = new URL("/settings", url.origin);
  if (!sessionId) return NextResponse.redirect(settings);

  try {
    const session = await getCheckoutSession(sessionId);
    if (session.status !== "complete" || !session.customer) {
      return NextResponse.redirect(settings);
    }
    const admin = createAdminClient();
    await syncBillingState(admin, session.customer);

    if (session.metadata.intent === "publish" && session.metadata.user_id) {
      const result = await publishStudioForOwner(admin, session.metadata.user_id);
      const dest = new URL("/dashboard/builder", url.origin);
      dest.searchParams.set(result.ok ? "published" : "upgraded", "1");
      return NextResponse.redirect(dest);
    }
    if (session.metadata.intent === "golive" && session.metadata.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("tier")
        .eq("id", session.metadata.user_id)
        .maybeSingle();
      const dest = new URL("/dashboard", url.origin);
      if (profile?.tier) {
        await admin
          .from("studios")
          .update({ is_visible: true })
          .eq("claimed_by", session.metadata.user_id);
        dest.searchParams.set("live", "1");
      } else {
        dest.searchParams.set("upgraded", "1");
      }
      return NextResponse.redirect(dest);
    }
    settings.searchParams.set("upgraded", "1");
    return NextResponse.redirect(settings);
  } catch (err) {
    console.error("billing return failed:", err);
    return NextResponse.redirect(settings);
  }
}

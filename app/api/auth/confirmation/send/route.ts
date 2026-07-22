import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CONFIRMATION_GRACE_DAYS,
  type EmailConfirmationMeta,
} from "@/lib/utils/email-confirmation";

/**
 * Starts (or re-sends) the email confirmation flow for the signed-in user.
 *
 * - Stamps `app_metadata.email_confirmation.deadline` (now + 5 days) on first
 *   call; the deadline never moves on resends.
 * - Sends a Supabase magic-link email — clicking it lands on /auth/callback,
 *   which stamps confirmed_at. Any successful email-link auth proves mailbox
 *   ownership.
 * - Email send failures (e.g. rate limits) are reported but the deadline is
 *   still stamped, so the grace period always starts at signup.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ status: "unauthenticated" }, { status: 401 });
  }

  const existing = (user.app_metadata?.email_confirmation ?? {}) as EmailConfirmationMeta;
  if (existing.confirmed_at) {
    return NextResponse.json({ status: "confirmed" });
  }

  const now = new Date();
  const deadline =
    existing.deadline ??
    new Date(now.getTime() + CONFIRMATION_GRACE_DAYS * 86_400_000).toISOString();

  // Stamp the clock first — the grace period starts even if the email
  // provider is rate-limited right now.
  const admin = createAdminClient();
  const { error: stampError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      email_confirmation: {
        ...existing,
        deadline,
        sent_at: now.toISOString(),
      } satisfies EmailConfirmationMeta,
    },
  });
  if (stampError) {
    console.error("Confirmation stamp error:", stampError.message);
    return NextResponse.json(
      { status: "error", message: "Could not start confirmation. Try again." },
      { status: 500 },
    );
  }

  const { error: sendError } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
    },
  });

  if (sendError) {
    const rateLimited = sendError.code === "over_email_send_rate_limit";
    return NextResponse.json(
      {
        status: "send_failed",
        deadline,
        message: rateLimited
          ? "Too many emails sent recently. Try again in a few minutes."
          : "Couldn't send the confirmation email. Try again shortly.",
      },
      { status: rateLimited ? 429 : 502 },
    );
  }

  return NextResponse.json({ status: "sent", deadline });
}

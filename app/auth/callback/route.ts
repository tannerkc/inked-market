import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmailConfirmationMeta } from "@/lib/utils/email-confirmation";

/**
 * Auth callback handler for Supabase magic links and OAuth.
 * Also handles the claim flow when ?claim=studioId is present.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const claimStudioId = searchParams.get("claim");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();

  // Exchange auth code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Arriving here via an emailed link proves mailbox ownership — stamp the
  // app-managed confirmation and lift any pause (see email-confirmation.ts).
  const confirmation = data.user.app_metadata?.email_confirmation as
    | EmailConfirmationMeta
    | undefined;
  if (confirmation?.deadline && !confirmation.confirmed_at) {
    const admin = createAdminClient();
    const { error: confirmError } = await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
        email_confirmation: {
          ...confirmation,
          confirmed_at: new Date().toISOString(),
        } satisfies EmailConfirmationMeta,
        paused: false,
      },
    });
    if (confirmError) {
      // Non-fatal: the user is signed in; the next link click can confirm.
      console.error("Confirmation stamp error:", confirmError.message);
    }
  }

  // Handle claim flow
  if (claimStudioId) {
    // Verify the studio is still unclaimed (race condition guard)
    const { data: updateResult, error: claimError } = await supabase
      .from("studios")
      .update({
        claimed_by: data.user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", claimStudioId)
      .is("claimed_by", null)
      .select("id")
      .single();

    if (claimError || !updateResult) {
      // Studio was already claimed by someone else
      return NextResponse.redirect(`${origin}/claim/${claimStudioId}?error=already_claimed`);
    }

    // Set user role to studio if not already set
    const meta = data.user.user_metadata;
    if (!meta?.role) {
      await supabase.auth.updateUser({
        data: { role: "studio" },
      });
    }

    return NextResponse.redirect(`${origin}/dashboard?claimed=true`);
  }

  // Standard auth callback — redirect to dashboard
  const role = data.user.user_metadata?.role;
  if (role === "artist" || role === "studio") {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(origin);
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateEmail } from "@/lib/utils/validation";

/**
 * Checks whether an email already has an account, so signup account steps can
 * block in-use emails before the user fills out the rest of the flow.
 *
 * Existence is already disclosed by completeSignup's error message, so this
 * endpoint leaks nothing new. On any failure it reports exists=false (fail
 * open) — completeSignup remains the authoritative duplicate check.
 */
export async function POST(request: NextRequest) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    // malformed body — handled by validation below
  }
  if (typeof email !== "string" || validateEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("email_exists", {
    check_email: email.trim().toLowerCase(),
  });
  if (error) {
    console.error("email_exists check failed:", error.message);
    return NextResponse.json({ exists: false });
  }
  return NextResponse.json({ exists: data === true });
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ClaimRequestSchema } from "@/lib/validation/schemas";

// TODO(launch): add a Supabase-backed rate limit table keyed on IP + studioId.
// The previous in-memory Map was useless on serverless (resets every cold start).

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ClaimRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Studio ID and email are required.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { studioId, email } = parsed.data;

  const supabase = await createClient();

  const { data: studio, error: fetchError } = await supabase
    .from("studios")
    .select("id, email, claimed_by")
    .eq("id", studioId)
    .single();

  if (fetchError || !studio) {
    return NextResponse.json({ error: "Studio not found." }, { status: 404 });
  }

  if (studio.claimed_by) {
    return NextResponse.json(
      { error: "This listing has already been claimed." },
      { status: 409 },
    );
  }

  if (!studio.email) {
    return NextResponse.json(
      { error: "No email on file for this listing. Contact support." },
      { status: 422 },
    );
  }

  if (email !== studio.email.toLowerCase()) {
    return NextResponse.json(
      { error: "The email must match the business email on file." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { origin } = request.nextUrl;
  const redirectTo = `${origin}/auth/callback?claim=${encodeURIComponent(studioId)}`;

  const { error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkError) {
    console.error("Magic link error:", linkError.message);
    return NextResponse.json(
      { error: "Failed to send verification link. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

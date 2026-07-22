import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmailConfirmationMeta } from "@/lib/utils/email-confirmation";

/**
 * Daily cron (see vercel.json): pauses accounts whose email-confirmation
 * deadline passed without a confirmation. The pause is a durable
 * `app_metadata.paused` flag enforced by AuthGuard; /auth/callback clears it
 * when the user finally confirms.
 *
 * Vercel invokes this with `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  let page = 1;
  let scanned = 0;
  let paused = 0;
  const failures: string[] = [];

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      return NextResponse.json({ error: error.message, scanned, paused }, { status: 500 });
    }

    for (const user of data.users) {
      scanned++;
      const meta = user.app_metadata?.email_confirmation as EmailConfirmationMeta | undefined;
      const alreadyPaused = user.app_metadata?.paused === true;
      const overdue =
        !!meta?.deadline && !meta.confirmed_at && new Date(meta.deadline).getTime() <= now;

      if (overdue && !alreadyPaused) {
        const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
          app_metadata: { paused: true },
        });
        if (updateError) failures.push(user.id);
        else paused++;
      }
    }

    if (data.users.length < 200) break;
    page++;
  }

  return NextResponse.json({ scanned, paused, failures });
}

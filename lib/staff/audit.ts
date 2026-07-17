import type { SupabaseClient } from "@supabase/supabase-js";

/** Every staff-portal mutation writes one audit row. */
export async function logStaffAction(
  admin: SupabaseClient,
  input: { actor: string; action: string; targetUser?: string | null; detail?: Record<string, unknown> }
): Promise<void> {
  await admin.from("staff_audit_log").insert({
    actor: input.actor,
    action: input.action,
    target_user: input.targetUser ?? null,
    detail: input.detail ?? {},
  });
}

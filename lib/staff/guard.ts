import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface StaffContext {
  userId: string;
  role: "founder" | "staff";
}

/** Staff check for /staff pages and actions. Returns null for everyone else —
 *  callers notFound() so the portal's existence is never revealed.
 *  Server-only: reads the staff table with the service role. */
export async function requireStaff(minRole: "staff" | "founder" = "staff"): Promise<StaffContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: row } = await createAdminClient()
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return null;
  if (minRole === "founder" && row.role !== "founder") return null;
  return { userId: user.id, role: row.role };
}

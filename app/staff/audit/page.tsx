import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff/guard";
import { panelClass, microLabelClass, EmptyState } from "../ui";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  grant_tier: "Granted tier",
  revoke_grant: "Revoked grant",
  create_promo: "Created promo",
  deactivate_promo: "Deactivated promo",
  add_staff: "Added staff",
  remove_staff: "Removed staff",
};

export default async function StaffAuditPage() {
  const staff = await requireStaff();
  if (!staff) notFound();
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("staff_audit_log")
    .select("id, actor, action, target_user, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Resolve actor/target ids to emails so the log reads like a story, not hex.
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailById = new Map((authList?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const who = (id: string | null) => (id ? emailById.get(id) || id.slice(0, 8) : null);

  return (
    <div className={cn(panelClass, "overflow-hidden")}>
      <ul className="divide-y divide-ink-black/[0.04] dark:divide-ink-cream/[0.05]">
        {(rows ?? []).map((r) => (
          <li key={r.id} className="px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm font-medium text-ink-black/80 dark:text-ink-cream/85">
                {ACTION_LABELS[r.action] ?? r.action}
                {r.target_user ? (
                  <span className="font-normal text-ink-black/45 dark:text-ink-cream/45">
                    {" — "}{who(r.target_user)}
                  </span>
                ) : null}
              </p>
              <span className={microLabelClass}>
                {new Date(r.created_at).toLocaleString()} · by {who(r.actor)}
              </span>
            </div>
            <pre className="mt-1.5 overflow-x-auto font-mono text-[10px] leading-relaxed text-ink-black/40 dark:text-ink-cream/40">
              {JSON.stringify(r.detail)}
            </pre>
          </li>
        ))}
        {!rows?.length ? (
          <li>
            <EmptyState text="No staff actions yet" />
          </li>
        ) : null}
      </ul>
    </div>
  );
}

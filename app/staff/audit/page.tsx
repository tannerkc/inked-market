import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff/guard";

export const dynamic = "force-dynamic";

export default async function StaffAuditPage() {
  const staff = await requireStaff();
  if (!staff) notFound();
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("staff_audit_log")
    .select("id, actor, action, target_user, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {(rows ?? []).map((r) => (
          <li key={r.id} className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.action}</p>
            <p className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleString()} · actor {r.actor.slice(0, 8)}
              {r.target_user ? ` · target ${r.target_user.slice(0, 8)}` : ""}
            </p>
            <pre className="mt-1 overflow-x-auto text-xs text-gray-600 dark:text-gray-300">
              {JSON.stringify(r.detail)}
            </pre>
          </li>
        ))}
        {!rows?.length ? (
          <li className="px-4 py-8 text-center text-sm text-gray-400">No staff actions yet.</li>
        ) : null}
      </ul>
    </div>
  );
}

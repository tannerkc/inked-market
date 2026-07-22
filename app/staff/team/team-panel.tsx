"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import { addStaffMember, getStaffList, removeStaffMember, type StaffMemberRow } from "../actions";
import { panelClass, PanelTitle, FeedbackMessage, EmptyState } from "../ui";

const ROLE_OPTIONS = [
  { value: "staff", label: "Staff" },
  { value: "founder", label: "Founder" },
];

export function TeamPanel() {
  const [members, setMembers] = useState<StaffMemberRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "founder">("staff");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() =>
    startTransition(async () => {
      const res = await getStaffList();
      setMembers(res.members);
      if (res.error) setMessage({ text: res.error, ok: false });
    }), []);

  useEffect(() => { load(); }, [load]);

  const add = () =>
    startTransition(async () => {
      const res = await addStaffMember(email, role);
      setMessage(res.ok ? { text: "Added", ok: true } : { text: res.error ?? "Failed", ok: false });
      if (res.ok) {
        setEmail("");
        load();
      }
    });

  const remove = (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from staff? They lose portal access immediately.`)) return;
    startTransition(async () => {
      const res = await removeStaffMember(userId);
      setMessage(res.ok ? { text: "Removed", ok: true } : { text: res.error ?? "Failed", ok: false });
      if (res.ok) load();
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section className={cn(panelClass, "p-5")}>
        <PanelTitle title="Add staff" hint="Founders only. They must already have an account." />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            label="Email"
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "founder")}
            className="sm:w-44"
          />
        </div>
        <Button
          variant="ink"
          size="sm"
          className="mt-3 w-full sm:w-auto"
          onClick={add}
          disabled={pending || !email}
        >
          Add to team
        </Button>
        <FeedbackMessage message={message} />
      </section>

      <section className={cn(panelClass, "p-5")}>
        <PanelTitle title="Current staff" />
        <ul className="divide-y divide-ink-black/[0.04] dark:divide-ink-cream/[0.05]">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink-black/80 dark:text-ink-cream/85">
                    {m.name ?? m.email}
                  </span>
                  <StatusBadge
                    label={m.role}
                    color={m.role === "founder" ? BADGE_COLORS.tag : BADGE_COLORS.muted}
                  />
                </span>
                <span className="block truncate text-[11px] text-ink-black/35 dark:text-ink-cream/35">
                  {m.email} · since {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </span>
              <Button
                variant="ink-outline"
                size="sm"
                disabled={pending}
                onClick={() => remove(m.userId, m.name ?? m.email)}
              >
                Remove
              </Button>
            </li>
          ))}
          {!members.length ? (
            <li>
              <EmptyState text={pending ? "Loading…" : "No staff yet"} />
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

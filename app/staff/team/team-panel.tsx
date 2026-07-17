"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { addStaffMember, getStaffList, removeStaffMember, type StaffMemberRow } from "../actions";

const inputClass =
  "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

export function TeamPanel() {
  const [members, setMembers] = useState<StaffMemberRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "founder">("staff");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() =>
    startTransition(async () => {
      const res = await getStaffList();
      setMembers(res.members);
      setMessage(res.error ?? null);
    }), []);

  useEffect(() => { load(); }, [load]);

  const add = () =>
    startTransition(async () => {
      const res = await addStaffMember(email, role);
      setMessage(res.ok ? "Added." : res.error ?? "Failed");
      if (res.ok) {
        setEmail("");
        load();
      }
    });

  const remove = (userId: string) =>
    startTransition(async () => {
      const res = await removeStaffMember(userId);
      setMessage(res.ok ? "Removed." : res.error ?? "Failed");
      if (res.ok) load();
    });

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Add staff (founders only)</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className={`${inputClass} sm:w-40`}
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "founder")}
          >
            <option value="staff">Staff</option>
            <option value="founder">Founder</option>
          </select>
          <button
            type="button"
            onClick={add}
            disabled={pending || !email}
            className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {message ? <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">{message}</p> : null}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Current staff</p>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-2 py-2">
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  {m.name ?? m.email}
                </span>
                <span className="block text-xs text-gray-500">{m.email} · {m.role}</span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(m.userId)}
                className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

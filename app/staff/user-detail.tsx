"use client";

import { useState, useTransition } from "react";
import {
  searchUsers,
  getUserDetail,
  grantTier,
  revokeGrant,
  type StaffUserRow,
  type StaffUserDetail,
} from "./actions";

const inputClass =
  "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

interface GrantFormState {
  tier: string;
  expiresAt: string;
  note: string;
  email: string;
}

export function StaffUsersPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StaffUserRow[]>([]);
  const [detail, setDetail] = useState<StaffUserDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [grantForm, setGrantForm] = useState<GrantFormState>({
    tier: "shader",
    expiresAt: "",
    note: "",
    email: "",
  });

  const runSearch = () =>
    startTransition(async () => {
      const res = await searchUsers(query);
      setResults(res.users);
      setDetail(null);
      setMessage(res.error ?? null);
    });

  const openDetail = (userId: string) =>
    startTransition(async () => {
      const res = await getUserDetail(userId);
      if (res.ok && res.user) {
        setDetail(res.user);
        setMessage(null);
      } else {
        setMessage(res.error ?? "Failed to load user");
      }
    });

  const submitGrant = (userId?: string) =>
    startTransition(async () => {
      const res = await grantTier({
        userId,
        email: userId ? undefined : grantForm.email || undefined,
        tier: grantForm.tier as "liner" | "shader" | "magnum",
        expiresAt: grantForm.expiresAt ? new Date(grantForm.expiresAt).toISOString() : undefined,
        note: grantForm.note,
      });
      setMessage(res.ok ? "Granted." : res.error ?? "Grant failed");
      if (res.ok && userId) void openDetail(userId);
    });

  const doRevoke = (grantId: string, userId: string) =>
    startTransition(async () => {
      const res = await revokeGrant(grantId);
      setMessage(res.ok ? "Revoked." : res.error ?? "Revoke failed");
      if (res.ok) void openDetail(userId);
    });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={pending}
            className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Search
          </button>
        </div>
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
          {results.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => openDetail(u.id)}
                className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span>
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    {u.name ?? u.email}
                  </span>
                  <span className="block text-xs text-gray-500">{u.email} · {u.role}</span>
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {u.tier ?? "free"}{u.tierSource === "grant" ? " (comp)" : ""}
                </span>
              </button>
            </li>
          ))}
          {!results.length ? (
            <li className="py-6 text-center text-sm text-gray-400">No results yet — search above.</li>
          ) : null}
        </ul>

        <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Grant by email (pre-signup)</p>
          <p className="mb-2 text-xs text-gray-500">Applies automatically when they register.</p>
          <input
            className={inputClass}
            placeholder="person@example.com"
            value={grantForm.email}
            onChange={(e) => setGrantForm({ ...grantForm, email: e.target.value })}
          />
          <GrantFields form={grantForm} setForm={setGrantForm} />
          <button
            type="button"
            onClick={() => submitGrant(undefined)}
            disabled={pending || !grantForm.email}
            className="mt-2 min-h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Grant to email
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {!detail ? (
          <p className="py-6 text-center text-sm text-gray-400">Select a user to manage.</p>
        ) : (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {detail.name ?? detail.email}
            </h2>
            <p className="text-xs text-gray-500">{detail.email} · {detail.role}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Tier</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {detail.tier ?? "free"} {detail.tierSource ? `(${detail.tierSource})` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Billing</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {detail.billingStatus}{detail.subStatus ? ` / ${detail.subStatus}` : ""}
                </dd>
              </div>
            </dl>
            {detail.stripeCustomerId ? (
              <a
                className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-500"
                href={`https://dashboard.stripe.com/customers/${detail.stripeCustomerId}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Stripe
              </a>
            ) : null}

            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Grant a tier</p>
              <GrantFields form={grantForm} setForm={setGrantForm} />
              <button
                type="button"
                onClick={() => submitGrant(detail.id)}
                disabled={pending}
                className="mt-2 min-h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Grant to {detail.name ?? detail.email}
              </button>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Grant history</p>
              <ul className="space-y-2">
                {detail.grants.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                  >
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{g.tier}</span>
                      {" — "}{g.note}
                      {g.expiresAt ? ` · until ${new Date(g.expiresAt).toLocaleDateString()}` : " · forever"}
                      {g.revokedAt ? " · revoked" : ""}
                    </span>
                    {!g.revokedAt ? (
                      <button
                        type="button"
                        onClick={() => doRevoke(g.id, detail.id)}
                        disabled={pending}
                        className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Revoke
                      </button>
                    ) : null}
                  </li>
                ))}
                {!detail.grants.length ? <li className="text-xs text-gray-400">No grants.</li> : null}
              </ul>
            </div>
          </div>
        )}
        {message ? <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-300">{message}</p> : null}
      </section>
    </div>
  );
}

function GrantFields({
  form,
  setForm,
}: {
  form: GrantFormState;
  setForm: (f: GrantFormState) => void;
}) {
  return (
    <div className="mt-2 space-y-2">
      <select
        className={inputClass}
        value={form.tier}
        onChange={(e) => setForm({ ...form, tier: e.target.value })}
      >
        <option value="liner">Liner</option>
        <option value="shader">Shader</option>
        <option value="magnum">Magnum</option>
      </select>
      <input
        type="date"
        className={inputClass}
        value={form.expiresAt}
        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
        aria-label="Expires (leave empty for forever)"
      />
      <input
        className={inputClass}
        placeholder="Why? (required, goes in the audit log)"
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
    </div>
  );
}

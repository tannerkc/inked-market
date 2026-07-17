"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createPromoCode, deactivatePromoCode, getPromoCodes } from "../actions";
import type { PromoRow } from "@/lib/billing/stripe";

const inputClass =
  "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

export function PromosPanel() {
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: "",
    percentOff: 20,
    durationKind: "once",
    months: 3,
    maxRedemptions: "",
    expiresAt: "",
    firstTimeOnly: true,
  });

  const load = useCallback(() =>
    startTransition(async () => {
      const res = await getPromoCodes();
      setPromos(res.promos);
      setMessage(res.error ?? null);
    }), []);

  useEffect(() => { load(); }, [load]);

  const submit = () =>
    startTransition(async () => {
      const res = await createPromoCode({
        code: form.code.toUpperCase(),
        percentOff: Number(form.percentOff),
        duration: form.durationKind === "months" ? { months: Number(form.months) } : form.durationKind,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        firstTimeOnly: form.firstTimeOnly,
      });
      setMessage(res.ok ? "Promo created." : res.error ?? "Failed");
      if (res.ok) load();
    });

  const deactivate = (id: string) =>
    startTransition(async () => {
      const res = await deactivatePromoCode(id);
      setMessage(res.ok ? "Deactivated." : res.error ?? "Failed");
      if (res.ok) load();
    });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">New promotion code</p>
        <div className="space-y-2">
          <input
            className={inputClass}
            placeholder="CODE (e.g. LAUNCH30)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={100}
              className={inputClass}
              value={form.percentOff}
              aria-label="Percent off"
              onChange={(e) => setForm({ ...form, percentOff: Number(e.target.value) })}
            />
            <select
              className={inputClass}
              value={form.durationKind}
              onChange={(e) => setForm({ ...form, durationKind: e.target.value })}
            >
              <option value="once">First invoice only</option>
              <option value="months">For N months</option>
              <option value="forever">Forever</option>
            </select>
          </div>
          {form.durationKind === "months" ? (
            <input
              type="number"
              min={1}
              max={36}
              className={inputClass}
              value={form.months}
              aria-label="Months"
              onChange={(e) => setForm({ ...form, months: Number(e.target.value) })}
            />
          ) : null}
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              className={inputClass}
              placeholder="Max redemptions (optional)"
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
            />
            <input
              type="date"
              className={inputClass}
              value={form.expiresAt}
              aria-label="Expires (optional)"
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.firstTimeOnly}
              onChange={(e) => setForm({ ...form, firstTimeOnly: e.target.checked })}
            />
            First-time customers only
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={pending || !form.code}
            className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Create promo
          </button>
          {message ? <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{message}</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Existing codes</p>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {promos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-sm">
                <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{p.code}</span>
                <span className="block text-xs text-gray-500">
                  {p.percentOff}% off · {p.duration === "repeating" ? `${p.durationInMonths} months` : p.duration}
                  {" · "}{p.timesRedeemed}{p.maxRedemptions ? `/${p.maxRedemptions}` : ""} used
                  {p.expiresAt ? ` · until ${new Date(p.expiresAt).toLocaleDateString()}` : ""}
                  {!p.active ? " · inactive" : ""}
                </span>
              </span>
              {p.active ? (
                <button
                  type="button"
                  onClick={() => deactivate(p.id)}
                  disabled={pending}
                  className="min-h-11 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Deactivate
                </button>
              ) : null}
            </li>
          ))}
          {!promos.length ? (
            <li className="py-6 text-center text-sm text-gray-400">No promotion codes yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

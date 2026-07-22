"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import { createPromoCode, deactivatePromoCode, getPromoCodes } from "../actions";
import type { PromoRow } from "@/lib/billing/stripe";
import { panelClass, PanelTitle, FeedbackMessage, EmptyState } from "../ui";

const DURATION_OPTIONS = [
  { value: "once", label: "First invoice only" },
  { value: "months", label: "For N months" },
  { value: "forever", label: "Forever" },
];

export function PromosPanel() {
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
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
      if (res.error) setMessage({ text: res.error, ok: false });
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
      setMessage(res.ok ? { text: "Promo created", ok: true } : { text: res.error ?? "Failed", ok: false });
      if (res.ok) load();
    });

  const deactivate = (id: string) =>
    startTransition(async () => {
      const res = await deactivatePromoCode(id);
      setMessage(res.ok ? { text: "Deactivated", ok: true } : { text: res.error ?? "Failed", ok: false });
      if (res.ok) load();
    });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className={cn(panelClass, "p-5")}>
        <PanelTitle title="New promotion code" hint="Created in Stripe — applies at checkout." />
        <div className="space-y-2">
          <Input
            label="Code"
            placeholder="LAUNCH30"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Percent off"
              type="number"
              min={1}
              max={100}
              value={form.percentOff}
              onChange={(e) => setForm({ ...form, percentOff: Number(e.target.value) })}
            />
            <Select
              label="Duration"
              options={DURATION_OPTIONS}
              value={form.durationKind}
              onChange={(e) => setForm({ ...form, durationKind: e.target.value })}
            />
          </div>
          {form.durationKind === "months" ? (
            <Input
              label="Months"
              type="number"
              min={1}
              max={36}
              value={form.months}
              onChange={(e) => setForm({ ...form, months: Number(e.target.value) })}
            />
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Max redemptions (optional)"
              type="number"
              min={1}
              placeholder="∞"
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
            />
            <Input
              label="Expires (optional)"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 px-1 text-[13px] text-ink-black/60 dark:text-ink-cream/60">
            <input
              type="checkbox"
              checked={form.firstTimeOnly}
              onChange={(e) => setForm({ ...form, firstTimeOnly: e.target.checked })}
              className="accent-ink-rust dark:accent-ink-red"
            />
            First-time customers only
          </label>
          <Button
            variant="ink"
            size="sm"
            className="w-full"
            onClick={submit}
            disabled={pending || !form.code}
          >
            Create promo
          </Button>
          <FeedbackMessage message={message} />
        </div>
      </section>

      <section className={cn(panelClass, "p-5")}>
        <PanelTitle title="Existing codes" />
        <ul className="divide-y divide-ink-black/[0.04] dark:divide-ink-cream/[0.05]">
          {promos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-medium tracking-[0.05em] text-ink-black/80 dark:text-ink-cream/85">
                    {p.code}
                  </span>
                  <StatusBadge
                    label={p.active ? "active" : "inactive"}
                    color={p.active ? BADGE_COLORS.sage : BADGE_COLORS.muted}
                  />
                </span>
                <span className="block text-[11px] text-ink-black/35 dark:text-ink-cream/35">
                  {p.percentOff}% off · {p.duration === "repeating" ? `${p.durationInMonths} months` : p.duration}
                  {" · "}{p.timesRedeemed}{p.maxRedemptions ? `/${p.maxRedemptions}` : ""} used
                  {p.expiresAt ? ` · until ${new Date(p.expiresAt).toLocaleDateString()}` : ""}
                </span>
              </span>
              {p.active ? (
                <Button
                  variant="ink-outline"
                  size="sm"
                  onClick={() => deactivate(p.id)}
                  disabled={pending}
                >
                  Deactivate
                </Button>
              ) : null}
            </li>
          ))}
          {!promos.length ? (
            <li>
              <EmptyState text={pending ? "Loading…" : "No promotion codes yet"} />
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

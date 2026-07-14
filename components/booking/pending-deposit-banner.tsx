"use client";

import { FieldLabel } from "./form-rows";
import type { AppointmentRecord } from "@/lib/types/booking";

interface PendingDepositBannerProps {
  records: AppointmentRecord[];
}

/** Unpaid deposit holds with their checkout links — shown atop the customer dashboard. */
export function PendingDepositBanner({ records }: PendingDepositBannerProps) {
  const unpaid = records.filter(
    (a) => a.status === "pending_deposit" && a.depositStatus === "pending" && a.depositCheckoutUrl
  );
  if (unpaid.length === 0) return null;

  return (
    <div className="mb-4 rounded-[14px] border border-dashed border-ink-rust/40 bg-ink-rust/[0.04] p-4">
      <FieldLabel>Deposit needed to lock in your time</FieldLabel>
      <ul className="mt-2 flex flex-col gap-2">
        {unpaid.map((a) => (
          <li key={a.id} className="flex min-h-[44px] items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
                {a.artistName ?? "Artist"} —{" "}
                {new Date(a.startAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="font-mono text-[10px] text-ink-black/40 dark:text-ink-cream/40">
                ${(a.depositCents / 100).toFixed(0)} deposit — complete payment to keep the slot
              </p>
            </div>
            <a
              href={a.depositCheckoutUrl ?? "#"}
              className="min-h-[44px] shrink-0 rounded-full bg-ink-rust px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white hover:bg-ink-rust/90"
            >
              Pay deposit
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

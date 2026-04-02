"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TierFeature {
  text: string;
  included: boolean;
}

interface SignupTierCardProps {
  name: string;
  price: number;
  annualPrice?: number;
  isAnnual: boolean;
  description: string;
  features: TierFeature[];
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  badgeColor?: "red" | "rust" | "sage";
  freeBadge?: boolean;
  accentColor?: "red" | "rust";
  className?: string;
}

const badgeBgMap: Record<string, string> = {
  red: "bg-ink-red",
  rust: "bg-ink-rust",
  sage: "bg-ink-sage",
};

const selectedBorderMap: Record<string, string> = {
  red: "border-ink-red bg-ink-red/[0.02]",
  rust: "border-ink-rust bg-ink-rust/[0.02]",
};

export function SignupTierCard({
  name,
  price,
  annualPrice,
  isAnnual,
  description,
  features,
  selected,
  onSelect,
  badge,
  badgeColor = "red",
  freeBadge,
  accentColor = "red",
  className,
}: SignupTierCardProps) {
  const displayPrice = isAnnual && annualPrice ? annualPrice : price;
  const isFree = price === 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full p-5 rounded-[18px] border border-ink-black/[0.05] bg-white text-left transition-all cursor-pointer relative",
        "hover:border-ink-black/[0.12]",
        selected && selectedBorderMap[accentColor],
        className
      )}
    >
      {badge && (
        <span className={cn("absolute -top-2 right-4 font-mono text-[8px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full text-white", badgeBgMap[badgeColor])}>
          {badge}
        </span>
      )}

      <div className="flex justify-between items-start mb-2.5">
        <div>
          {freeBadge && (
            <span className="inline-block font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-ink-sage/[0.08] text-ink-sage border border-ink-sage/[0.12] mb-2">
              No Card Required
            </span>
          )}
          <div className="text-base font-bold text-ink-black">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-bold text-ink-black leading-none">
            {isFree ? "$0" : (
              <>
                ${Math.floor(displayPrice)}
                <span className="text-sm opacity-50">.{(displayPrice % 1).toFixed(2).slice(2)}</span>
              </>
            )}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-black/25">
            {isFree ? "forever" : "/ month"}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-black/35 mb-3 leading-relaxed">{description}</p>

      <div className="flex flex-col gap-1.5">
        {features.map((f) => (
          <div key={f.text} className="flex items-center gap-2 text-xs text-ink-black/50">
            {f.included ? (
              <span className="text-ink-sage font-semibold text-sm">✓</span>
            ) : (
              <span className="text-ink-black/20 text-sm">—</span>
            )}
            <span className={cn(!f.included && "opacity-50")}>{f.text}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

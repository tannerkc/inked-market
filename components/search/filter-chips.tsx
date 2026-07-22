"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface FilterChipsProps {
  className?: string;
}

function FilterChipsInner({ className }: FilterChipsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function removeStyle(styleToRemove: string) {
    const current = searchParams.get("styles") || "";
    const styles = current.split(",").filter((s) => s && s !== styleToRemove);
    updateParams("styles", styles.length > 0 ? styles.join(",") : null);
  }

  function clearAll() {
    const params = new URLSearchParams();
    const tab = searchParams.get("tab");
    if (tab) params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const chips: { label: string; key: string; value?: string; onRemove: () => void; color: "red" | "sage" | "muted" }[] = [];

  const stylesParam = searchParams.get("styles");
  if (stylesParam) {
    stylesParam.split(",").filter(Boolean).forEach((style) => {
      chips.push({
        label: style
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        key: `style-${style}`,
        onRemove: () => removeStyle(style),
        color: "red",
      });
    });
  }

  if (searchParams.get("verified") === "true") {
    chips.push({
      label: "Verified",
      key: "verified",
      onRemove: () => updateParams("verified", null),
      color: "sage",
    });
  }

  const bookingParam = searchParams.get("booking");
  if (bookingParam === "true") {
    const tab = searchParams.get("tab");
    chips.push({
      label: tab === "studios" ? "Walk-ins" : "Booking Open",
      key: "booking",
      onRemove: () => updateParams("booking", null),
      color: "red",
    });
  }

  const location = searchParams.get("location");
  if (location) {
    chips.push({
      label: location,
      key: "location",
      onRemove: () => updateParams("location", null),
      color: "muted",
    });
  }

  const rating = searchParams.get("rating");
  if (rating) {
    chips.push({
      label: `${rating}+`,
      key: "rating",
      onRemove: () => updateParams("rating", null),
      color: "muted",
    });
  }

  const experience = searchParams.get("experience");
  if (experience) {
    chips.push({
      label: experience,
      key: "experience",
      onRemove: () => updateParams("experience", null),
      color: "muted",
    });
  }

  if (chips.length === 0) return null;

  const colorStyles = {
    red: "bg-ink-red/[0.06] text-ink-red/80 border-ink-red/15 dark:bg-ink-red/[0.08] dark:text-ink-red/70 dark:border-ink-red/20",
    sage: "bg-ink-sage/[0.08] text-ink-sage/80 border-ink-sage/15 dark:bg-ink-sage/[0.1] dark:text-ink-sage/70 dark:border-ink-sage/20",
    muted: "bg-ink-black/[0.04] text-ink-black/50 border-ink-black/08 dark:bg-ink-cream/[0.06] dark:text-ink-cream/50 dark:border-ink-cream/10",
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-wide transition-colors",
            colorStyles[chip.color]
          )}
        >
          {chip.label}
          <span className="ml-0.5 text-[10px] opacity-60">&times;</span>
        </button>
      ))}
      <button
        onClick={clearAll}
        className="rounded-full px-2.5 py-1 font-mono text-[9px] tracking-wide transition-colors text-ink-black/30 hover:text-ink-black/50 dark:text-ink-cream/30 dark:hover:text-ink-cream/50"
      >
        Clear all
      </button>
    </div>
  );
}

const FilterChips = React.forwardRef<HTMLDivElement, FilterChipsProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} {...props}>
      <Suspense fallback={null}>
        <FilterChipsInner className={className} />
      </Suspense>
    </div>
  )
);

FilterChips.displayName = "FilterChips";

export { FilterChips };

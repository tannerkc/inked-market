"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface FilterChipsProps {
  variant?: "light" | "dark";
  className?: string;
}

function FilterChipsInner({
  variant = "dark",
  className,
}: FilterChipsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = variant === "dark";

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

  // Style chips
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

  // Verified chip
  if (searchParams.get("verified") === "true") {
    chips.push({
      label: "Verified",
      key: "verified",
      onRemove: () => updateParams("verified", null),
      color: "sage",
    });
  }

  // Booking / Walk-ins chip
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

  // Location chip
  const location = searchParams.get("location");
  if (location) {
    chips.push({
      label: location,
      key: "location",
      onRemove: () => updateParams("location", null),
      color: "muted",
    });
  }

  // Rating chip
  const rating = searchParams.get("rating");
  if (rating) {
    chips.push({
      label: `${rating}+`,
      key: "rating",
      onRemove: () => updateParams("rating", null),
      color: "muted",
    });
  }

  // Experience / Team size chip
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
    red: isDark
      ? "bg-ink-red/[0.08] text-ink-red/70 border-ink-red/20"
      : "bg-ink-red/[0.06] text-ink-red/80 border-ink-red/15",
    sage: isDark
      ? "bg-ink-sage/[0.1] text-ink-sage/70 border-ink-sage/20"
      : "bg-ink-sage/[0.08] text-ink-sage/80 border-ink-sage/15",
    muted: isDark
      ? "bg-ink-cream/[0.06] text-ink-cream/50 border-ink-cream/10"
      : "bg-ink-black/[0.04] text-ink-black/50 border-ink-black/08",
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5",
        className
      )}
    >
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
        className={cn(
          "rounded-full px-2.5 py-1 font-mono text-[9px] tracking-wide transition-colors",
          isDark
            ? "text-ink-cream/30 hover:text-ink-cream/50"
            : "text-ink-black/30 hover:text-ink-black/50"
        )}
      >
        Clear all
      </button>
    </div>
  );
}

const FilterChips = React.forwardRef<HTMLDivElement, FilterChipsProps>(
  ({ variant = "dark", className, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        <Suspense fallback={null}>
          <FilterChipsInner variant={variant} className={className} />
        </Suspense>
      </div>
    );
  }
);

FilterChips.displayName = "FilterChips";

export { FilterChips };

"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SortSelectProps {
  variant?: "light" | "dark";
  className?: string;
}

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Reviews", value: "reviews" },
  { label: "Newest", value: "newest" },
] as const;

const SortSelectInner = React.forwardRef<HTMLDivElement, SortSelectProps>(
  ({ variant = "dark", className, ...props }, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isDark = variant === "dark";
    const currentSort = searchParams.get("sort") || "relevance";
    const currentLabel =
      sortOptions.find((o) => o.value === currentSort)?.label ?? "Relevance";

    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Close on Escape
    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    const handleSelect = (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
      setOpen(false);
    };

    return (
      <div
        ref={(node) => {
          // Merge refs
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("relative", className)}
        {...props}
      >
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] tracking-wide uppercase rounded-lg border transition-colors duration-200",
            isDark
              ? "text-ink-cream/35 border-ink-cream/8 hover:border-ink-cream/15"
              : "text-ink-black/65 border-ink-black/15 hover:border-ink-black/25"
          )}
        >
          {currentLabel}
          <span
            className={cn(
              "text-[8px] transition-transform duration-200",
              open && "rotate-180"
            )}
          >
            ▾
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className={cn(
              "absolute top-full left-0 mt-1.5 min-w-[160px] rounded-lg border py-1 z-50",
              isDark
                ? "bg-ink-black border-ink-cream/[0.08]"
                : "bg-white border-ink-black/[0.06]"
            )}
          >
            {sortOptions.map(({ label, value }) => {
              const isActive = currentSort === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(value)}
                  className={cn(
                    "w-full text-left px-3.5 py-2 font-mono text-[9px] tracking-wide uppercase transition-colors duration-150",
                    isActive
                      ? "text-ink-red"
                      : isDark
                        ? "text-ink-cream/50 hover:bg-ink-cream/[0.04] hover:text-ink-cream/70"
                        : "text-ink-black/50 hover:bg-ink-black/[0.03] hover:text-ink-black/70"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

SortSelectInner.displayName = "SortSelectInner";

const SortSelect = React.forwardRef<HTMLDivElement, SortSelectProps>(
  (props, ref) => (
    <Suspense fallback={null}>
      <SortSelectInner ref={ref} {...props} />
    </Suspense>
  )
);
SortSelect.displayName = "SortSelect";

export { SortSelect };

"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SearchTabsProps {
  variant?: "light" | "dark";
  className?: string;
}

const tabs = [
  { label: "Artists", value: "artists" },
  { label: "Studios", value: "studios" },
] as const;

const SearchTabsInner = React.forwardRef<HTMLDivElement, SearchTabsProps>(
  ({ variant = "dark", className, ...props }, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isDark = variant === "dark";
    const activeTab = searchParams.get("tab") || "artists";

    const handleTabChange = (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-0", className)}
        {...props}
      >
        {tabs.map(({ label, value }) => {
          const isActive = activeTab === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleTabChange(value)}
              className={cn(
                "px-6 py-2 font-mono text-[10px] tracking-[0.15em] uppercase border-b-2 transition-colors duration-200",
                isActive
                  ? isDark
                    ? "text-ink-red border-ink-red"
                    : "text-ink-black border-ink-black"
                  : isDark
                    ? "text-ink-cream/25 border-transparent hover:text-ink-cream/40"
                    : "text-ink-black/45 border-transparent hover:text-ink-black/65"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }
);
SearchTabsInner.displayName = "SearchTabsInner";

const SearchTabs = React.forwardRef<HTMLDivElement, SearchTabsProps>(
  (props, ref) => (
    <Suspense fallback={null}>
      <SearchTabsInner ref={ref} {...props} />
    </Suspense>
  )
);

SearchTabs.displayName = "SearchTabs";

export { SearchTabs };

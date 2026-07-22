"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SearchTabsProps {
  className?: string;
}

const tabs = [
  { label: "Artists", value: "artists" },
  { label: "Studios", value: "studios" },
] as const;

const SearchTabsInner = React.forwardRef<HTMLDivElement, SearchTabsProps>(
  ({ className, ...props }, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

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
                  ? "text-ink-black border-ink-black dark:text-ink-red dark:border-ink-red"
                  : "border-transparent text-ink-black/45 hover:text-ink-black/65 dark:text-ink-cream/25 dark:hover:text-ink-cream/40"
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

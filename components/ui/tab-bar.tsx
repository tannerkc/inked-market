"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  label: string;
  value: T;
  count?: number;
}

export interface TabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  /** Always show count badge, even when 0 */
  showZeroCounts?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

function TabBarInner<T extends string>(
  {
    tabs,
    activeTab,
    onTabChange,
    showZeroCounts = false,
    variant = "dark",
    className,
  }: TabBarProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const isLight = variant === "light";

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-0 border-b overflow-x-auto scrollbar-hide transition-colors duration-500",
        isLight ? "border-ink-black/[0.08]" : "border-ink-cream/[0.06]",
        className
      )}
    >
      {tabs.map(({ label, value, count }) => {
        const isActive = activeTab === value;
        const showCount =
          count !== undefined && (showZeroCounts || count > 0);

        return (
          <button
            key={value}
            type="button"
            onClick={() => onTabChange(value)}
            className={cn(
              "px-5 py-3.5 font-mono text-[10px] tracking-[0.15em] uppercase border-b-2 transition-colors duration-200 whitespace-nowrap cursor-pointer",
              isActive
                ? isLight
                  ? "text-ink-black border-ink-black"
                  : "text-ink-red border-ink-red"
                : isLight
                  ? "text-ink-black/30 border-transparent hover:text-ink-black/50"
                  : "text-ink-cream/25 border-transparent hover:text-ink-cream/40"
            )}
          >
            {label}
            {showCount && (
              <span
                className={cn(
                  "ml-1.5 text-[9px] px-1.5 py-px rounded-full",
                  isActive
                    ? isLight
                      ? "bg-ink-black/10 text-ink-black/60"
                      : "bg-ink-red/15 text-ink-red"
                    : isLight
                      ? "bg-ink-black/5 text-ink-black/30"
                      : "bg-ink-cream/5 text-ink-cream/25"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// forwardRef doesn't support generics directly, so we cast
const TabBar = React.forwardRef(TabBarInner) as <T extends string>(
  props: TabBarProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

(TabBar as { displayName?: string }).displayName = "TabBar";

export { TabBar };

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { SettingsNavItem } from "./use-settings-nav";

interface SettingsTabsProps {
  sections: SettingsNavItem[];
  activeSection: string;
  onSelect: (id: string) => void;
  className?: string;
}

const SettingsTabs = React.forwardRef<HTMLDivElement, SettingsTabsProps>(
  ({ sections, activeSection, onSelect, className }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Scroll active tab into view on mount and when active changes
    React.useEffect(() => {
      const container = scrollRef.current;
      if (!container) return;
      const activeEl = container.querySelector<HTMLElement>("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }, [activeSection]);

    return (
      <div
        ref={ref}
        className={cn(
          "lg:hidden overflow-x-auto scrollbar-none border-b",
          "border-ink-black/[0.06] dark:border-ink-cream/[0.06]",
          className
        )}
      >
        <div ref={scrollRef} className="flex gap-0 px-1 min-w-max">
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                data-active={isActive}
                onClick={() => onSelect(section.id)}
                className={cn(
                  "px-3.5 py-2.5 font-mono text-[10px] tracking-[0.05em] whitespace-nowrap transition-colors cursor-pointer border-b-2",
                  isActive
                    ? "border-ink-rust text-ink-rust"
                    : cn(
                        "border-transparent",
                        section.danger
                          ? "text-ink-red/40 hover:text-ink-red/60"
                          : "text-ink-black/35 hover:text-ink-black/50 dark:text-ink-cream/35 dark:hover:text-ink-cream/50"
                      )
                )}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);
SettingsTabs.displayName = "SettingsTabs";

export { SettingsTabs };

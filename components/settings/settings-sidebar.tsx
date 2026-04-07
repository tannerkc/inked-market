"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import type { SettingsNavItem } from "./use-settings-nav";

interface SettingsSidebarProps {
  sections: SettingsNavItem[];
  activeSection: string;
  onSelect: (id: string) => void;
  className?: string;
}

const SettingsSidebar = React.forwardRef<HTMLDivElement, SettingsSidebarProps>(
  ({ sections, activeSection, onSelect, className }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    const mainSections = sections.filter((s) => !s.danger);
    const dangerSections = sections.filter((s) => s.danger);

    return (
      <nav
        ref={ref}
        className={cn("hidden lg:block w-[200px] flex-shrink-0", className)}
      >
        <p
          className={cn(
            "font-mono text-[8px] tracking-[0.2em] uppercase mb-3 px-2.5",
            isDark ? "text-ink-cream/25" : "text-ink-black/25"
          )}
        >
          Settings
        </p>

        <div className="space-y-0.5">
          {mainSections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className={cn(
                  "w-full text-left px-2.5 py-[7px] rounded-[10px] font-mono text-[11px] tracking-[0.03em] transition-colors cursor-pointer",
                  isActive
                    ? isDark
                      ? "bg-ink-cream/[0.06] text-ink-cream/80"
                      : "bg-ink-black/[0.06] text-ink-black/80"
                    : isDark
                      ? "text-ink-cream/45 hover:text-ink-cream/60 hover:bg-ink-cream/[0.03]"
                      : "text-ink-black/45 hover:text-ink-black/60 hover:bg-ink-black/[0.03]"
                )}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        {dangerSections.length > 0 && (
          <>
            <div
              className={cn(
                "my-3 border-t",
                isDark ? "border-ink-cream/[0.04]" : "border-ink-black/[0.04]"
              )}
            />
            <div className="space-y-0.5">
              {dangerSections.map((section) => {
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSelect(section.id)}
                    className={cn(
                      "w-full text-left px-2.5 py-[7px] rounded-[10px] font-mono text-[11px] tracking-[0.03em] transition-colors cursor-pointer",
                      isActive
                        ? "bg-ink-red/[0.08] text-ink-red/80"
                        : "text-ink-red/45 hover:text-ink-red/60 hover:bg-ink-red/[0.04]"
                    )}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </nav>
    );
  }
);
SettingsSidebar.displayName = "SettingsSidebar";

export { SettingsSidebar };

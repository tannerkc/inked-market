"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsSection = React.forwardRef<HTMLDivElement, SettingsSectionProps>(
  ({ title, description, children, className }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <h2
          className={cn(
            "text-[16px] font-semibold mb-1",
            isDark ? "text-ink-cream/80" : "text-ink-black/80"
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "text-[11px] mb-6",
            isDark ? "text-ink-cream/35" : "text-ink-black/35"
          )}
        >
          {description}
        </p>
        {children}
      </div>
    );
  }
);
SettingsSection.displayName = "SettingsSection";

export { SettingsSection };

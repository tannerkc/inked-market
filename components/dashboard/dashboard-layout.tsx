"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { FilmGrainOverlay } from "@/components/ui/film-grain";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, className, ...props }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-screen",
          isDark
            ? "bg-ink-black"
            : "bg-gradient-to-b from-ink-parchment-light via-ink-cream to-ink-parchment-dark",
          className
        )}
        {...props}
      >
        {isDark && <FilmGrainOverlay />}
        {isDark && (
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-red)_6%,transparent),transparent_70%)] pointer-events-none" />
        )}
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
          {children}
        </div>
      </div>
    );
  }
);
DashboardLayout.displayName = "DashboardLayout";

export { DashboardLayout };

"use client";

import { cn } from "@/lib/utils";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/providers/theme-provider";

interface ThemedPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  withTextColor?: boolean;
}

export function ThemedPageWrapper({ children, className, withTextColor = false }: ThemedPageWrapperProps) {
  const { mode, setMode } = useTheme();
  const isLight = mode === "light";

  return (
    <div
      className={cn(
        "min-h-screen relative transition-colors duration-500",
        isLight
          ? "bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"
          : "bg-ink-black",
        withTextColor && (isLight ? "text-ink-black" : "text-ink-cream"),
        className
      )}
    >
      <FilmGrainOverlay
        className={isLight ? "opacity-[0.03]" : "opacity-[0.035]"}
      />
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[250px] bg-ink-red-glow-top pointer-events-none z-[1] transition-opacity duration-500",
          isLight ? "opacity-0" : "opacity-100"
        )}
      />
      <ThemeToggle mode={mode} onToggle={setMode} className="pt-24" />
      {children}
    </div>
  );
}

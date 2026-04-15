"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { InkAccentColor } from "@/lib/types";

type ProgressAccentColor = InkAccentColor;

interface ReadingProgressProps {
  accentColor?: ProgressAccentColor;
  className?: string;
}

const barColorMap: Record<ProgressAccentColor, string> = {
  sage: "bg-ink-sage/60",
  rust: "bg-ink-rust/60",
  red: "bg-ink-red/60",
};

function ReadingProgress({
  accentColor = "rust",
  className,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-16 left-0 right-0 z-40 h-0.5 transition-opacity duration-300",
        progress < 2 ? "opacity-0" : "opacity-100",
        className
      )}
    >
      <div
        className={cn(
          "h-full transition-[width] duration-150 ease-out",
          barColorMap[accentColor]
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export { ReadingProgress };

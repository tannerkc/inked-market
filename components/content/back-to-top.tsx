"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BackToTopProps {
  variant?: "light" | "dark";
  className?: string;
}

function BackToTop({ variant = "dark", className }: BackToTopProps) {
  const isDark = variant === "dark";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-8 right-8 z-40 w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all duration-300",
        isDark
          ? "border-ink-cream/[0.06] bg-ink-black/80 text-ink-cream/30 hover:text-ink-cream/60 hover:border-ink-cream/[0.12]"
          : "border-ink-black/[0.06] bg-white/80 text-ink-black/30 hover:text-ink-black/60 hover:border-ink-black/[0.12]",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 10l4-4 4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export { BackToTop };

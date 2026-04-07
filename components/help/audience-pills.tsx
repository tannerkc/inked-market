"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const audiences = [
  { value: "all", label: "All Topics" },
  { value: "customer", label: "Customers" },
  { value: "artist", label: "Artists" },
  { value: "studio-owner", label: "Studio Owners" },
] as const;

interface AudiencePillsProps {
  variant?: "light" | "dark";
  className?: string;
}

function AudiencePills({ variant = "dark", className }: AudiencePillsProps) {
  const isDark = variant === "dark";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = searchParams.get("audience") || "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("audience");
    } else {
      params.set("audience", value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className={cn("flex gap-2 justify-center flex-wrap", className)}>
      {audiences.map((a) => {
        const isActive = a.value === active;
        return (
          <button
            key={a.value}
            onClick={() => handleChange(a.value)}
            className={cn(
              "px-4 py-1.5 rounded-full font-mono text-[10px] tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300 border cursor-pointer",
              isActive && isDark && "bg-ink-cream text-ink-black border-ink-cream",
              isActive && !isDark && "bg-ink-black text-ink-cream border-ink-black",
              !isActive && isDark && "bg-transparent text-ink-cream/30 border-ink-cream/8 hover:border-ink-cream/15 hover:text-ink-cream/50",
              !isActive && !isDark && "bg-transparent text-ink-black/35 border-ink-black/8 hover:border-ink-black/15 hover:text-ink-black/50"
            )}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

export { AudiencePills };

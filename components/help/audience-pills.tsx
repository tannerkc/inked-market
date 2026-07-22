"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const audiences = [
  { value: "all", label: "All Topics" },
  { value: "customer", label: "Customers" },
  { value: "artist", label: "Artists" },
  { value: "studio-owner", label: "Studio Owners" },
] as const;

interface AudiencePillsProps {
  className?: string;
}

function AudiencePillsInner({ className }: AudiencePillsProps) {
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
              isActive
                ? "bg-ink-black text-ink-cream border-ink-black dark:bg-ink-cream dark:text-ink-black dark:border-ink-cream"
                : cn(
                    "bg-transparent",
                    "text-ink-black/35 border-ink-black/8 hover:border-ink-black/15 hover:text-ink-black/50",
                    "dark:text-ink-cream/30 dark:border-ink-cream/8 dark:hover:border-ink-cream/15 dark:hover:text-ink-cream/50"
                  )
            )}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

function AudiencePills(props: AudiencePillsProps) {
  return (
    <Suspense fallback={null}>
      <AudiencePillsInner {...props} />
    </Suspense>
  );
}

export { AudiencePills };

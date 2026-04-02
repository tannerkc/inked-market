"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TypeCardProps {
  href: string;
  icon: React.ReactNode;
  iconColor: "sage" | "red" | "rust";
  title: string;
  description: string;
  features: string[];
  className?: string;
}

const iconBgMap: Record<string, string> = {
  sage: "bg-ink-sage/10",
  red: "bg-ink-red/[0.08]",
  rust: "bg-ink-rust/[0.08]",
};

const TypeCard = React.forwardRef<HTMLAnchorElement, TypeCardProps>(
  ({ href, icon, iconColor, title, description, features, className }, ref) => (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "flex items-center gap-4 p-[18px] rounded-2xl border border-ink-black/[0.05] bg-white",
        "transition-all duration-200 group",
        "hover:border-ink-black/[0.15]",
        className
      )}
    >
      <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0", iconBgMap[iconColor])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[15px] font-semibold text-ink-black mb-0.5">{title}</h4>
        <p className="text-[11.5px] text-ink-black/35 leading-snug">{description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {features.map((f) => (
            <span
              key={f}
              className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-1 rounded-md border border-ink-black/[0.04] bg-ink-black/[0.015] text-ink-black/30"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <span className="text-lg text-ink-black/[0.15] group-hover:text-ink-black/35 group-hover:translate-x-0.5 transition-all flex-shrink-0">
        ›
      </span>
    </Link>
  )
);
TypeCard.displayName = "TypeCard";

export { TypeCard };
export type { TypeCardProps };

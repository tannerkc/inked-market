"use client";

import { cn } from "@/lib/utils";

interface MagnumUpsellHintProps {
  title: string;
  description: string;
  className?: string;
}

export function MagnumUpsellHint({
  title,
  description,
  className,
}: MagnumUpsellHintProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#222] bg-[#111]/60 p-4 opacity-60",
        className
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-sm" aria-hidden="true">
          🔒
        </span>
        <span className="text-xs font-medium text-[#ededed]">{title}</span>
        <span className="ml-auto rounded bg-[rgba(255,51,51,0.15)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FF3333]">
          Magnum
        </span>
      </div>
      <p className="pl-6 text-[11px] leading-snug text-[#555]">
        {description}
      </p>
    </div>
  );
}

MagnumUpsellHint.displayName = "MagnumUpsellHint";

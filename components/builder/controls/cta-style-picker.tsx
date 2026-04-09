"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import type { CtaStyle } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

export function CtaStylePicker() {
  const { config, applyChange } = useBuilder();
  const current = config.ctaStyle ?? "filled";

  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Button Style
      </div>
      <div className="flex gap-1.5">
        {(["filled", "outline", "pill"] as CtaStyle[]).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => applyChange({ ctaStyle: style })}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-[11px] font-medium capitalize transition-colors",
              current === style
                ? "border-[#FF3333] bg-[rgba(255,51,51,0.1)] text-[#FF3333]"
                : "border-[#222] bg-[#111] text-[#888] hover:border-[#333]",
            )}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
}

CtaStylePicker.displayName = "CtaStylePicker";

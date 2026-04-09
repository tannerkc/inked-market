"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { FlashEditor } from "@/components/builder/flash-editor";
import { CustomEditor } from "@/components/builder/custom-editor";
import type { BuilderTier } from "@/lib/types/builder";

export function EditorPanel() {
  const { config, applyChange } = useBuilder();
  const tier = config.builderTier ?? "flash";

  const switchTier = (newTier: BuilderTier) => {
    applyChange({ builderTier: newTier });
    try {
      localStorage.setItem("inked-builder-tier", newTier);
    } catch {
      // localStorage may be unavailable
    }
  };

  return (
    <div className="flex flex-col w-[380px] min-w-[380px] h-full bg-[#111] border-r border-[#222]">
      {/* Tier badge */}
      <div className="flex items-center justify-between border-b border-[#222] px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#444]">
          Editor
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => switchTier("flash")}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors",
              tier === "flash"
                ? "bg-[#FF3333]/15 text-[#FF3333]"
                : "bg-transparent text-[#444] hover:text-[#888]"
            )}
          >
            Flash
          </button>
          <button
            type="button"
            onClick={() => switchTier("custom")}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors",
              tier === "custom"
                ? "bg-[#FF3333]/15 text-[#FF3333]"
                : "bg-transparent text-[#444] hover:text-[#888]"
            )}
          >
            Custom
          </button>
        </div>
      </div>

      {tier === "flash" ? <FlashEditor /> : <CustomEditor />}
    </div>
  );
}

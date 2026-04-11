"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { backgroundOptions } from "@/lib/data/theme-presets";
import { cn } from "@/lib/utils";

export function BackgroundPicker() {
  const { config, resolvedVars, applyChange } = useBuilder();
  const currentBg = config.backgroundColor ?? resolvedVars["--bg-primary"];

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Background
      </div>
      <div className="flex flex-wrap gap-2">
        {backgroundOptions.map((opt) => {
          const selected = currentBg === opt.hex;
          const isDark = opt.mode === "dark";

          return (
            <button
              key={opt.hex}
              type="button"
              title={opt.name}
              onClick={() =>
                applyChange({ backgroundColor: opt.hex, backgroundMode: opt.mode })
              }
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-colors",
                selected
                  ? "border-white"
                  : isDark
                    ? "border-chrome-border-hover hover:border-chrome-text-dim"
                    : "border-transparent hover:border-chrome-text-dim"
              )}
              style={{ backgroundColor: opt.hex }}
            />
          );
        })}
      </div>
    </div>
  );
}

BackgroundPicker.displayName = "BackgroundPicker";

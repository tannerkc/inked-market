"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { accentColors } from "@/lib/data/theme-presets";
import { cn } from "@/lib/utils";

export function AccentColorPicker() {
  const { config, resolvedVars, applyChange } = useBuilder();
  const currentAccent = config.accentColor ?? resolvedVars["--accent"];

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Accent Color
      </div>
      <div className="flex flex-wrap gap-2">
        {accentColors.map((color) => {
          const selected = currentAccent === color.hex;
          return (
            <button
              key={color.hex}
              type="button"
              title={color.name}
              onClick={() => applyChange({ accentColor: color.hex })}
              className={cn(
                "relative h-9 w-9 rounded-full border-2 transition-colors",
                selected
                  ? "border-white"
                  : "border-transparent hover:border-chrome-text-dim"
              )}
              style={{ backgroundColor: color.hex }}
            >
              {selected && (
                <svg
                  className="absolute inset-0 m-auto h-4 w-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke={
                    color.hex === "#ffffff" || color.hex === "#C9A840"
                      ? "#111"
                      : "#fff"
                  }
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 8.5 6.5 11.5 12.5 5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

AccentColorPicker.displayName = "AccentColorPicker";

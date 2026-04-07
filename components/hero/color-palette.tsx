"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const INK_COLORS = [
  { name: "black", hex: "#0A0A0A" },
  { name: "red", hex: "#FF3333" },
  { name: "blue", hex: "#2B5EA7" },
] as const;

export type InkColor = (typeof INK_COLORS)[number]["hex"];

interface ColorPaletteProps {
  color: InkColor;
  onColorChange: (color: InkColor) => void;
  className?: string;
}

const ColorPalette = React.forwardRef<HTMLDivElement, ColorPaletteProps>(
  ({ color, onColorChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full",
          "border border-[#0A0A0A]/[0.06] shadow-sm",
          className
        )}
      >
        {INK_COLORS.map((ink) => (
          <button
            key={ink.name}
            type="button"
            aria-label={`${ink.name} ink`}
            onClick={() => onColorChange(ink.hex)}
            className={cn(
              "w-5 h-5 rounded-full transition-all duration-200 cursor-pointer",
              color === ink.hex
                ? "ring-2 ring-offset-2 ring-[#0A0A0A]/30 scale-110"
                : "hover:scale-110"
            )}
            style={{ backgroundColor: ink.hex }}
          />
        ))}
      </div>
    );
  }
);

ColorPalette.displayName = "ColorPalette";

export { ColorPalette, INK_COLORS };

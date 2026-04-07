"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { typographyPairings } from "@/lib/data/typography-pairings";
import type { TypographyPairing } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function PairingCard({
  pairing,
  selected,
  onSelect,
}: {
  pairing: TypographyPairing;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-[#FF3333] bg-[rgba(255,51,51,0.1)]"
          : "border-[#222] bg-[#111] hover:border-[#333]"
      )}
    >
      {/* Heading preview */}
      <div
        className="mb-1 truncate text-sm uppercase text-[#ededed]"
        style={{ fontFamily: `'${pairing.headingFont}', sans-serif` }}
      >
        IRON & INK STUDIO
      </div>

      {/* Body preview */}
      <div
        className="mb-2 truncate text-[11px] leading-snug text-[#888]"
        style={{ fontFamily: `'${pairing.bodyFont}', sans-serif` }}
      >
        Where classic American tradition meets modern precision.
      </div>

      {/* Label */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] font-semibold text-[#ededed]">
          {pairing.name}
        </span>
        <span className="text-[10px] text-[#555]">{pairing.character}</span>
      </div>
    </button>
  );
}

export function TypographyPairPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Typography
      </div>
      <div className="flex flex-col gap-2">
        {typographyPairings.map((pairing) => (
          <PairingCard
            key={pairing.name}
            pairing={pairing}
            selected={
              config.headingFont === pairing.headingFont &&
              config.bodyFont === pairing.bodyFont
            }
            onSelect={() =>
              applyChange({
                headingFont: pairing.headingFont,
                bodyFont: pairing.bodyFont,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

TypographyPairPicker.displayName = "TypographyPairPicker";

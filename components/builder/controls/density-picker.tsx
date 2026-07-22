"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { densityOptions } from "@/lib/data/builder-options";
import type { Density } from "@/lib/types/builder";
import { OptionGridPicker } from "./option-grid-picker";

export function DensityPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <OptionGridPicker<Density>
      title="Spacing Density"
      columns={3}
      options={densityOptions}
      selectedValue={config.density ?? "balanced"}
      onSelect={(value) => applyChange({ density: value })}
    />
  );
}

DensityPicker.displayName = "DensityPicker";

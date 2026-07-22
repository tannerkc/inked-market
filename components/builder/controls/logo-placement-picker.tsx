"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { logoPlacementOptions } from "@/lib/data/builder-options";
import type { LogoPlacement } from "@/lib/types/builder";
import { OptionGridPicker } from "./option-grid-picker";

export function LogoPlacementPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <OptionGridPicker<LogoPlacement>
      title="Logo Placement"
      columns={3}
      options={logoPlacementOptions}
      selectedValue={config.logoPlacement as LogoPlacement}
      onSelect={(value) => applyChange({ logoPlacement: value })}
    />
  );
}

LogoPlacementPicker.displayName = "LogoPlacementPicker";

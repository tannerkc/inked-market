"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { borderShapeOptions } from "@/lib/data/builder-options";
import type { BorderShape } from "@/lib/types/builder";
import { OptionGridPicker } from "./option-grid-picker";

export function BorderShapePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <OptionGridPicker<BorderShape>
      title="Border Shape"
      columns={3}
      options={borderShapeOptions}
      selectedValue={config.borderShape ?? "sharp"}
      onSelect={(value) => applyChange({ borderShape: value })}
    />
  );
}

BorderShapePicker.displayName = "BorderShapePicker";

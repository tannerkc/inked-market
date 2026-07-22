"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { dividerStyleOptions } from "@/lib/data/builder-options";
import type { DividerStyle } from "@/lib/types/builder";
import { OptionGridPicker } from "./option-grid-picker";

export function DividerStylePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <OptionGridPicker<DividerStyle>
      title="Divider Style"
      options={dividerStyleOptions}
      selectedValue={config.dividerStyle ?? "solid"}
      onSelect={(value) => applyChange({ dividerStyle: value })}
    />
  );
}

DividerStylePicker.displayName = "DividerStylePicker";

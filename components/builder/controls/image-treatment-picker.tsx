"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { imageTreatmentOptions } from "@/lib/data/builder-options";
import type { ImageTreatment } from "@/lib/types/builder";
import { OptionGridPicker } from "./option-grid-picker";

export function ImageTreatmentPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <OptionGridPicker<ImageTreatment>
      title="Image Treatment"
      options={imageTreatmentOptions}
      selectedValue={config.imageTreatment as ImageTreatment}
      onSelect={(value) => applyChange({ imageTreatment: value })}
    />
  );
}

ImageTreatmentPicker.displayName = "ImageTreatmentPicker";

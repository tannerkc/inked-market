"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { surfaceTextureOptions } from "@/lib/data/builder-options";
import type { SurfaceTexture } from "@/lib/types/builder";
import { OptionGridPicker } from "./option-grid-picker";

export function TexturePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <OptionGridPicker<SurfaceTexture>
      title="Surface Texture"
      options={surfaceTextureOptions}
      selectedValue={config.surfaceTexture as SurfaceTexture}
      onSelect={(value) => applyChange({ surfaceTexture: value })}
    />
  );
}

TexturePicker.displayName = "TexturePicker";

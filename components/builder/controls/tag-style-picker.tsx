"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { tagOptions } from "@/lib/data/builder-options";
import type { TagStyle } from "@/lib/types/builder";
import { cn } from "@/lib/utils";
import { ThumbnailPicker } from "./thumbnail-picker";

function TagThumbnail({ style, accent }: { style: TagStyle; accent: string }) {
  const tagBase = "px-2 py-0.5 text-[9px] font-medium";

  const renderTag = (label: string) => {
    switch (style) {
      case "pill":
        return (
          <span className={cn(tagBase, "rounded-full")} style={{ backgroundColor: `${accent}1a`, color: accent }}>
            {label}
          </span>
        );
      case "square":
        return (
          <span className={cn(tagBase, "rounded")} style={{ backgroundColor: `${accent}1a`, color: accent }}>
            {label}
          </span>
        );
      case "outline":
        return (
          <span className={cn(tagBase, "rounded-full border")} style={{ borderColor: `${accent}66`, color: accent }}>
            {label}
          </span>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-1.5 rounded-md bg-chrome-raised p-2.5">
      {renderTag("Traditional")}
      {renderTag("Realism")}
      {renderTag("Blackwork")}
    </div>
  );
}

export function TagStylePicker() {
  const { config, resolvedVars, applyChange } = useBuilder();
  const accent = config.accentColor ?? resolvedVars["--accent"];

  return (
    <ThumbnailPicker<TagStyle>
      title="Tag Style"
      columns={3}
      options={tagOptions}
      selectedValue={config.tagStyle}
      onSelect={(value) => applyChange({ tagStyle: value })}
      renderThumbnail={(value) => <TagThumbnail style={value} accent={accent} />}
    />
  );
}

TagStylePicker.displayName = "TagStylePicker";

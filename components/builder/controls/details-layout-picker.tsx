"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { detailsOptions } from "@/lib/data/builder-options";
import type { DetailsLayout } from "@/lib/types/builder";
import { ThumbnailPicker } from "./thumbnail-picker";

function DetailsThumbnail({ layout }: { layout: DetailsLayout }) {
  switch (layout) {
    case "three-col":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-chrome-raised p-2">
          <div className="w-1/3 rounded bg-chrome-muted" />
          <div className="w-1/3 rounded bg-chrome-border-hover" />
          <div className="w-1/3 rounded bg-chrome-muted" />
        </div>
      );
    case "two-one":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-chrome-raised p-2">
          <div className="w-2/3 rounded bg-chrome-muted" />
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-1/2 rounded bg-chrome-border-hover" />
            <div className="h-1/2 rounded bg-chrome-border-hover" />
          </div>
        </div>
      );
    case "stacked":
      return (
        <div className="flex h-full w-full flex-col gap-1 rounded-md bg-chrome-raised p-2">
          <div className="h-1/3 w-full rounded bg-chrome-muted" />
          <div className="h-1/3 w-full rounded bg-chrome-border-hover" />
          <div className="h-1/3 w-full rounded bg-chrome-muted" />
        </div>
      );
  }
}

export function DetailsLayoutPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <ThumbnailPicker<DetailsLayout>
      title="Details Layout"
      columns={3}
      options={detailsOptions}
      selectedValue={config.detailsLayout}
      onSelect={(value) => applyChange({ detailsLayout: value })}
      renderThumbnail={(value) => <DetailsThumbnail layout={value} />}
    />
  );
}

DetailsLayoutPicker.displayName = "DetailsLayoutPicker";

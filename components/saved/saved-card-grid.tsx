"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SavedCard } from "./saved-card";
import type { SavedEntity } from "@/lib/data/saved";

export interface SavedCardGridProps {
  items: SavedEntity[];
  type: "artist" | "studio";
  removingIds?: Set<string>;
  onUnsave?: (id: string, type: "artist" | "studio") => void;
  className?: string;
}

const SavedCardGrid = React.forwardRef<HTMLDivElement, SavedCardGridProps>(
  ({ items, type, removingIds, onUnsave, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5",
        className
      )}
    >
      {items.map((item) => (
        <SavedCard
          key={item.id}
          id={item.id}
          slug={item.slug}
          type={type}
          name={item.name}
          image={item.image}
          avatar={item.avatar}
          location={item.location}
          rating={item.rating}
          reviewCount={item.reviewCount}
          specialties={item.specialties}
          verified={item.verified}
          badges={item.badges}
          savedAt={item.savedAt}
          removing={removingIds?.has(`${type}-${item.id}`)}
          onUnsave={(id) => onUnsave?.(id, type)}
        />
      ))}
    </div>
  )
);

SavedCardGrid.displayName = "SavedCardGrid";

export { SavedCardGrid };

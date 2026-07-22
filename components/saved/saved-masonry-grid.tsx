"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SavedPieceCard } from "./saved-piece-card";
import type { SavedPortfolioPiece } from "@/lib/data/saved";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface SavedMasonryGridProps {
  pieces: SavedPortfolioPiece[];
  removingIds?: Set<string>;
  onUnsave?: (id: string) => void;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

const SavedMasonryGrid = React.forwardRef<HTMLDivElement, SavedMasonryGridProps>(
  ({ pieces, removingIds, onUnsave, className }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-2 md:grid-cols-3 gap-[3px]", className)}
    >
      {pieces.map((piece, i) => {
        const isTall = piece.aspectRatio === "2:3";
        const isFirst = i === 0 && pieces.length > 2;

        return (
          <SavedPieceCard
            key={piece.id}
            piece={piece}
            removing={removingIds?.has(piece.id)}
            onUnsave={onUnsave}
            showTags
            noAspectRatio={isFirst}
            className={cn(
              isFirst && "col-span-2 row-span-2",
              !isFirst && isTall && "row-span-2"
            )}
          />
        );
      })}
    </div>
  )
);

SavedMasonryGrid.displayName = "SavedMasonryGrid";

export { SavedMasonryGrid };

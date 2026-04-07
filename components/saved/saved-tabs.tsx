"use client";

import * as React from "react";
import { TabBar } from "@/components/ui/tab-bar";
import type { TabItem } from "@/components/ui/tab-bar";

export type SavedTabValue = "all" | "studios" | "artists" | "portfolio";

export interface SavedTabsProps {
  activeTab: SavedTabValue;
  onTabChange: (tab: SavedTabValue) => void;
  counts: Record<SavedTabValue, number>;
  variant?: "light" | "dark";
  className?: string;
}

const tabDefs: { label: string; value: SavedTabValue }[] = [
  { label: "All", value: "all" },
  { label: "Studios", value: "studios" },
  { label: "Artists", value: "artists" },
  { label: "Portfolio", value: "portfolio" },
];

const SavedTabs = React.forwardRef<HTMLDivElement, SavedTabsProps>(
  ({ activeTab, onTabChange, counts, variant = "dark", className }, ref) => {
    const tabs: TabItem<SavedTabValue>[] = tabDefs.map((t) => ({
      ...t,
      count: counts[t.value],
    }));

    return (
      <TabBar<SavedTabValue>
        ref={ref}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        showZeroCounts
        variant={variant}
        className={className}
      />
    );
  }
);

SavedTabs.displayName = "SavedTabs";

export { SavedTabs };

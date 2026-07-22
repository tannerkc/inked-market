"use client";

import * as React from "react";
import { TabBar } from "@/components/ui/tab-bar";
import type { TabItem } from "@/components/ui/tab-bar";

export type LineupTabValue = "this-week" | "spotlights" | "events" | "archive";

export interface LineupTabsProps {
  activeTab: LineupTabValue;
  onTabChange: (tab: LineupTabValue) => void;
  eventCount?: number;
  className?: string;
}

const LineupTabs = React.forwardRef<HTMLDivElement, LineupTabsProps>(
  ({ activeTab, onTabChange, eventCount, className }, ref) => {
    const tabs: TabItem<LineupTabValue>[] = [
      { label: "This Week", value: "this-week" },
      { label: "Spotlights", value: "spotlights" },
      { label: "Events", value: "events", count: eventCount },
      { label: "Archive", value: "archive" },
    ];

    return (
      <TabBar<LineupTabValue>
        ref={ref}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        className={className}
      />
    );
  }
);

LineupTabs.displayName = "LineupTabs";

export { LineupTabs };

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { useMobileSheet } from "./mobile-sheet-orchestrator";
import { FLASH_TABS, CUSTOM_TABS } from "@/lib/config/builder-toolbar-tabs";

const ThemeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const TypeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4h16v3M9 20h6M12 4v16" />
  </svg>
);

const SectionsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18" />
  </svg>
);

const EffectsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const BrandIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const TAB_ICONS: Record<string, React.ReactNode> = {
  theme: ThemeIcon,
  type: TypeIcon,
  sections: SectionsIcon,
  effects: EffectsIcon,
  brand: BrandIcon,
};

const ContentIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export function MobileMiniBar() {
  const { config, openContentPanel, contentPanel } = useBuilder();
  const { state, openGlobal } = useMobileSheet();
  const tier = config.builderTier ?? "flash";
  const tabs = tier === "custom" ? CUSTOM_TABS : FLASH_TABS;

  return (
    <div
      className="shrink-0 border-t border-chrome-border bg-ink-black/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-14 items-center justify-around px-2">
        <button
          type="button"
          onClick={() => openContentPanel()}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors active:bg-white/5",
            contentPanel.open ? "text-ink-red" : "text-chrome-text-dim",
          )}
        >
          <span className={cn(contentPanel.open && "text-ink-red")}>{ContentIcon}</span>
          <span className="text-[9px] font-semibold">Content</span>
        </button>
        {tabs.map((tab) => {
          const isActive =
            state.isOpen && state.type === "global" && state.globalTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => openGlobal(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors active:bg-white/5",
                isActive ? "text-ink-red" : "text-chrome-text-dim",
              )}
            >
              <span className={cn(isActive && "text-ink-red")}>{TAB_ICONS[tab.id]}</span>
              <span className="text-[9px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

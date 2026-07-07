"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DeviceToggle } from "@/components/builder/device-toggle";
import type { DevicePreview, BuilderTier } from "@/lib/types/builder";

export interface ToolbarButtonDef {
  id: string;
  icon: string;
  label: string;
}

interface BottomToolbarProps {
  buttons: ToolbarButtonDef[];
  activeFlyout: string | null;
  onFlyoutToggle: (name: string) => void;
  device: DevicePreview;
  onDeviceChange: (d: DevicePreview) => void;
  onReset: () => void;
  tier?: BuilderTier;
  onTierChange?: (t: BuilderTier) => void;
  /** Opens the Content panel (studio data editing). */
  onOpenContent?: () => void;
}

function ToolbarButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors",
        isActive
          ? "bg-white text-ink-black"
          : "bg-transparent text-chrome-text-secondary hover:bg-chrome-raised hover:text-white"
      )}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-6 w-px bg-chrome-muted" />;
}

export function BottomToolbar({
  buttons,
  activeFlyout,
  onFlyoutToggle,
  device,
  onDeviceChange,
  onReset,
  tier,
  onTierChange,
  onOpenContent,
}: BottomToolbarProps) {
  return (
    <div data-builder-toolbar className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-chrome-muted bg-ink-black/95 p-[5px] shadow-2xl backdrop-blur-xl">
      {onOpenContent ? (
        <>
          <button
            type="button"
            onClick={onOpenContent}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-chrome-text-secondary transition-colors hover:bg-chrome-raised hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Content
          </button>
          <Divider />
        </>
      ) : null}
      {buttons.map((btn) => (
        <ToolbarButton
          key={btn.id}
          icon={btn.icon}
          label={btn.label}
          isActive={activeFlyout === btn.id}
          onClick={() => onFlyoutToggle(btn.id)}
        />
      ))}

      <Divider />

      <div className="px-1">
        <DeviceToggle value={device} onChange={onDeviceChange} />
      </div>

      <Divider />

      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-2 rounded-xl bg-transparent px-4 py-2.5 text-xs font-medium text-chrome-text-secondary transition-colors hover:bg-chrome-raised hover:text-white"
      >
        <span className="text-sm">↺</span>
        Reset
      </button>

      {tier && onTierChange ? <>
          <Divider />
          <div className="flex gap-0.5 px-0.5">
            {(["flash", "custom"] as BuilderTier[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTierChange(t)}
                className={cn(
                  "rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  tier === t
                    ? "bg-ink-red/15 text-ink-red"
                    : "bg-transparent text-chrome-text-faint hover:text-chrome-text-secondary"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </> : null}
    </div>
  );
}

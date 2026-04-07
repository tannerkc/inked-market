"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DeviceToggle } from "@/components/builder/device-toggle";
import type { DevicePreview } from "@/lib/types/builder";

interface BottomToolbarProps {
  activeFlyout: string | null;
  onFlyoutToggle: (name: string) => void;
  device: DevicePreview;
  onDeviceChange: (d: DevicePreview) => void;
  onReset: () => void;
}

interface ToolbarButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, label, isActive, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors",
        isActive
          ? "bg-white text-[#0a0a0a]"
          : "bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-white"
      )}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-6 w-px bg-[#2a2a2a]" />;
}

export function BottomToolbar({
  activeFlyout,
  onFlyoutToggle,
  device,
  onDeviceChange,
  onReset,
}: BottomToolbarProps) {
  return (
    <div data-builder-toolbar className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a]/95 p-[5px] shadow-2xl backdrop-blur-xl">
      <ToolbarButton
        icon="◐"
        label="Theme"
        isActive={activeFlyout === "theme"}
        onClick={() => onFlyoutToggle("theme")}
      />
      <ToolbarButton
        icon="◉"
        label="Colors"
        isActive={activeFlyout === "colors"}
        onClick={() => onFlyoutToggle("colors")}
      />
      <ToolbarButton
        icon="Aa"
        label="Type"
        isActive={activeFlyout === "type"}
        onClick={() => onFlyoutToggle("type")}
      />

      <Divider />

      <div className="px-1">
        <DeviceToggle value={device} onChange={onDeviceChange} />
      </div>

      <Divider />

      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-2 rounded-xl bg-transparent px-4 py-2.5 text-xs font-medium text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-white"
      >
        <span className="text-sm">↺</span>
        Reset
      </button>
    </div>
  );
}

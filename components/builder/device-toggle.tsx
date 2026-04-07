"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { DevicePreview } from "@/lib/types/builder";

const devices: { label: string; value: DevicePreview }[] = [
  { label: "Desktop", value: "desktop" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
];

interface DeviceToggleProps {
  value: DevicePreview;
  onChange: (device: DevicePreview) => void;
}

export function DeviceToggle({ value, onChange }: DeviceToggleProps) {
  return (
    <div className="flex items-center gap-1">
      {devices.map((device) => (
        <button
          key={device.value}
          type="button"
          onClick={() => onChange(device.value)}
          className={cn(
            "rounded-md px-3 py-[5px] text-xs font-medium border transition-colors",
            value === device.value
              ? "bg-[#222] text-white border-[#444]"
              : "bg-transparent text-[#888] border-[#333] hover:text-[#bbb]"
          )}
        >
          {device.label}
        </button>
      ))}
    </div>
  );
}

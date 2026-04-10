"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { DevicePreview } from "@/lib/types/builder";
import { DeviceToggle } from "@/components/builder/device-toggle";
import { StudioPagePreview } from "@/components/builder/studio-page-preview";
import { useBuilder } from "@/components/builder/builder-provider";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const deviceMaxWidth: Record<DevicePreview, string> = {
  desktop: "max-w-full",
  tablet: "max-w-[768px]",
  mobile: "max-w-[390px]",
};

export function PreviewPane() {
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const { studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const slugParts = [data?.name, data?.city, data?.state].filter(Boolean) as string[];
  const slug = slugParts.length ? toSlug(slugParts.join(" ")) : "your-studio";

  return (
    <div className="flex flex-1 flex-col min-w-0 h-full">
      {/* Browser chrome toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 bg-[#161616]/95 backdrop-blur border-b border-[#222]">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 pl-0.5">
          <div className="h-[10px] w-[10px] rounded-full bg-[#ff5f57]" />
          <div className="h-[10px] w-[10px] rounded-full bg-[#febc2e]" />
          <div className="h-[10px] w-[10px] rounded-full bg-[#28c840]" />
        </div>

        {/* URL bar */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#0e0e0e] px-3 py-[5px] min-w-[320px] max-w-[480px] w-full">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 self-center text-[#3a3a3a]">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="text-[11px] leading-none font-mono text-[#666] select-none">
              <span className="text-[#444]">https://</span>
              <span className="text-[#888]">inkedmarket.com</span>
              <span className="text-[#555]">/studios/{slug}</span>
            </span>
          </div>
        </div>

        {/* Device toggle */}
        <DeviceToggle value={device} onChange={setDevice} />
      </div>

      {/* Scrollable preview container */}
      <div
        data-sheet-root
        className="flex-1 overflow-y-auto transition-colors duration-400"
        style={device !== "desktop" ? {
          transform: "translateZ(0)",
          backgroundColor: "#111",
          backgroundImage: "radial-gradient(circle, #2a2a2a 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        } : { transform: "translateZ(0)", backgroundColor: "#0a0a0a" }}
      >
        <div
          className={cn(
            "mx-auto transition-all duration-400",
            deviceMaxWidth[device],
            device !== "desktop" && "my-6 shadow-[0_8px_48px_rgba(0,0,0,0.7)] border border-[#333]",
          )}
        >
          <StudioPagePreview interactive={false} />
        </div>
      </div>
    </div>
  );
}

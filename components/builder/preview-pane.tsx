"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { DevicePreview } from "@/lib/types/builder";
import { DeviceToggle } from "@/components/builder/device-toggle";
import { StudioPagePreview } from "@/components/builder/studio-page-preview";
import { useBuilder } from "@/components/builder/builder-provider";
import { UrlBar } from "@/components/builder/url-bar";
import { OverlayContext } from "@/lib/contexts/overlay-context";

const deviceMaxWidth: Record<DevicePreview, string> = {
  desktop: "max-w-full",
  tablet: "max-w-[768px]",
  mobile: "max-w-[390px]",
};

export function PreviewPane() {
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [overlayEl, setOverlayEl] = useState<HTMLElement | null>(null);
  const { resolvedVars } = useBuilder();

  useEffect(() => {
    if (!overlayEl) return;
    Object.entries(resolvedVars).forEach(([key, value]) => {
      overlayEl.style.setProperty(key, value);
    });
  }, [overlayEl, resolvedVars]);

  return (
    <div className="flex flex-1 flex-col min-w-0 h-full">
      {/* Browser chrome toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 bg-chrome-surface-hover/95 backdrop-blur border-b border-chrome-border">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 pl-0.5">
          <div className="h-[10px] w-[10px] rounded-full bg-traffic-red" />
          <div className="h-[10px] w-[10px] rounded-full bg-traffic-yellow" />
          <div className="h-[10px] w-[10px] rounded-full bg-traffic-green" />
        </div>

        {/* URL bar */}
        <UrlBar />

        {/* Device toggle */}
        <DeviceToggle value={device} onChange={setDevice} />
      </div>

      {/* Scrollable preview container */}
      <OverlayContext.Provider value={overlayEl}>
        <div className="relative flex-1 overflow-hidden">
          <div
            className="absolute inset-0 overflow-y-auto transition-colors duration-400"
            style={device !== "desktop" ? {
              backgroundColor: "var(--chrome-surface)",
              backgroundImage: "radial-gradient(circle, var(--chrome-muted) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            } : { backgroundColor: "var(--chrome-bg)" }}
          >
            <div
              className={cn(
                "mx-auto transition-all duration-400",
                deviceMaxWidth[device],
                device !== "desktop" && "my-6 shadow-[0_8px_48px_rgba(0,0,0,0.7)] border border-chrome-border-hover",
              )}
            >
              <StudioPagePreview interactive={false} />
            </div>
          </div>
          <div
            ref={setOverlayEl}
            className={cn(
              "absolute inset-0 pointer-events-none z-50 mx-auto",
              deviceMaxWidth[device],
            )}
          />
        </div>
      </OverlayContext.Provider>
    </div>
  );
}

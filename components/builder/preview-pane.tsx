"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { DevicePreview } from "@/lib/types/builder";
import { DeviceToggle } from "@/components/builder/device-toggle";
import { StudioPagePreview } from "@/components/builder/studio-page-preview";
import { useBuilder } from "@/components/builder/builder-provider";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import { OverlayContext } from "@/lib/contexts/overlay-context";

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
  const [overlayEl, setOverlayEl] = useState<HTMLElement | null>(null);
  const { studio, useMockData, resolvedVars, previewPage } = useBuilder();

  useEffect(() => {
    if (!overlayEl) return;
    Object.entries(resolvedVars).forEach(([key, value]) => {
      overlayEl.style.setProperty(key, value);
    });
  }, [overlayEl, resolvedVars]);
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const slugParts = [data?.name, data?.city, data?.state].filter(Boolean) as string[];
  const slug = slugParts.length ? toSlug(slugParts.join(" ")) : "your-studio";

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
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 rounded-lg border border-chrome-muted bg-ink-black-raised px-3 py-[5px] min-w-[320px] max-w-[480px] w-full">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 self-center text-chrome-subtle">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-none font-mono text-chrome-text-tertiary select-none">
              <span className="text-chrome-text-faint">https://</span>
              <span className="text-chrome-text-secondary">inkedmarket.com</span>
              <span className="text-chrome-text-dim">/studios/{slug}{previewPage === "policies" ? "/policies" : ""}</span>
            </span>
          </div>
        </div>

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

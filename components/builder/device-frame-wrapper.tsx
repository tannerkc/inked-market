"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { DevicePreview } from "@/lib/types/builder";

interface DeviceFrameWrapperProps {
  device: DevicePreview;
  children: React.ReactNode;
}

export function DeviceFrameWrapper({ device, children }: DeviceFrameWrapperProps) {
  if (device === "desktop") {
    return <div className="@container w-full">{children}</div>;
  }

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: "var(--chrome-surface)",
        backgroundImage: "radial-gradient(circle, var(--chrome-muted) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div
        className={cn(
          "@container mx-auto border border-chrome-border-hover transition-all duration-400 ease-in-out",
          "shadow-[0_8px_48px_rgba(0,0,0,0.7)]",
          device === "tablet" ? "max-w-[768px]" : "max-w-[390px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}

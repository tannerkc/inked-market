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
    return <>{children}</>;
  }

  return (
    <div className="min-h-full bg-[#080808]">
      <div
        className={cn(
          "mx-auto border-x border-[#222] shadow-lg transition-all duration-400 ease-in-out",
          device === "tablet" ? "max-w-[768px]" : "max-w-[390px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}

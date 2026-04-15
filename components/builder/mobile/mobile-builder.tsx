"use client";

import React, { useEffect } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { useOverlayContainer } from "@/lib/contexts/overlay-context";
import { syncCssVarsToElement } from "@/lib/utils/builder";
import { MobileSheetProvider } from "./mobile-sheet-orchestrator";
import { MobileTopBar } from "./mobile-top-bar";
import { MobilePreviewCanvas } from "./mobile-preview-canvas";
import { MobileMiniBar } from "./mobile-mini-bar";
import { MobileControlSheet } from "./mobile-control-sheet";

export function MobileBuilder() {
  const { resolvedVars } = useBuilder();
  const overlayEl = useOverlayContainer();

  useEffect(() => {
    if (overlayEl) syncCssVarsToElement(overlayEl, resolvedVars);
  }, [overlayEl, resolvedVars]);

  return (
    <MobileSheetProvider>
      <div className="flex h-full flex-col">
        <MobileTopBar />
        <div className="relative flex-1 overflow-hidden">
          <MobilePreviewCanvas />
          <MobileControlSheet />
        </div>
        <MobileMiniBar />
      </div>
    </MobileSheetProvider>
  );
}

"use client";

import { useState } from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { isValidIntegrationUrl } from "@/lib/utils/integration-helpers";
import type { IntegrationPlatformMeta, IntegrationMode } from "@/lib/types/integrations";

interface StudioLinkFlowPanelProps {
  open: boolean;
  onClose: () => void;
  platform: IntegrationPlatformMeta | null;
  mode: IntegrationMode | null;
  onSave: (url: string) => void;
}

export function StudioLinkFlowPanel({ open, onClose, platform, mode, onSave }: StudioLinkFlowPanelProps) {
  const { mode: themeMode } = useTheme();
  const isDark = themeMode === "dark";
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleClose() {
    setUrl("");
    setError("");
    onClose();
  }

  function handleSave() {
    if (!platform) return;
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (!isValidIntegrationUrl(platform.id, url.trim())) {
      setError(`Please enter a valid ${platform.name} URL`);
      return;
    }
    setError("");
    setUrl("");
    onSave(url.trim());
  }

  const modeLabel = mode === "import" ? "Import from" : "Integrate";
  const actionLabel = mode === "import"
    ? (platform?.importLabel ?? "Import data")
    : (platform?.integrateLabel ?? "Integrate");

  return (
    <SlideOverPanel open={open} onClose={handleClose} title={platform ? `${modeLabel} ${platform.name}` : "Connect Service"}>
      {platform && (
        <div className="space-y-6">
          <div>
            <p className={cn("text-[15px] font-semibold mb-1", isDark ? "text-ink-cream" : "text-ink-black")}>
              {platform.name}
            </p>
            <p className={cn("text-[12px]", isDark ? "text-ink-cream/40" : "text-ink-black/40")}>
              {actionLabel}
            </p>
          </div>

          <div>
            <Input
              label={`${platform.name} URL`}
              variant={isDark ? "dark" : "light"}
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder={platform.urlPlaceholder}
            />
            {error ? (
              <p className="text-[10px] text-ink-red mt-1.5 px-1">{error}</p>
            ) : (
              <p className={cn("text-[10px] mt-1.5 px-1", isDark ? "text-ink-cream/20" : "text-ink-black/20")}>
                Paste your {platform.name} page URL to connect
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <Button variant="ink" size="lg" className="w-full" onClick={handleSave}>
              Connect
            </Button>
            <Button variant={isDark ? "ink-light-outline" : "ink-outline"} size="lg" className="w-full" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </SlideOverPanel>
  );
}

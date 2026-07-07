"use client";

import { useState } from "react";
import { useStudio } from "@/lib/providers/studio-provider";
import { getPlatformsByCategory } from "@/lib/data/integration-platforms";
import {
  connectIntegration,
  disconnectIntegration,
  isValidIntegrationUrl,
} from "@/lib/utils/integration-helpers";
import { getBookingLink } from "@/lib/utils/studio-content";
import type { IntegrationPlatform } from "@/lib/types/integrations";
import { GroupSection } from "./group-section";
import { PANEL_SELECT_CLASS, useSavedFlash } from "./fields";

const BOOKING_PLATFORMS = getPlatformsByCategory("booking");

export function BookingGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const active = getBookingLink(studio?.integrations);

  const [platformId, setPlatformId] = useState<IntegrationPlatform>("other-booking");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const platform =
    BOOKING_PLATFORMS.find((p) => p.id === platformId) ??
    BOOKING_PLATFORMS[BOOKING_PLATFORMS.length - 1]!;

  const handleConnect = () => {
    if (!isValidIntegrationUrl(platform.id, url)) {
      setError(`That doesn't look like a ${platform.name} URL.`);
      return;
    }
    setError(null);
    void update(connectIntegration(studio?.integrations, platform.id, "integrate", url)).then(() => {
      setUrl("");
      flash();
    });
  };

  const handleDisconnect = () => {
    const connected = BOOKING_PLATFORMS.find(
      (p) => studio?.integrations?.[p.id]?.linkUrl === active?.url,
    );
    if (connected) {
      void update(disconnectIntegration(studio?.integrations, connected.id)).then(flash);
    }
  };

  return (
    <GroupSection id="booking" title="Booking Link" saved={saved} highlighted={highlighted}>
      {active ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-chrome-text-light">{active.platformName}</p>
            <p className="truncate text-[10px] text-chrome-text-dim">{active.url}</p>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="shrink-0 text-[10px] font-semibold text-chrome-text-dim transition-colors hover:text-ink-red"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] leading-relaxed text-chrome-text-dim">
            Your site&rsquo;s &ldquo;Book Now&rdquo; buttons point here. Without a link, they show
            your contact info instead.
          </p>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
              Platform
            </span>
            <select
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value as IntegrationPlatform)}
              className={PANEL_SELECT_CLASS}
            >
              {BOOKING_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
              Booking URL
            </span>
            <input
              type="url"
              value={url}
              placeholder={platform.urlPlaceholder}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5 text-xs text-chrome-text-primary placeholder-chrome-text-faint outline-none transition-colors focus:border-ink-red"
            />
          </label>
          {error ? (
            <p role="alert" className="text-[10px] font-medium text-ink-red">{error}</p>
          ) : null}
          <button
            type="button"
            onClick={handleConnect}
            disabled={url.length === 0}
            className="w-full rounded-lg border border-ink-red bg-ink-red/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-red transition-colors hover:bg-ink-red/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Connect Booking Link
          </button>
        </>
      )}
    </GroupSection>
  );
}

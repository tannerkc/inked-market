"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { GroupSection } from "./group-section";

export function ArtistsGroup({ highlighted }: { highlighted?: boolean }) {
  const { liveContent, requestLeave } = useBuilder();

  return (
    <GroupSection id="artists" title="Artists" highlighted={highlighted}>
      <p className="text-[11px] leading-relaxed text-chrome-text-dim">
        Your artist lineup comes from your roster &mdash; artists you add or approve
        appear here automatically with their portfolios.
      </p>
      {liveContent.artists.length > 0 ? (
        <p className="text-[11px] font-semibold text-chrome-text-light">
          {liveContent.artists.length} artist{liveContent.artists.length === 1 ? "" : "s"} on your roster
        </p>
      ) : (
        <p className="text-[11px] text-chrome-text-faint">No artists on your roster yet.</p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => requestLeave("/dashboard")}
          className="rounded-lg border border-chrome-border-hover px-3 py-2 text-[11px] font-semibold text-chrome-text-secondary transition-colors hover:border-chrome-text-dim hover:text-white"
        >
          Manage roster
        </button>
        <button
          type="button"
          onClick={liveContent.refresh}
          className="rounded-lg border border-chrome-border px-3 py-2 text-[11px] font-semibold text-chrome-text-dim transition-colors hover:text-chrome-text-secondary"
        >
          Refresh
        </button>
      </div>
    </GroupSection>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { INTEGRATION_PLATFORMS } from "@/lib/data/integration-platforms";

interface StudioIntegrationsCardProps {
  connectedCount: number;
  onOpen: () => void;
  notice?: string | null;
}

export function StudioIntegrationsCard({ connectedCount, onOpen, notice }: StudioIntegrationsCardProps) {
  const totalCount = INTEGRATION_PLATFORMS.length;

  return (
    <div className="rounded-[20px] border p-5 bg-ink-black/[0.02] border-ink-black/[0.06] dark:bg-ink-cream/[0.02] dark:border-ink-cream/[0.06]">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-black/35 dark:text-ink-cream/35">
        Integrations
      </p>

      {notice ? (
        <p
          role="status"
          className="rounded-[12px] border px-3 py-2 text-[10px] mb-3 border-ink-sage/20 bg-ink-sage/[0.06] text-ink-black/60 dark:text-ink-cream/60"
        >
          {notice}
        </p>
      ) : null}

      {/* Count */}
      <p className="text-[13px] font-medium mb-0.5 text-ink-black/70 dark:text-ink-cream/70">
        {connectedCount > 0 ? `${connectedCount} linked` : "No services linked"}
      </p>
      <p className="text-[10px] mb-4 text-ink-black/25 dark:text-ink-cream/25">
        {connectedCount > 0
          ? `${connectedCount} of ${totalCount} available integrations`
          : "Connect Google, Yelp, booking tools, and more"
        }
      </p>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full mb-4 bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]">
        <div
          className="h-full rounded-full bg-ink-sage/60 transition-all duration-500"
          style={{ width: `${Math.min((connectedCount / totalCount) * 100, 100)}%` }}
        />
      </div>

      <Button variant="ink-outline" size="sm" className="w-full" onClick={onOpen}>
        Manage Integrations
      </Button>
    </div>
  );
}

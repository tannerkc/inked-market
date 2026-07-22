"use client";

import { useEffect, useState } from "react";
import type { StudioData } from "@/lib/repositories";
import {
  countActiveIntegrations,
  connectIntegration,
  disconnectIntegration,
} from "@/lib/utils/integration-helpers";
import { getPlatformMeta } from "@/lib/data/integration-platforms";
import type {
  IntegrationPlatform,
  IntegrationPlatformMeta,
  IntegrationMode,
} from "@/lib/types/integrations";

const OAUTH_STATUS_MESSAGES: Record<string, string> = {
  connected: "Account linked.",
  denied: "Connection was cancelled on the provider's side.",
  error: "Connection failed — try again.",
  state_mismatch: "The connection attempt expired — try again.",
  not_configured: "This integration isn't configured yet — see docs/integrations-setup.md.",
  no_studio: "No claimed studio on this account.",
  unauthenticated: "Sign in as the studio owner to connect accounts.",
  unknown_platform: "Unknown integration.",
};

function noticeFromOAuthReturn(oauthReturn: { platform: string; status: string } | null): string | null {
  if (!oauthReturn) return null;
  const message = OAUTH_STATUS_MESSAGES[oauthReturn.status];
  if (!message) return null;
  const meta = getPlatformMeta(oauthReturn.platform as IntegrationPlatform);
  return `${meta?.name ?? oauthReturn.platform}: ${message}`;
}

export function useStudioIntegrations(
  studio: StudioData | null,
  update: (partial: Partial<StudioData>) => Promise<void>,
  oauthReturn: { platform: string; status: string } | null = null,
) {
  // Seeded from the OAuth redirect params the page resolved server-side — no
  // effects involved, so hydration and the set-state-in-effect rule stay happy.
  const [integrationsOpen, setIntegrationsOpen] = useState(
    () => Boolean(oauthReturn && oauthReturn.status !== "connected" && noticeFromOAuthReturn(oauthReturn)),
  );
  const [linkFlowOpen, setLinkFlowOpen] = useState(false);
  const [linkFlowPlatform, setLinkFlowPlatform] = useState<IntegrationPlatformMeta | null>(null);
  const [linkFlowMode, setLinkFlowMode] = useState<IntegrationMode | null>(null);
  const [importingPlatform, setImportingPlatform] = useState<IntegrationPlatform | null>(null);
  const [integrationNotice, setIntegrationNotice] = useState<string | null>(() =>
    noticeFromOAuthReturn(oauthReturn),
  );

  // Strip the one-shot params so a refresh doesn't replay the notice. Pure
  // external-system write — no React state is touched here.
  useEffect(() => {
    if (!oauthReturn) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("integration");
    url.searchParams.delete("status");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [oauthReturn]);

  const connectedCount = countActiveIntegrations(studio?.integrations);

  const handleConnect = (platformId: IntegrationPlatform, mode: IntegrationMode | "oauth") => {
    const meta = getPlatformMeta(platformId);
    if (!meta) return;
    if (mode === "oauth") {
      window.location.assign(`/api/integrations/${platformId}/connect`);
      return;
    }
    setLinkFlowPlatform(meta);
    setLinkFlowMode(mode);
    setLinkFlowOpen(true);
  };

  const handleSaveConnection = (url: string) => {
    if (!linkFlowPlatform || !linkFlowMode) return;
    // No fabricated import stats: importedCount is only ever written by real
    // OAuth imports (/api/integrations/[platform]/import).
    update(connectIntegration(studio?.integrations, linkFlowPlatform.id, linkFlowMode, url));
    setLinkFlowOpen(false);
    setLinkFlowPlatform(null);
    setLinkFlowMode(null);
  };

  const handleDisconnect = (platformId: IntegrationPlatform) => {
    const meta = getPlatformMeta(platformId);
    // OAuth connections also hold server-side tokens — revoke + delete those.
    if (meta?.oauth && studio?.integrations?.[platformId]?.accountName) {
      void fetch(`/api/integrations/${platformId}/disconnect`, { method: "POST" }).finally(() =>
        window.location.reload(),
      );
      return;
    }
    update(disconnectIntegration(studio?.integrations, platformId));
  };

  const handleImport = (platformId: IntegrationPlatform) => {
    setImportingPlatform(platformId);
    void fetch(`/api/integrations/${platformId}/import`, { method: "POST" })
      .then(async (res) => {
        const body = (await res.json()) as { error?: string; count?: number; label?: string };
        if (!res.ok) {
          setIntegrationNotice(body.error ?? "Import failed — try again.");
          setImportingPlatform(null);
          return;
        }
        // Server wrote studio data the client can't see — reload for truth.
        window.location.reload();
      })
      .catch(() => {
        setIntegrationNotice("Import failed — try again.");
        setImportingPlatform(null);
      });
  };

  return {
    integrationsOpen,
    setIntegrationsOpen,
    linkFlowOpen,
    setLinkFlowOpen,
    linkFlowPlatform,
    linkFlowMode,
    connectedCount,
    integrationNotice,
    importingPlatform,
    handleConnect,
    handleSaveConnection,
    handleDisconnect,
    handleImport,
  };
}

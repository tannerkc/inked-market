"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import { PoliciesTabsLayout } from "@/components/policies/policies-tabs-layout";
import { PoliciesSidebarLayout } from "@/components/policies/policies-sidebar-layout";

export function PoliciesPagePreview() {
  const { config, setPreviewPage, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const studioName = data?.name || "Your Studio";
  const policies = (config.policies ?? []).filter((p) => p.enabled);
  const layout = config.policiesPageLayout ?? "tabs";

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Nav */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          onClick={() => setPreviewPage("studio")}
          style={{
            color: "var(--accent)",
            fontSize: "12px",
            cursor: "pointer",
            background: "none",
            border: "none",
            font: "inherit",
          }}
        >
          &larr; {studioName}
        </button>
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Policies
        </span>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: "22px",
              color: "var(--text-primary)",
              fontWeight: 600,
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Studio Policies
          </h1>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Last updated April 2026
          </div>
        </div>

        {policies.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 16px",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            No policies enabled. Toggle them on in the Policies tab.
          </div>
        ) : layout === "sidebar" ? (
          <PoliciesSidebarLayout policies={policies} />
        ) : (
          <PoliciesTabsLayout policies={policies} />
        )}
      </div>
    </div>
  );
}

PoliciesPagePreview.displayName = "PoliciesPagePreview";

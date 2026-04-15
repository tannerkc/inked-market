import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getStudio } from "@/lib/data/shops";
import { PoliciesPageClient } from "./policies-client";
import { createDefaultPolicies } from "@/lib/data/policy-templates";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const studio = getStudio(id);
  if (!studio) return { title: "Policies | Inked Market" };
  return {
    title: `Policies — ${studio.name} | Inked Market`,
    description: `Studio policies for ${studio.name}`,
  };
}

export default async function PoliciesPage({ params }: PageProps) {
  const { id } = await params;
  const studio = getStudio(id);
  if (!studio) notFound();

  // In production, policies would come from the studio's saved config.
  // For now, use default policies as mock data.
  const policies = createDefaultPolicies().filter((p) => p.enabled);
  const pageLayout = "tabs" as const;

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "var(--body-font, system-ui)",
        color: "var(--text-primary, #f0f0f0)",
        backgroundColor: "var(--bg-primary, #0f0f14)",
      }}
    >
      {/* Nav */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border, #1a1a24)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href={`/studios/${id}`}
          style={{
            color: "var(--accent, #8b7cf7)",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          &larr; {studio.name}
        </Link>
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted, #555)",
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
              fontSize: "22px",
              color: "var(--text-primary, #f0f0f0)",
              fontWeight: 600,
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Studio Policies
          </h1>
          <div style={{ fontSize: "12px", color: "var(--text-muted, #555)" }}>
            Last updated April 2026
          </div>
        </div>

        <PoliciesPageClient policies={policies} layout={pageLayout} />
      </div>
    </div>
  );
}

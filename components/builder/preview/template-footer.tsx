"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import type { FooterLayout } from "@/lib/types/builder";
import {
  standardPolicies,
  standardPolicyOrder,
} from "@/lib/data/policy-templates";
import type { PolicyConfig, StandardPolicyId } from "@/lib/types/policies";

function useStudioName() {
  const { studio } = useBuilder();
  return studio?.name || MOCK_STUDIO_DATA.name;
}

function useCurrentYear() {
  return new Date().getFullYear();
}

function usePolicyChips(): string[] {
  const { config } = useBuilder();
  if (config.policiesDisplayMode !== "footer") return [];

  const policies = config.policies ?? [];
  const labels: string[] = [];

  for (const id of standardPolicyOrder) {
    const policy = policies.find((p) => p.id === id);
    if (!policy?.enabled || !policy.featured) continue;

    const def = standardPolicies[id as StandardPolicyId];
    if (!def || def.structuredFields.length === 0) continue;

    const fields = policy.structuredFields ?? {};
    const value = def.cardValueTemplate?.(fields) ?? "";
    if (!value) continue;

    labels.push(`${value} ${def.cardLabel.toLowerCase()}`);
  }

  for (const policy of policies) {
    if (policy.type !== "custom" || !policy.enabled || !policy.featured) continue;
    if (policy.featuredSummary) labels.push(policy.featuredSummary);
  }

  return labels;
}

function useShowPoliciesLink(): boolean {
  const { config } = useBuilder();
  const policies = config.policies ?? [];
  return (config.showPoliciesSection ?? true) && policies.some((p) => p.enabled);
}

// ─── Scroll to section ──────────────────────────────────────────────────────

const sectionMap: Record<string, string> = {
  Portfolio: "gallery",
  Artists: "artist-strips",
  About: "about",
  Visit: "footer-cta",
  Booking: "footer-cta",
  Consultations: "footer-cta",
};

const policyLinks = new Set(["Aftercare", "Privacy", "Terms"]);

function scrollToSection(label: string) {
  const sectionName = sectionMap[label];
  if (!sectionName) return;
  const root = document.querySelector("[data-builder-root]");
  if (!root) return;
  const el = root.querySelector(`[data-section="${sectionName}"]`);
  if (!el) return;
  const scrollContainer = root.closest("[class*='overflow-y-auto']") ?? root.parentElement;
  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    scrollContainer.scrollBy({
      top: elRect.top - containerRect.top,
      behavior: "smooth",
    });
  }
}

// ─── Shared components ──────────────────────────────────────────────────────

function SocialIcons({ className }: { className?: string }) {
  return (
    <div className={className} style={{ display: "flex", gap: "16px" }}>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }}>&#9673;</span>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }}>&#10005;</span>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }}>&#9678;</span>
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  const { setPreviewPage } = useBuilder();

  const handleClick = () => {
    if (policyLinks.has(label)) {
      setPreviewPage("policies");
    } else {
      scrollToSection(label);
    }
  };

  return (
    <span
      style={{
        fontSize: "13px",
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "color 0.2s",
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.color = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.color = "var(--text-secondary)";
      }}
    >
      {label}
    </span>
  );
}

function PolicyChipsRow() {
  const { config } = useBuilder();
  const chips = usePolicyChips();
  if (chips.length === 0) return null;

  const tagStyle = config.tagStyle;
  const radius = tagStyle === "square" ? "4px" : "20px";
  const border = tagStyle === "outline"
    ? "1px solid color-mix(in srgb, var(--accent) 30%, transparent)"
    : "1px solid color-mix(in srgb, var(--accent) 15%, transparent)";
  const bg = tagStyle === "outline"
    ? "transparent"
    : "color-mix(in srgb, var(--accent) 8%, transparent)";

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "16px",
        marginBottom: "16px",
        display: "flex",
        gap: "6px",
        overflowX: "auto",
        flexWrap: "nowrap",
        scrollbarWidth: "none",
      }}
    >
      {chips.map((chip) => (
        <div
          key={chip}
          style={{
            background: bg,
            border,
            borderRadius: radius,
            padding: "5px 12px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "var(--accent)",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {chip}
          </span>
        </div>
      ))}
    </div>
  );
}

function PoliciesBottomBarLink() {
  const { setPreviewPage } = useBuilder();
  const show = useShowPoliciesLink();
  if (!show) return null;

  return (
    <>
      <span>&middot;</span>
      <button
        type="button"
        onClick={() => setPreviewPage("policies")}
        style={{
          cursor: "pointer",
          color: "var(--accent)",
          background: "none",
          border: "none",
          font: "inherit",
          fontSize: "inherit",
        }}
      >
        All Policies &rarr;
      </button>
    </>
  );
}

// ─── Footer layouts ─────────────────────────────────────────────────────────

const linkGroups = [
  {
    heading: "Studio",
    links: ["Portfolio", "Artists", "About", "Visit"],
  },
  {
    heading: "Services",
    links: ["Booking", "Consultations", "Aftercare"],
  },
  {
    heading: "Connect",
    links: ["Instagram", "Facebook", "Email", "Phone"],
  },
];

const navLinks = ["Portfolio", "Artists", "About"];

function ColumnsFooter() {
  const studioName = useStudioName();
  const year = useCurrentYear();
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "var(--bg-raised)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: "1350px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Top row: studio name + social */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: "20px",
              color: "var(--text-primary)",
            }}
          >
            {studioName}
          </span>
          <SocialIcons />
        </div>

        {/* Link columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
          }}
        >
          {linkGroups.map((group) => (
            <div key={group.heading}>
              <div
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                }}
              >
                {group.heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {group.links.map((link) => (
                  <FooterLink key={link} label={link} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Policy chips */}
        <PolicyChipsRow />

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "20px",
            marginTop: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            &copy; {year} {studioName} Studio
          </span>
          <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-muted)", alignItems: "center" }}>
            <FooterLink label="Privacy" />
            <span>&middot;</span>
            <FooterLink label="Terms" />
            <PoliciesBottomBarLink />
          </div>
        </div>
      </div>
    </footer>
  );
}

function MinimalBarFooter() {
  const studioName = useStudioName();
  const year = useCurrentYear();
  return (
    <footer
      className="w-full border-t"
      style={{
        backgroundColor: "var(--bg-raised)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-[1350px] flex-col items-center gap-3 px-6 py-4 @md:flex-row @md:justify-between @md:gap-0 @md:px-10 @md:py-5">
        {/* Social -- top on mobile, right on @md */}
        <div
          className="order-first @md:order-last"
          style={{ display: "flex", gap: "16px", color: "var(--text-muted)" }}
        >
          <span style={{ cursor: "pointer" }}>&#9673;</span>
          <span style={{ cursor: "pointer" }}>&#10005;</span>
          <span style={{ cursor: "pointer" }}>&#9678;</span>
        </div>

        {/* Nav links -- centered on mobile, center on @md */}
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-1 @md:gap-x-1"
          style={{ fontSize: "12px", color: "var(--text-secondary)" }}
        >
          {navLinks.map((link, i) => (
            <span key={link} className="flex items-center">
              {i > 0 && (
                <span
                  className="hidden @md:inline mr-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  &middot;
                </span>
              )}
              <span
                style={{ cursor: "pointer", transition: "color 0.2s" }}
                onClick={() => scrollToSection(link)}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {link}
              </span>
            </span>
          ))}
        </div>

        {/* Copyright -- bottom on mobile, left on @md */}
        <span
          className="order-last @md:order-first"
          style={{ fontSize: "12px", color: "var(--text-muted)" }}
        >
          &copy; {year} {studioName}
        </span>
      </div>

      {/* Policy chips row (below the bar) */}
      <div className="mx-auto max-w-[1350px] px-6 @md:px-10">
        <PolicyChipsRow />
      </div>
    </footer>
  );
}

function CenteredFooter() {
  const studioName = useStudioName();
  const year = useCurrentYear();
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "var(--bg-raised)",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "1350px", margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{
            fontFamily: "var(--heading-font)",
            fontSize: "20px",
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
        >
          {studioName}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "16px",
          }}
        >
          {navLinks.map((link) => (
            <span
              key={link}
              style={{ cursor: "pointer", transition: "color 0.2s" }}
              onClick={() => scrollToSection(link)}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "var(--text-secondary)";
              }}
            >
              {link}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            color: "var(--text-muted)",
            marginBottom: "24px",
          }}
        >
          <span style={{ cursor: "pointer" }}>&#9673;</span>
          <span style={{ cursor: "pointer" }}>&#10005;</span>
          <span style={{ cursor: "pointer" }}>&#9678;</span>
        </div>

        {/* Policy chips centered */}
        <PolicyChipsRow />

        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          &copy; {year} {studioName} Studio
        </div>
      </div>
    </footer>
  );
}

const footerComponents: Record<Exclude<FooterLayout, "none">, React.FC> = {
  columns: ColumnsFooter,
  "minimal-bar": MinimalBarFooter,
  centered: CenteredFooter,
};

export function TemplateFooter() {
  const { config } = useBuilder();

  if (!config.footerLayout || config.footerLayout === "none") return null;

  const FooterComponent = footerComponents[config.footerLayout];
  if (!FooterComponent) return null;

  return (
    <div style={{ transition: "all 500ms ease" }}>
      <FooterComponent />
    </div>
  );
}

TemplateFooter.displayName = "TemplateFooter";

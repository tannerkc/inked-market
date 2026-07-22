"use client";

import { useStudioSite } from "@/components/studio-site/studio-site-context";
import { PromptChip } from "@/components/studio-site/empty-states";
import { scrollToBuilderSection } from "@/lib/utils/scroll-to-section";
import { resolveSocialLinks, socialUrl, telHref, mailtoHref } from "@/lib/utils/external-links";
import type { FooterLayout } from "@/lib/types/builder";
import {
  standardPolicies,
  standardPolicyOrder,
} from "@/lib/data/policy-templates";
import type { StandardPolicyId } from "@/lib/types/policies";

function useStudioName() {
  const { data } = useStudioSite();
  return data.name;
}

function useCurrentYear() {
  return new Date().getFullYear();
}

function usePolicyChips(): string[] {
  const { config } = useStudioSite();
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
  const { config } = useStudioSite();
  const policies = config.policies ?? [];
  return (config.showPoliciesSection ?? true) && policies.some((p) => p.enabled);
}

// ─── Scroll to section ──────────────────────────────────────────────────────

/** Footer label → data-section ids (first that exists wins). */
const LABEL_SECTIONS: Record<string, string[]> = {
  Portfolio: ["gallery", "artist-strips"],
  Artists: ["artist-strips"],
  About: ["about"],
  Visit: ["footer-cta"],
  Booking: ["details"],
  Consultations: ["footer-cta"],
};

const policyLinks = new Set(["Aftercare", "Privacy", "Terms"]);

function scrollToLabel(label: string) {
  const targets = LABEL_SECTIONS[label];
  if (targets) scrollToBuilderSection(...targets);
}

// ─── Shared components ──────────────────────────────────────────────────────

const SOCIAL_ICON_PATHS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path d="M15 3c.4 2.3 1.9 3.8 4.2 4v3.2c-1.6 0-3-.5-4.2-1.4v6.5A5.7 5.7 0 1 1 9.3 9.6v3.3a2.5 2.5 0 1 0 2.5 2.5V3H15z" />
  ),
  facebook: (
    <path d="M14 8h2.5V4.5H14c-2.5 0-4 1.6-4 4V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3v-2c0-.6.4-1 1-1z" />
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
  x: <path d="M5 5l14 14M19 5L5 19" />,
};

/** Real social links only. Empty → builder shows an add-prompt; public shows nothing. */
function SocialIcons({ className }: { className?: string }) {
  const { data } = useStudioSite();
  const links = resolveSocialLinks(data);
  if (links.length === 0) {
    return (
      <span className={className}>
        <PromptChip group="socials" label="Add social links" />
      </span>
    );
  }
  return (
    <div className={className} style={{ display: "flex", gap: "14px" }}>
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {SOCIAL_ICON_PATHS[l.key]}
          </svg>
        </a>
      ))}
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  const { onNavigatePage } = useStudioSite();

  const handleClick = () => {
    if (policyLinks.has(label)) {
      onNavigatePage("policies");
    } else {
      scrollToLabel(label);
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
  const { config } = useStudioSite();
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
  const { onNavigatePage } = useStudioSite();
  const show = useShowPoliciesLink();
  if (!show) return null;

  return (
    <>
      <span>&middot;</span>
      <button
        type="button"
        onClick={() => onNavigatePage("policies")}
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

/** Section links are static anchors; the Connect column holds only real destinations. */
function useConnectLinks(): { label: string; href: string; external: boolean }[] {
  const { data } = useStudioSite();
  const connect: { label: string; href: string; external: boolean }[] = [];
  const instagram = socialUrl("instagram", data.instagram);
  const facebook = socialUrl("facebook", data.facebook);
  if (instagram) connect.push({ label: "Instagram", href: instagram, external: true });
  if (facebook) connect.push({ label: "Facebook", href: facebook, external: true });
  if (data.email) connect.push({ label: "Email", href: mailtoHref(data.email), external: false });
  if (data.phone) connect.push({ label: "Phone", href: telHref(data.phone), external: false });
  return connect;
}

const SECTION_LINK_GROUPS = [
  {
    heading: "Studio",
    links: ["Portfolio", "Artists", "About", "Visit"],
  },
  {
    heading: "Services",
    links: ["Booking", "Consultations", "Aftercare"],
  },
];

const navLinks = ["Portfolio", "Artists", "About"];

function ColumnsFooter() {
  const studioName = useStudioName();
  const year = useCurrentYear();
  const connectLinks = useConnectLinks();
  const columnCount = SECTION_LINK_GROUPS.length + (connectLinks.length > 0 ? 1 : 0);
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

        {/* Link columns — Connect renders only when real destinations exist */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            gap: "32px",
          }}
        >
          {SECTION_LINK_GROUPS.map((group) => (
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
          {connectLinks.length > 0 ? (
            <div>
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
                Connect
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {connectLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
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
        <SocialIcons className="order-first @md:order-last" />

        {/* Nav links -- centered on mobile, center on @md */}
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-1 @md:gap-x-1"
          style={{ fontSize: "12px", color: "var(--text-secondary)" }}
        >
          {navLinks.map((link, i) => (
            <span key={link} className="flex items-center">
              {i > 0 ? <span
                  className="hidden @md:inline mr-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  &middot;
                </span> : null}
              <span
                style={{ cursor: "pointer", transition: "color 0.2s" }}
                onClick={() => scrollToLabel(link)}
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
              onClick={() => scrollToLabel(link)}
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

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <SocialIcons />
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
  const { config } = useStudioSite();

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

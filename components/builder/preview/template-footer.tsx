"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import type { FooterLayout } from "@/lib/types/builder";

const linkGroups = [
  {
    heading: "Studio",
    links: ["Portfolio", "Artists", "About", "Visit"],
  },
  {
    heading: "Services",
    links: ["Booking", "Consultations", "Gift Cards", "Aftercare"],
  },
  {
    heading: "Connect",
    links: ["Instagram", "Facebook", "Email", "Phone"],
  },
];

const navLinks = ["Portfolio", "Artists", "About", "Contact"];

function SocialIcons({ className }: { className?: string }) {
  return (
    <div className={className} style={{ display: "flex", gap: "16px" }}>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }}>◉</span>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }}>✕</span>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }}>◎</span>
    </div>
  );
}

function ColumnsFooter() {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "var(--bg-raised)",
        borderTop: "1px solid var(--border)",
        padding: "40px 48px",
      }}
    >
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
          Iron &amp; Ink
        </span>
        <SocialIcons className="" />
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
                <span
                  key={link}
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  {link}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

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
          © 2025 Iron &amp; Ink Studio
        </span>
        <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
          <span style={{ cursor: "pointer" }}>Privacy</span>
          <span>·</span>
          <span style={{ cursor: "pointer" }}>Terms</span>
        </div>
      </div>
    </footer>
  );
}

function MinimalBarFooter() {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "var(--bg-raised)",
        borderTop: "1px solid var(--border)",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        © 2025 Iron &amp; Ink
      </span>
      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
        {navLinks.map((link, i) => (
          <span key={link}>
            {i > 0 && <span style={{ marginRight: "16px", color: "var(--text-muted)" }}>·</span>}
            <span
              style={{ cursor: "pointer", transition: "color 0.2s" }}
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
      <div style={{ display: "flex", gap: "16px", color: "var(--text-muted)" }}>
        <span style={{ cursor: "pointer" }}>◉</span>
        <span style={{ cursor: "pointer" }}>✕</span>
        <span style={{ cursor: "pointer" }}>◎</span>
      </div>
    </footer>
  );
}

function CenteredFooter() {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "var(--bg-raised)",
        borderTop: "1px solid var(--border)",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--heading-font)",
          fontSize: "20px",
          color: "var(--text-primary)",
          marginBottom: "16px",
        }}
      >
        Iron &amp; Ink
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
        <span style={{ cursor: "pointer" }}>◉</span>
        <span style={{ cursor: "pointer" }}>✕</span>
        <span style={{ cursor: "pointer" }}>◎</span>
      </div>

      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        © 2025 Iron &amp; Ink Studio
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

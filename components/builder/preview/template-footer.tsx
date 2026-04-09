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
      </div>
    </footer>
  );
}

function MinimalBarFooter() {
  return (
    <footer
      className="w-full border-t"
      style={{
        backgroundColor: "var(--bg-raised)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-[1350px] flex-col items-center gap-3 px-6 py-4 @md:flex-row @md:justify-between @md:gap-0 @md:px-10 @md:py-5">
      {/* Social — top on mobile, right on @md */}
      <div
        className="order-first @md:order-last"
        style={{ display: "flex", gap: "16px", color: "var(--text-muted)" }}
      >
        <span style={{ cursor: "pointer" }}>◉</span>
        <span style={{ cursor: "pointer" }}>✕</span>
        <span style={{ cursor: "pointer" }}>◎</span>
      </div>

      {/* Nav links — centered on mobile, center on @md */}
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
                ·
              </span>
            )}
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

      {/* Copyright — bottom on mobile, left on @md */}
      <span
        className="order-last @md:order-first"
        style={{ fontSize: "12px", color: "var(--text-muted)" }}
      >
        © 2025 Iron &amp; Ink
      </span>
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

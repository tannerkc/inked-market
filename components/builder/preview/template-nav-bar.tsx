"use client";

import { useEffect, useRef, useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import type { NavLayout, CtaStyle, MobileMenuType } from "@/lib/types/builder";

/* ------------------------------------------------------------------ */
/*  Hero-passed hook                                                    */
/* ------------------------------------------------------------------ */
function useHeroPassed(navRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPast(false);
      return;
    }

    const nav = navRef.current;
    if (!nav) return;

    const root = nav.closest<HTMLElement>("[data-builder-root]");
    const hero = root?.querySelector<HTMLElement>(
      "[data-builder-section='hero'], [data-section='hero']",
    );
    if (!root || !hero) return;

    let scrollRoot: HTMLElement | null = root.parentElement;
    while (scrollRoot && getComputedStyle(scrollRoot).overflowY !== "auto") {
      scrollRoot = scrollRoot.parentElement;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting),
      { root: scrollRoot, threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [navRef, enabled]);

  return past;
}

/* ------------------------------------------------------------------ */
/*  Layout-specific container style                                     */
/* ------------------------------------------------------------------ */
function navContainerStyle(layout: NavLayout): React.CSSProperties {
  if (layout === "logo-center") {
    return { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "16px" };
  }
  // standard, minimal, centered — centered manages its own internal layout
  return { display: "flex", justifyContent: "space-between", alignItems: "center" };
}

/* ------------------------------------------------------------------ */
/*  Shared atoms                                                        */
/* ------------------------------------------------------------------ */
function BrandMark() {
  const { config, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const showLogo = config.logoUrl && config.logoPlacement === "nav";

  if (showLogo) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={config.logoUrl}
        alt="Studio logo"
        style={{ height: "28px", width: "auto", objectFit: "contain" }}
      />
    );
  }

  return (
    <span
      style={{
        fontFamily: "var(--heading-font)",
        fontSize: "18px",
        fontWeight: 700,
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
      }}
    >
      {data?.name ?? ""}
    </span>
  );
}

function NavLinks({ className }: { className?: string }) {
  return (
    <div className={className} style={{ gap: "28px" }}>
      {["Portfolio", "Artists", "About", "Contact"].map((link) => (
        <span
          key={link}
          style={{
            fontFamily: "var(--body-font)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "color 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {link}
        </span>
      ))}
    </div>
  );
}

const CTA_STYLE_VARS: Record<CtaStyle, React.CSSProperties> = {
  filled: { background: "var(--accent)", color: "var(--accent-text)", border: "none", borderRadius: "8px" },
  outline: { background: "transparent", color: "var(--accent)", border: "2px solid var(--accent)", borderRadius: "8px" },
  pill: { background: "var(--accent)", color: "var(--accent-text)", border: "none", borderRadius: "999px" },
};

function CtaButton({ className }: { className?: string }) {
  const { config } = useBuilder();
  const variant = CTA_STYLE_VARS[config.ctaStyle ?? "filled"];
  return (
    <button
      type="button"
      className={className}
      style={{
        fontFamily: "var(--body-font)",
        fontSize: "13px",
        fontWeight: 600,
        padding: "8px 20px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        ...variant,
      }}
    >
      Book Now
    </button>
  );
}

function HamburgerButton({
  menuOpen,
  onMenuToggle,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="block @md:hidden"
      onClick={onMenuToggle}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        color: "var(--text-primary)",
        lineHeight: 0,
      }}
      aria-label={menuOpen ? "Close menu" : "Open menu"}
    >
      {menuOpen ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout-specific content                                             */
/* ------------------------------------------------------------------ */
function StandardContent({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  return (
    <>
      <BrandMark />
      <NavLinks className="hidden @md:flex" />
      <div className="flex items-center gap-3">
        <CtaButton className="hidden @md:block" />
        <HamburgerButton menuOpen={menuOpen} onMenuToggle={onMenuToggle} />
      </div>
    </>
  );
}

function LogoCenterContent({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  return (
    <>
      {/* Left: Nav links */}
      <NavLinks className="hidden @md:flex" />
      {/* Center: Brand */}
      <BrandMark />
      {/* Right: CTA + hamburger */}
      <div className="flex items-center justify-end gap-3">
        <CtaButton className="hidden @md:block" />
        <HamburgerButton menuOpen={menuOpen} onMenuToggle={onMenuToggle} />
      </div>
    </>
  );
}

function CenteredContent({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  return (
    <div style={{ width: "100%" }}>
      {/* Desktop: two-row centered — brand on top, links + CTA below */}
      <div
        className="hidden @md:flex"
        style={{ flexDirection: "column", alignItems: "center", gap: "6px" }}
      >
        <BrandMark />
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <NavLinks className="flex" />
          <CtaButton />
        </div>
      </div>
      {/* Mobile: logo left, hamburger right */}
      <div
        className="flex @md:hidden"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <BrandMark />
        <HamburgerButton menuOpen={menuOpen} onMenuToggle={onMenuToggle} />
      </div>
    </div>
  );
}

function MinimalContent() {
  // No nav links, no hamburger — CTA always visible
  return (
    <>
      <BrandMark />
      <CtaButton />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile menu variants                                               */
/* ------------------------------------------------------------------ */
const MOBILE_LINKS = ["Portfolio", "Artists", "About", "Contact"];

function DropdownMenu() {
  const { config } = useBuilder();
  const variant = CTA_STYLE_VARS[config.ctaStyle ?? "filled"];

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        borderTop: "1px solid var(--border)",
        padding: "8px 0 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
        {MOBILE_LINKS.map((link) => (
          <div
            key={link}
            style={{
              padding: "12px 24px",
              fontFamily: "var(--body-font)",
              fontSize: "14px",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {link}
          </div>
        ))}
        <div style={{ padding: "8px 24px 0" }}>
          <button
            type="button"
            style={{
              width: "100%",
              fontFamily: "var(--body-font)",
              fontSize: "14px",
              fontWeight: 600,
              padding: "11px 20px",
              cursor: "pointer",
              textAlign: "center",
              ...variant,
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function FullscreenMenu({ onClose }: { onClose: () => void }) {
  const { config, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const variant = CTA_STYLE_VARS[config.ctaStyle ?? "filled"];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "var(--bg-deep)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--heading-font)",
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {data?.name ?? ""}
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            lineHeight: 0,
            padding: "4px",
          }}
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Centered links */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {MOBILE_LINKS.map((link) => (
          <div
            key={link}
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px 0",
              transition: "color 0.15s",
            }}
          >
            {link}
          </div>
        ))}
        <button
          type="button"
          style={{
            marginTop: "24px",
            fontFamily: "var(--body-font)",
            fontSize: "14px",
            fontWeight: 600,
            padding: "12px 40px",
            cursor: "pointer",
            ...variant,
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

function DrawerMenu({ onClose }: { onClose: () => void }) {
  const { config, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const variant = CTA_STYLE_VARS[config.ctaStyle ?? "filled"];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          cursor: "pointer",
        }}
      />
      {/* Drawer panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "75%",
          maxWidth: "280px",
          height: "100%",
          backgroundColor: "var(--bg-primary)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {data?.name ?? ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              lineHeight: 0,
              padding: "4px",
            }}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div style={{ flex: 1, padding: "8px 0" }}>
          {MOBILE_LINKS.map((link) => (
            <div
              key={link}
              style={{
                padding: "13px 20px",
                fontFamily: "var(--body-font)",
                fontSize: "15px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {link}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "16px 20px" }}>
          <button
            type="button"
            style={{
              width: "100%",
              fontFamily: "var(--body-font)",
              fontSize: "14px",
              fontWeight: 600,
              padding: "11px 20px",
              cursor: "pointer",
              textAlign: "center",
              ...variant,
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ type, onClose }: { type: MobileMenuType; onClose: () => void }) {
  if (type === "fullscreen") return <FullscreenMenu onClose={onClose} />;
  if (type === "drawer")     return <DrawerMenu onClose={onClose} />;
  return <DropdownMenu />;
}

/* ------------------------------------------------------------------ */
/*  Exported nav bar                                                    */
/* ------------------------------------------------------------------ */
export function TemplateNavBar() {
  const { config } = useBuilder();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const layout: NavLayout = config.navLayout ?? "standard";
  const isReveal = config.navStyle === "reveal";
  const isFloating = config.navStyle === "floating";
  const heroPassed = useHeroPassed(wrapperRef, isReveal);
  const isMinimal = layout === "minimal";

  const toggleMenu = () => setMenuOpen((v) => !v);

  // Close mobile menu when container expands past the @md breakpoint
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width >= 768) setMenuOpen(false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (config.navStyle === "none") return null;

  const navOuterStyle: React.CSSProperties = {
    background: isFloating || isReveal
      ? "color-mix(in srgb, var(--bg-primary) 90%, transparent)"
      : "var(--bg-primary)",
    borderBottom: "1px solid var(--border)",
    backdropFilter: isFloating || isReveal ? "blur(16px)" : undefined,
    WebkitBackdropFilter: isFloating || isReveal ? "blur(16px)" : undefined,
    boxShadow: (isFloating || heroPassed) ? "0 1px 8px rgba(0,0,0,0.12)" : "none",
    transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
  };

  const navInnerStyle: React.CSSProperties = {
    ...navContainerStyle(layout),
    maxWidth: "1350px",
    margin: "0 auto",
    padding: "16px 24px",
    width: "100%",
  };

  const navContent =
    layout === "logo-center" ? <LogoCenterContent menuOpen={menuOpen} onMenuToggle={toggleMenu} /> :
    layout === "centered"    ? <CenteredContent menuOpen={menuOpen} onMenuToggle={toggleMenu} /> :
    layout === "minimal"     ? <MinimalContent /> :
                               <StandardContent menuOpen={menuOpen} onMenuToggle={toggleMenu} />;

  // Mobile menu only shown for layouts that have nav links
  const showMobileMenu = menuOpen && !isMinimal;
  const mobileMenuType: MobileMenuType = config.mobileMenuType ?? "dropdown";
  const isOverlay = mobileMenuType !== "dropdown";

  const menuWrapperStyle: React.CSSProperties = isOverlay
    ? { position: "absolute", top: 0, left: 0, right: 0, minHeight: "100vh", zIndex: 100 }
    : { position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50 };

  if (isReveal) {
    return (
      <div
        ref={wrapperRef}
        style={{ position: "sticky", top: 0, zIndex: 10, height: 0, clipPath: "inset(0 0 -100vh 0)" }}
      >
        <div style={{ position: "relative" }}>
          <nav
            style={{
              ...navOuterStyle,
              transform: heroPassed ? "translateY(0)" : "translateY(-100%)",
              transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s",
            }}
          >
            <div style={navInnerStyle}>{navContent}</div>
          </nav>
          {showMobileMenu && heroPassed && (
            <div style={menuWrapperStyle}>
              <MobileMenu type={mobileMenuType} onClose={() => setMenuOpen(false)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={isFloating
        ? { position: "sticky", top: 0, zIndex: 10 }
        : { position: "relative" }}
    >
      <nav style={navOuterStyle}>
        <div style={navInnerStyle}>{navContent}</div>
      </nav>
      {showMobileMenu && (
        <div style={menuWrapperStyle}>
          <MobileMenu type={mobileMenuType} onClose={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}

TemplateNavBar.displayName = "TemplateNavBar";

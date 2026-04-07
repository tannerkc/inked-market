"use client";

import { useEffect, useRef, useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";

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
    const hero = root?.querySelector<HTMLElement>("[data-builder-section='hero']");
    if (!root || !hero) return;

    // The scroll container is the overflow-y-auto ancestor above the root
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
/*  Shared nav bar markup                                             */
/* ------------------------------------------------------------------ */
function NavBarContent() {
  return (
    <>
      {/* Studio name */}
      <span
        style={{
          fontFamily: "var(--heading-font)",
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
        }}
      >
        Iron &amp; Ink
      </span>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "28px" }}>
        {["Portfolio", "Artists", "About", "Contact"].map((link) => (
          <span
            key={link}
            style={{
              fontFamily: "var(--body-font)",
              fontSize: "13px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {link}
          </span>
        ))}
      </div>

      {/* CTA button */}
      <button
        type="button"
        style={{
          fontFamily: "var(--body-font)",
          fontSize: "13px",
          fontWeight: 600,
          color: "#fff",
          background: "var(--accent)",
          border: "none",
          borderRadius: "8px",
          padding: "8px 20px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Book Now
      </button>
    </>
  );
}

export function TemplateNavBar() {
  const { config } = useBuilder();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isReveal = config.navStyle === "reveal";
  const isFloating = config.navStyle === "floating";
  const heroPassed = useHeroPassed(wrapperRef, isReveal);

  if (config.navStyle === "none") return null;

  if (isReveal) {
    return (
      <div
        ref={wrapperRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          // Zero height so it doesn't push content down
          height: 0,
          // Clip the hidden nav above — only reveal downward
          clipPath: "inset(0 0 -100vh 0)",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 40px",
            background: "color-mix(in srgb, var(--bg-primary) 90%, transparent)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: heroPassed ? "0 1px 8px rgba(0,0,0,0.12)" : "none",
            transform: heroPassed ? "translateY(0)" : "translateY(-100%)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s",
          }}
        >
          <NavBarContent />
        </nav>
      </div>
    );
  }

  return (
    <nav
      ref={wrapperRef}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 40px",
        background: isFloating
          ? "color-mix(in srgb, var(--bg-primary) 90%, transparent)"
          : "var(--bg-primary)",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        ...(isFloating
          ? {
              position: "sticky" as const,
              top: 0,
              zIndex: 10,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 1px 8px rgba(0,0,0,0.12)",
            }
          : {}),
      }}
    >
      <NavBarContent />
    </nav>
  );
}

TemplateNavBar.displayName = "TemplateNavBar";

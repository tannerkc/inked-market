"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Divider } from "@/components/ui/divider";

interface SidebarSection {
  id: string;
  number: string;
  title: string;
}

type SidebarAccentColor = "sage" | "rust" | "red";

interface ContentSidebarProps {
  sections: SidebarSection[];
  accentColor?: SidebarAccentColor;
  variant?: "light" | "dark";
  hubHref?: string;
  hubLabel?: string;
  className?: string;
}

const borderColorMap: Record<SidebarAccentColor, string> = {
  sage: "border-ink-sage",
  rust: "border-ink-rust",
  red: "border-ink-red",
};

function ContentSidebar({
  sections,
  accentColor = "rust",
  variant = "dark",
  hubHref = "/legal",
  hubLabel = "Legal Hub",
  className,
}: ContentSidebarProps) {
  const isDark = variant === "dark";
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -75% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  const handleClick = useCallback((id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const linkList = (
    <div className="flex flex-col gap-1">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => handleClick(s.id)}
          className={cn(
            "text-left font-mono text-[11px] tracking-[0.1em] uppercase transition-colors py-1.5 pl-3 border-l-2",
            activeId === s.id
              ? cn(
                  isDark ? "text-ink-cream/60" : "text-ink-black/60",
                  borderColorMap[accentColor]
                )
              : cn(
                  "border-transparent",
                  isDark
                    ? "text-ink-cream/30 hover:text-ink-cream/50"
                    : "text-ink-black/30 hover:text-ink-black/50"
                )
          )}
        >
          <span className={isDark ? "text-ink-cream/20" : "text-ink-black/20"}>
            {s.number}
          </span>{" "}
          {s.title}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className={cn(
          "hidden lg:block w-52 shrink-0 sticky top-28 self-start",
          className
        )}
      >
        <p className={cn(
          "font-mono text-[9px] tracking-[0.2em] uppercase mb-4",
          isDark ? "text-ink-cream/20" : "text-ink-black/20"
        )}>
          Contents
        </p>
        {linkList}
        <Divider variant={variant} className="my-6" />
        <p className={cn(
          "font-mono text-[9px] tracking-[0.2em] uppercase",
          isDark ? "text-ink-cream/15" : "text-ink-black/15"
        )}>
          {sections.length} sections
        </p>
        <a
          href={hubHref}
          className={cn(
            "inline-flex items-center gap-1.5 mt-4 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors",
            isDark
              ? "text-ink-cream/25 hover:text-ink-cream/45"
              : "text-ink-black/25 hover:text-ink-black/45"
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M8.5 3.5L5 7l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {hubLabel}
        </a>
      </nav>

      {/* Mobile accordion TOC */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-colors",
            isDark
              ? "border-ink-cream/[0.06] bg-ink-cream/[0.03] hover:border-ink-cream/[0.1]"
              : "border-ink-black/[0.06] bg-ink-black/[0.03] hover:border-ink-black/[0.1]"
          )}
        >
          <span className={cn(
            "font-mono text-[10px] tracking-[0.15em] uppercase",
            isDark ? "text-ink-cream/40" : "text-ink-black/40"
          )}>
            Table of Contents
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={cn(
              "transition-transform duration-300",
              isDark ? "text-ink-cream/30" : "text-ink-black/30",
              mobileOpen && "rotate-180"
            )}
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            mobileOpen ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0"
          )}
        >
          <div className={cn(
            "px-4 py-3 rounded-xl border",
            isDark
              ? "border-ink-cream/[0.04] bg-ink-cream/[0.02]"
              : "border-ink-black/[0.04] bg-ink-black/[0.02]"
          )}>
            {linkList}
          </div>
        </div>
      </div>
    </>
  );
}

export { ContentSidebar };
export type { SidebarSection, ContentSidebarProps };

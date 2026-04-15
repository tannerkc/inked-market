"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { searchSuggestions } from "@/lib/data/help-articles";
import type { HelpSearchSuggestion } from "@/lib/data/help-types";

interface HelpSearchProps {
  variant?: "light" | "dark";
  className?: string;
}

const audienceColorMap: Record<string, string> = {
  artist: "bg-ink-red/8 text-ink-red border border-ink-red/10",
  "studio-owner": "bg-ink-rust/8 text-ink-rust border border-ink-rust/10",
  customer: "bg-ink-sage/8 text-ink-sage border border-ink-sage/10",
};

const audienceLabelMap: Record<string, string> = {
  artist: "Artists",
  "studio-owner": "Studios",
  customer: "Customers",
};

const formatIconMap: Record<string, React.ReactNode> = {
  guide: (
    <svg className="w-3.5 h-3.5 opacity-30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  faq: (
    <svg className="w-3.5 h-3.5 opacity-30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  docs: (
    <svg className="w-3.5 h-3.5 opacity-30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
};

function HelpSearch({ variant = "dark", className }: HelpSearchProps) {
  const isDark = variant === "dark";
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions: HelpSearchSuggestion[] = useMemo(
    () => (query.length >= 2 ? searchSuggestions(query) : []),
    [query]
  );

  // Reset activeIndex when suggestions change to prevent out-of-bounds
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigate(suggestions[activeIndex].href);
      } else if (query.length >= 2) {
        navigate(`/help?q=${encodeURIComponent(query)}`);
      }
    }
  }

  const grouped = suggestions.reduce<Record<string, HelpSearchSuggestion[]>>((acc, s) => {
    const key = s.audience;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const hasSuggestions = suggestions.length > 0;

  return (
    <div ref={wrapRef} className={cn("relative max-w-xl mx-auto mt-6", className)}>
      <div className="relative">
        <svg
          className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-ink-cream/20" : "text-ink-black/20")}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search help articles..."
          className={cn(
            "w-full pl-11 pr-24 py-3 rounded-full border text-sm font-sans outline-none transition-all",
            isDark
              ? "border-ink-cream/8 bg-ink-cream/[0.03] text-ink-cream placeholder:text-ink-cream/20 focus:border-ink-cream/15 focus:shadow-[0_0_0_3px_rgba(245,240,232,0.03)]"
              : "border-ink-black/8 bg-white text-ink-black placeholder:text-ink-black/25 focus:border-ink-black/15 focus:shadow-[0_0_0_3px_rgba(10,10,10,0.03)]"
          )}
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[0.1em] uppercase text-ink-red/40 border border-ink-red/10 bg-ink-red/[0.04] px-2 py-0.5 rounded-md">
          AI Ready
        </span>
      </div>

      {isOpen && hasSuggestions && (
        <div className={cn(
          "absolute top-full mt-2 left-0 right-0 border rounded-2xl p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-50",
          isDark
            ? "bg-ink-black/[0.98] border-ink-cream/8"
            : "bg-white/[0.98] border-ink-black/8"
        )}>
          {Object.entries(grouped).map(([audience, items]) => (
            <div key={audience} className={cn(
              "py-1 [&+&]:border-t",
              isDark ? "[&+&]:border-ink-cream/[0.04]" : "[&+&]:border-ink-black/[0.04]"
            )}>
              <p className={cn(
                "font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1",
                isDark ? "text-ink-cream/18" : "text-ink-black/25"
              )}>
                {audienceLabelMap[audience] ?? audience}
              </p>
              {items.map((item) => {
                const flatIndex = suggestions.indexOf(item);
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActiveIndex(flatIndex)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] transition-colors",
                      isDark ? "text-ink-cream/50" : "text-ink-black/50",
                      flatIndex === activeIndex
                        ? isDark
                          ? "bg-ink-cream/[0.04] text-ink-cream/80"
                          : "bg-ink-black/[0.04] text-ink-black/80"
                        : isDark
                          ? "hover:bg-ink-cream/[0.04]"
                          : "hover:bg-ink-black/[0.04]"
                    )}
                  >
                    {formatIconMap[item.format]}
                    <span className="flex-1 truncate">{item.title}</span>
                    <span className={cn(
                      "font-mono text-[8px] tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-full shrink-0",
                      audienceColorMap[item.audience]
                    )}>
                      {audienceLabelMap[item.audience]}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { HelpSearch };

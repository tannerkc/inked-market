"use client";

import { useRef } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { ctaOptions } from "@/lib/data/builder-options";
import type { CtaLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Wireframe thumbnails (52x36)                                      */
/* ------------------------------------------------------------------ */
function CtaThumbnail({ layout, selected }: { layout: CtaLayout; selected: boolean }) {
  const accent = selected ? "#FF3333" : "#444";

  switch (layout) {
    case "simple-minimal":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-md bg-[#1a1a1a] p-1">
          <div className="mb-1 h-1.5 w-6 rounded-sm bg-[#444]" />
          <div className="mb-1 h-1 w-4 rounded-sm bg-[#333]" />
          <div className="h-1 w-3 rounded-sm" style={{ backgroundColor: accent }} />
        </div>
      );
    case "contact-form":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-[#1a1a1a] p-1.5">
          {/* Left: text lines */}
          <div className="flex w-1/2 flex-col gap-0.5 py-0.5">
            <div className="h-1.5 w-full rounded-sm bg-[#444]" />
            <div className="h-1 w-3/4 rounded-sm bg-[#333]" />
            <div className="h-1 w-1/2 rounded-sm bg-[#333]" />
          </div>
          {/* Right: stacked form fields */}
          <div className="flex w-1/2 flex-col gap-0.5 py-0.5">
            <div className="h-1.5 w-full rounded border border-[#333] bg-[#222]" />
            <div className="h-1.5 w-full rounded border border-[#333] bg-[#222]" />
            <div className="h-3 w-full rounded border border-[#333] bg-[#222]" />
            <div className="h-1.5 w-full rounded" style={{ backgroundColor: accent }} />
          </div>
        </div>
      );
    case "map-info":
      return (
        <div className="flex h-full w-full gap-0 rounded-md bg-[#1a1a1a] overflow-hidden">
          {/* Left: large gray map area */}
          <div className="flex w-3/5 items-center justify-center bg-[#222]">
            <svg width="8" height="10" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          {/* Right: text lines */}
          <div className="flex w-2/5 flex-col gap-0.5 p-1.5">
            <div className="h-1.5 w-full rounded-sm bg-[#444]" />
            <div className="h-1 w-3/4 rounded-sm bg-[#333]" />
            <div className="mt-auto h-1 w-2/3 rounded-sm" style={{ backgroundColor: accent }} />
          </div>
        </div>
      );
    case "booking":
      return (
        <div className="flex h-full w-full gap-0 overflow-hidden rounded-md bg-[#1a1a1a]">
          {/* Left: text + CTA */}
          <div className="flex w-1/2 flex-col gap-0.5 p-1.5">
            <div className="h-1 w-full rounded-sm bg-[#444]" />
            <div className="h-0.5 w-3/4 rounded-sm bg-[#333]" />
            <div className="mt-auto h-1 w-2/3 rounded-sm" style={{ backgroundColor: accent }} />
          </div>
          {/* Right: stat cards */}
          <div className="grid w-1/2 grid-cols-2 gap-0.5 p-1">
            <div className="rounded-sm bg-[#222] p-0.5" />
            <div className="rounded-sm bg-[#222] p-0.5" />
            <div className="rounded-sm bg-[#222] p-0.5" />
            <div className="rounded-sm bg-[#222] p-0.5" />
          </div>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Picker component                                                  */
/* ------------------------------------------------------------------ */
export function FooterStylePicker() {
  const { config, applyChange } = useBuilder();
  const bookingGlowDismissed = useRef(false);

  const handleLayoutSelect = (value: CtaLayout) => {
    if (value === "booking" && !bookingGlowDismissed.current) {
      applyChange({ ctaLayout: value, ctaGlow: true });
    } else {
      applyChange({ ctaLayout: value });
    }
  };

  const handleGlowToggle = () => {
    const next = !config.ctaGlow;
    if (!next && config.ctaLayout === "booking") {
      bookingGlowDismissed.current = true;
    }
    applyChange({ ctaGlow: next });
  };

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        CTA Layout
      </div>
      <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
        {ctaOptions.map((opt) => {
          const selected = config.ctaLayout === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleLayoutSelect(opt.value)}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all",
                selected
                  ? "border-[#FF3333] bg-[rgba(255,51,51,0.1)]"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]",
              )}
            >
              {/* Thumbnail */}
              <div className="relative h-9 w-[52px] flex-shrink-0 overflow-hidden rounded-md">
                <CtaThumbnail layout={opt.value} selected={selected} />
              </div>

              {/* Label + description */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "text-[11px] font-medium leading-tight transition-colors",
                    selected ? "text-[#FF3333]" : "text-[#ccc] group-hover:text-[#eee]",
                  )}
                >
                  {opt.label}
                </span>
                <span className="mt-0.5 text-[10px] leading-tight text-[#555]">
                  {opt.description}
                </span>
              </div>

              {/* Radio circle */}
              <div
                className={cn(
                  "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected
                    ? "border-[#FF3333] bg-[#FF3333]"
                    : "border-[#444] bg-transparent",
                )}
              >
                {selected && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5.5L4 7.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Glow toggle — applies to any layout */}
      <div className="mt-4 border-t border-[#222] pt-4">
        <button
          type="button"
          onClick={handleGlowToggle}
          className="group flex w-full items-center justify-between rounded-xl border border-[#222] bg-[#111] px-3 py-2.5 transition-all hover:border-[#333] hover:bg-[#161616]"
        >
          <div className="flex items-center gap-3">
            {/* Glow icon */}
            <div className="relative flex h-9 w-[52px] flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#1a1a1a]">
              <div
                className={cn(
                  "h-4 w-4 rounded-full blur-[3px] transition-opacity",
                  config.ctaGlow ? "opacity-60" : "opacity-20",
                )}
                style={{ backgroundColor: "#FF3333" }}
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium leading-tight text-[#ccc] group-hover:text-[#eee]">
                Accent Glow
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-[#555]">
                Radial glow effect behind CTA
              </span>
            </div>
          </div>

          {/* Toggle switch */}
          <div
            className={cn(
              "relative h-5 w-9 flex-shrink-0 rounded-full transition-colors",
              config.ctaGlow ? "bg-[#FF3333]" : "bg-[#333]",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                config.ctaGlow ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

FooterStylePicker.displayName = "FooterStylePicker";

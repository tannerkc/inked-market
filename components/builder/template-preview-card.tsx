"use client";

import React from "react";
import type { TemplateDefinition, TemplateSlug } from "@/lib/types/builder";
import { cn } from "@/lib/utils";
import { TemplatePreview } from "./template-preview";

interface TemplatePreviewCardProps {
  template: TemplateDefinition;
  onSelect: (slug: TemplateSlug) => void;
}

export function TemplatePreviewCard({ template, onSelect }: TemplatePreviewCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(template.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(template.slug);
        }
      }}
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer",
        "border transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-black"
      )}
      style={{
        borderColor: "var(--chrome-raised)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--chrome-border-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--chrome-raised)";
      }}
    >
      {/* Floating badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <span
          className="text-[11px] font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "var(--chrome-text-primary)",
          }}
        >
          {template.name}
        </span>
        {template.badge && (
          <span
            className="text-[11px] font-medium px-3 py-1 rounded-full"
            style={{
              backgroundColor: "var(--ink-red)",
              color: "var(--chrome-text-primary)",
            }}
          >
            {template.badge}
          </span>
        )}
      </div>

      {/* Preview content */}
      <TemplatePreview template={template} />

      {/* Bottom overlay bar */}
      <div
        className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between transition-opacity duration-300"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        }}
      >
        <div className="flex-1 mr-4">
          <h3
            className="text-[15px] font-semibold mb-0.5"
            style={{ color: "var(--chrome-text-primary)" }}
          >
            {template.name}
          </h3>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {template.description}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template.slug);
          }}
          className={cn(
            "flex-shrink-0 text-[12px] font-semibold uppercase tracking-wider",
            "px-5 py-2.5 rounded-lg",
            "transition-all duration-200",
            "hover:scale-105 hover:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          )}
          style={{
            backgroundColor: "var(--chrome-text-primary)",
            color: "var(--chrome-bg)",
          }}
        >
          Use This Template
        </button>
      </div>
    </div>
  );
}

TemplatePreviewCard.displayName = "TemplatePreviewCard";

"use client";

import React from "react";
import Link from "next/link";
import type { TemplateSlug } from "@/lib/types/builder";
import { templateList } from "@/lib/data/templates";
import { cn } from "@/lib/utils";
import { TemplatePreviewCard } from "./template-preview-card";

interface TemplatePickerProps {
  onSelectTemplate: (slug: TemplateSlug) => void;
}

export function TemplatePicker({ onSelectTemplate }: TemplatePickerProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Fixed top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-14"
        style={{
          backgroundColor: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 text-[13px] font-medium transition-colors",
            "hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:rounded-sm"
          )}
          style={{ color: "#888" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#555" }}
        >
          Inked Market
        </span>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      {/* Header section */}
      <div className="pt-28 pb-10 text-center px-4">
        <h1
          className="text-[42px] sm:text-[56px] font-bold uppercase tracking-tight mb-3"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#ffffff" }}
        >
          Choose Your Template
        </h1>
        <p
          className="text-[14px] sm:text-[16px] leading-relaxed mx-auto"
          style={{ color: "#666", maxWidth: 480 }}
        >
          Pick a starting point for your studio website. Every element can be customized in the builder.
        </p>
      </div>

      {/* Template grid */}
      <div className="mx-auto px-4 sm:px-6 pb-20" style={{ maxWidth: 1000 }}>
        <div className="flex flex-col gap-8">
          {templateList.map((template) => (
            <TemplatePreviewCard
              key={template.slug}
              template={template}
              onSelect={onSelectTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

TemplatePicker.displayName = "TemplatePicker";

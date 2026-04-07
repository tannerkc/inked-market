"use client";

import * as React from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const selectClassName = (isDark: boolean) => cn(
  "w-full rounded-xl px-4 py-3 text-[12px] border outline-none transition-colors appearance-none cursor-pointer",
  isDark
    ? "bg-ink-cream/[0.03] border-ink-cream/[0.08] text-ink-cream/70 focus:border-ink-cream/20"
    : "bg-ink-black/[0.03] border-ink-black/[0.08] text-ink-black/70 focus:border-ink-black/20"
);

interface CustomerDesignBriefPanelProps {
  open: boolean;
  onClose: () => void;
}

const PLACEMENT_OPTIONS = [
  "Arm (upper)",
  "Arm (lower/forearm)",
  "Wrist",
  "Hand/Fingers",
  "Chest",
  "Back (upper)",
  "Back (full)",
  "Ribs/Side",
  "Shoulder",
  "Leg (thigh)",
  "Leg (calf)",
  "Ankle/Foot",
  "Neck",
  "Other",
];

const SIZE_OPTIONS = [
  "Tiny (under 2 inches)",
  "Small (2-4 inches)",
  "Medium (4-8 inches)",
  "Large (8-12 inches)",
  "Extra large (12+ inches)",
  "Full sleeve",
  "Half sleeve",
];

export function CustomerDesignBriefPanel({
  open,
  onClose,
}: CustomerDesignBriefPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const variant = isDark ? "dark" : "light";

  const [placement, setPlacement] = React.useState("");
  const [size, setSize] = React.useState("");
  const [budgetMin, setBudgetMin] = React.useState("");
  const [budgetMax, setBudgetMax] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const handleSaveDraft = () => {
    onClose();
  };

  const handleSubmit = () => {
    onClose();
  };

  return (
    <SlideOverPanel open={open} onClose={onClose} title="New Design Brief">
      <div className="space-y-5">
        <div>
          <p
            className={cn(
              "font-mono text-[9px] tracking-[0.15em] uppercase mb-2",
              isDark ? "text-ink-cream/35" : "text-ink-black/35"
            )}
          >
            Placement
          </p>
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            className={selectClassName(isDark)}
          >
            <option value="">Select placement...</option>
            {PLACEMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p
            className={cn(
              "font-mono text-[9px] tracking-[0.15em] uppercase mb-2",
              isDark ? "text-ink-cream/35" : "text-ink-black/35"
            )}
          >
            Size
          </p>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={selectClassName(isDark)}
          >
            <option value="">Select size...</option>
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p
            className={cn(
              "font-mono text-[9px] tracking-[0.15em] uppercase mb-2",
              isDark ? "text-ink-cream/35" : "text-ink-black/35"
            )}
          >
            Budget Range (optional)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label=""
              variant={variant}
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="$ Min"
              type="number"
            />
            <Input
              label=""
              variant={variant}
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="$ Max"
              type="number"
            />
          </div>
        </div>

        <Textarea
          label="Describe Your Idea"
          variant={variant}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the tattoo you have in mind — style, subject matter, references, mood..."
          rows={5}
        />

        <div>
          <p
            className={cn(
              "font-mono text-[9px] tracking-[0.15em] uppercase mb-2",
              isDark ? "text-ink-cream/35" : "text-ink-black/35"
            )}
          >
            Reference Images
          </p>
          <UploadDropzone label="Drop images here or click to upload" hint="JPG, PNG up to 10MB each" />
        </div>

        <Textarea
          label="Additional Notes"
          variant={variant}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else the artist should know — skin sensitivities, time constraints, etc."
          rows={3}
        />

        <div className="space-y-2.5 pt-2">
          <Button variant="ink" className="w-full" onClick={handleSubmit}>
            Submit Brief
          </Button>
          <Button
            variant="ink-outline"
            className="w-full"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
        </div>
      </div>
    </SlideOverPanel>
  );
}

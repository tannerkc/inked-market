"use client";

import * as React from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

const selectClassName = (isDark: boolean) => cn(
  "w-full rounded-xl px-4 py-3 text-[12px] border outline-none transition-colors appearance-none cursor-pointer",
  isDark
    ? "bg-ink-cream/[0.03] border-ink-cream/[0.08] text-ink-cream/70 focus:border-ink-cream/20"
    : "bg-ink-black/[0.03] border-ink-black/[0.08] text-ink-black/70 focus:border-ink-black/20"
);

interface CustomerHealedPhotoPanelProps {
  open: boolean;
  onClose: () => void;
  completedAppointments: Appointment[];
}

export function CustomerHealedPhotoPanel({
  open,
  onClose,
  completedAppointments,
}: CustomerHealedPhotoPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const variant = isDark ? "dark" : "light";

  const [selectedAppointment, setSelectedAppointment] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [approveForPortfolio, setApproveForPortfolio] = React.useState(false);

  const handleUpload = () => {
    onClose();
  };

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Upload Healed Photo">
      <div className="space-y-5">
        <div>
          <p
            className={cn(
              "font-mono text-[9px] tracking-[0.15em] uppercase mb-2",
              isDark ? "text-ink-cream/35" : "text-ink-black/35"
            )}
          >
            Linked Appointment
          </p>
          <select
            value={selectedAppointment}
            onChange={(e) => setSelectedAppointment(e.target.value)}
            className={selectClassName(isDark)}
          >
            <option value="">Select appointment...</option>
            {completedAppointments.map((appt) => (
              <option key={appt.id} value={appt.id}>
                {appt.artistName} —{" "}
                {new Date(appt.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
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
            Photo
          </p>
          <UploadDropzone
            icon={<svg className={cn("w-8 h-8 mx-auto mb-2", isDark ? "text-ink-cream/15" : "text-ink-black/15")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>}
            label="Drop your healed photo here or click to upload"
            hint="JPG or PNG, max 10MB"
          />
        </div>

        <Textarea
          label="Caption (optional)"
          variant={variant}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="How it healed, how long after the session..."
          rows={2}
        />

        <label className="flex items-start gap-3 cursor-pointer group">
          <button
            type="button"
            onClick={() => setApproveForPortfolio(!approveForPortfolio)}
            className={cn(
              "mt-0.5 w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer",
              approveForPortfolio
                ? "bg-ink-rust border-ink-rust"
                : isDark
                  ? "border-ink-cream/[0.15] group-hover:border-ink-cream/30"
                  : "border-ink-black/[0.15] group-hover:border-ink-black/30"
            )}
          >
            {approveForPortfolio && (
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <div>
            <p
              className={cn(
                "text-[12px] font-medium",
                isDark ? "text-ink-cream/60" : "text-ink-black/60"
              )}
            >
              Allow artist to feature in their portfolio
            </p>
            <p
              className={cn(
                "text-[10px] mt-0.5",
                isDark ? "text-ink-cream/25" : "text-ink-black/25"
              )}
            >
              Your healed photo helps showcase their work to future clients
            </p>
          </div>
        </label>

        <div className="space-y-2.5 pt-2">
          <Button variant="ink" className="w-full" onClick={handleUpload}>
            Upload Photo
          </Button>
          <Button variant="ink-outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </SlideOverPanel>
  );
}

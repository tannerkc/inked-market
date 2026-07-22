"use client";

import * as React from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { StylePicker } from "@/components/signup/style-picker";

interface EditProfilePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Avatar shape: circle for artists, rounded for studios */
  avatarShape?: "circle" | "rounded";
  avatarLabel?: string;
  /** Role-specific form fields rendered between avatar and styles */
  children: React.ReactNode;
  /** Style/specialty picker config */
  stylesLabel?: string;
  styleOptions: string[];
  selectedStyles: string[];
  onStylesChange: (styles: string[]) => void;
  styleAccentColor?: "red" | "rust";
  /** Read-only mode disables style selection (e.g., auto-specialties) */
  stylesReadOnly?: boolean;
  /** Helper text shown below the styles label */
  stylesNote?: string;
  /** Content rendered above the style picker (e.g., toggle switch) */
  stylesPrefix?: React.ReactNode;
  /** Hide social links section (e.g. for customers) */
  showSocialLinks?: boolean;
  /** Social links */
  instagram?: string;
  onInstagramChange?: (value: string) => void;
  website?: string;
  onWebsiteChange?: (value: string) => void;
  tiktok?: string;
  onTiktokChange?: (value: string) => void;
  onSave: () => void;
}

export function EditProfilePanel({
  open,
  onClose,
  title,
  avatarShape = "circle",
  avatarLabel = "Upload photo",
  children,
  stylesLabel = "Styles",
  styleOptions,
  selectedStyles,
  onStylesChange,
  styleAccentColor = "red",
  stylesReadOnly = false,
  stylesNote,
  stylesPrefix,
  showSocialLinks = true,
  instagram = "",
  onInstagramChange,
  website = "",
  onWebsiteChange,
  tiktok = "",
  onTiktokChange,
  onSave,
}: EditProfilePanelProps) {
  return (
    <SlideOverPanel open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${avatarShape === "circle" ? "rounded-full" : "rounded-2xl"} border-[1.5px] border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-solid border-ink-black/[0.15] dark:border-ink-cream/[0.15]`}>
            <span className="text-[22px] text-ink-black/15 dark:text-ink-cream/15">+</span>
          </div>
          <div>
            <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">{avatarLabel}</p>
            <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">JPG or PNG, max 5MB</p>
          </div>
        </div>

        {/* Role-specific fields */}
        {children}

        {/* Styles/Specialties */}
        <div>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2 text-ink-black/35 dark:text-ink-cream/35">{stylesLabel}</p>
          {stylesPrefix}
          <div className={stylesReadOnly ? "pointer-events-none opacity-60" : undefined}>
            <StylePicker
              options={styleOptions}
              selected={selectedStyles}
              onChange={onStylesChange}
              accentColor={styleAccentColor}
            />
          </div>
          {stylesNote && (
            <p className="text-[10px] mt-1.5 text-ink-black/25 dark:text-ink-cream/25">{stylesNote}</p>
          )}
        </div>

        {/* Social links */}
        {showSocialLinks && (
          <>
            <SectionLabel label="social" variant="muted" stretch />

            <Input label="Instagram" value={instagram} onChange={(e) => onInstagramChange?.(e.target.value)} placeholder="@username" />
            <Input label="Website" value={website} onChange={(e) => onWebsiteChange?.(e.target.value)} placeholder="https://..." />
            <Input label="TikTok" value={tiktok} onChange={(e) => onTiktokChange?.(e.target.value)} placeholder="@username" />
          </>
        )}

        {/* Actions */}
        <Button variant="ink" className="w-full" onClick={onSave}>Save Changes</Button>
        <Button variant="ink-outline" className="w-full" onClick={onClose}>Cancel</Button>
      </div>
    </SlideOverPanel>
  );
}

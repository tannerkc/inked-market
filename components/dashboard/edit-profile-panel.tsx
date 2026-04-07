"use client";

import * as React from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { StylePicker } from "@/components/signup/style-picker";
import { useTheme } from "@/components/providers/theme-provider";

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
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const variant = isDark ? "dark" : "light";

  return (
    <SlideOverPanel open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${avatarShape === "circle" ? "rounded-full" : "rounded-2xl"} border-[1.5px] border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-solid ${isDark ? "border-ink-cream/[0.15]" : "border-ink-black/[0.15]"}`}>
            <span className={`text-[22px] ${isDark ? "text-ink-cream/15" : "text-ink-black/15"}`}>+</span>
          </div>
          <div>
            <p className={`text-[12px] font-medium ${isDark ? "text-ink-cream/60" : "text-ink-black/60"}`}>{avatarLabel}</p>
            <p className={`text-[10px] ${isDark ? "text-ink-cream/25" : "text-ink-black/25"}`}>JPG or PNG, max 5MB</p>
          </div>
        </div>

        {/* Role-specific fields */}
        {children}

        {/* Styles/Specialties */}
        <div>
          <p className={`font-mono text-[9px] tracking-[0.15em] uppercase mb-2 ${isDark ? "text-ink-cream/35" : "text-ink-black/35"}`}>{stylesLabel}</p>
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
            <p className={`text-[10px] mt-1.5 ${isDark ? "text-ink-cream/25" : "text-ink-black/25"}`}>{stylesNote}</p>
          )}
        </div>

        {/* Social links */}
        {showSocialLinks && (
          <>
            <SectionLabel label="social" variant={isDark ? "dark-muted" : "parchment"} stretch />

            <Input label="Instagram" variant={variant} value={instagram} onChange={(e) => onInstagramChange?.(e.target.value)} placeholder="@username" />
            <Input label="Website" variant={variant} value={website} onChange={(e) => onWebsiteChange?.(e.target.value)} placeholder="https://..." />
            <Input label="TikTok" variant={variant} value={tiktok} onChange={(e) => onTiktokChange?.(e.target.value)} placeholder="@username" />
          </>
        )}

        {/* Actions */}
        <Button variant="ink" className="w-full" onClick={onSave}>Save Changes</Button>
        <Button variant="ink-outline" className="w-full" onClick={onClose}>Cancel</Button>
      </div>
    </SlideOverPanel>
  );
}

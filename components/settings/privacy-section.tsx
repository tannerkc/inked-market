"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SettingsSection } from "./settings-section";
import { usePrivacy } from "./use-privacy";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  warning?: string;
  disabled?: boolean;
  disabledNote?: string;
}

function ToggleRow({ label, description, checked, onChange, warning, disabled, disabledNote }: ToggleRowProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={cn("py-3", disabled && "opacity-50")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={cn("text-[12px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
            {label}
          </p>
          <p className={cn("text-[10px] mt-0.5", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
            {description}
          </p>
        </div>
        <ToggleSwitch checked={checked} onChange={disabled ? () => {} : onChange} size="sm" />
      </div>
      {disabled && disabledNote && (
        <p className="text-[10px] text-ink-rust/60 mt-1.5">{disabledNote}</p>
      )}
      {warning && !checked && !disabled && (
        <p className="text-[10px] text-ink-rust/70 mt-1.5">{warning}</p>
      )}
    </div>
  );
}

function GroupLabel({ label }: { label: string }) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <p className={cn("font-mono text-[8px] tracking-[0.2em] uppercase mt-5 mb-1 px-1", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
      {label}
    </p>
  );
}

export function PrivacySection() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const { prefs, toggle, setPortfolioVisibility, role, isFreeTier } = usePrivacy();

  const cardClass = cn(
    "rounded-[16px] border divide-y",
    isDark
      ? "border-ink-cream/[0.06] bg-ink-cream/[0.02] divide-ink-cream/[0.04]"
      : "border-ink-black/[0.06] bg-ink-black/[0.02] divide-ink-black/[0.04]"
  );

  return (
    <SettingsSection title="Privacy" description="Control your visibility and data preferences">
      {/* Visibility */}
      <GroupLabel label="Visibility" />
      <div className={cardClass}>
        <div className="px-5">
          <ToggleRow
            label="Show profile in search results"
            description="Controls whether you appear on Discover"
            checked={prefs.showInSearch}
            onChange={() => toggle("showInSearch")}
            warning="Your profile will no longer appear on Discover. Existing direct links will still work."
            disabled={isFreeTier}
            disabledNote="Upgrade to Shader to appear on Discover"
          />

          {role === "artist" && (
            <>
              <ToggleRow
                label="Show availability status"
                description="Whether your booking status is visible on your profile"
                checked={!!prefs.showAvailability}
                onChange={() => toggle("showAvailability")}
              />
              <ToggleRow
                label="Show studio affiliation"
                description="Whether your studio link appears on your profile"
                checked={!!prefs.showAffiliation}
                onChange={() => toggle("showAffiliation")}
              />
              {/* Portfolio visibility radio */}
              <div className="py-3">
                <p className={cn("text-[12px] font-medium mb-2", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
                  Portfolio visibility
                </p>
                <div className="flex gap-4">
                  {(["public", "followers"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="portfolio-visibility"
                        checked={prefs.portfolioVisibility === opt}
                        onChange={() => setPortfolioVisibility(opt)}
                        className="accent-ink-rust"
                      />
                      <span className={cn("text-[11px] capitalize", isDark ? "text-ink-cream/50" : "text-ink-black/50")}>
                        {opt === "followers" ? "Followers only" : "Public"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {role === "studio" && (
            <>
              <ToggleRow
                label="Show business hours"
                description="Whether hours appear on your listing"
                checked={!!prefs.showBusinessHours}
                onChange={() => toggle("showBusinessHours")}
              />
              <ToggleRow
                label="Show artist roster"
                description="Whether your artist list is visible"
                checked={!!prefs.showArtistRoster}
                onChange={() => toggle("showArtistRoster")}
              />
            </>
          )}

          {role === "customer" && (
            <>
              <ToggleRow
                label="Show saved artists & studios"
                description="Whether your favorites are visible on your profile"
                checked={!!prefs.showSavedItems}
                onChange={() => toggle("showSavedItems")}
              />
              <ToggleRow
                label="Show review history"
                description="Whether past reviews are visible on your profile"
                checked={!!prefs.showReviewHistory}
                onChange={() => toggle("showReviewHistory")}
              />
            </>
          )}
        </div>
      </div>

      {/* Communications */}
      <GroupLabel label="Communications" />
      <div className={cardClass}>
        <div className="px-5">
          <ToggleRow
            label="Allow messages from non-connections"
            description="Controls who can send you direct messages"
            checked={prefs.allowMessages}
            onChange={() => toggle("allowMessages")}
          />
        </div>
      </div>
    </SettingsSection>
  );
}

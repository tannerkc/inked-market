"use client";

import { SettingsSection } from "./settings-section";
import { SettingsToggleRow as ToggleRow, SettingsGroupLabel as GroupLabel } from "./settings-toggle-row";
import { usePrivacy } from "./use-privacy";
import { ListGroup } from "@/components/dashboard";

export function PrivacySection() {
  const { prefs, toggle, setPortfolioVisibility, role, isFreeTier } = usePrivacy();

  return (
    <SettingsSection title="Privacy" description="Control your visibility and data preferences">
      {/* Visibility */}
      <GroupLabel label="Visibility" />
      <ListGroup>
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
                <p className="text-[12px] font-medium mb-2 text-ink-black/60 dark:text-ink-cream/60">
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
                      <span className="text-[11px] capitalize text-ink-black/50 dark:text-ink-cream/50">
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
      </ListGroup>

      {/* Communications */}
      <GroupLabel label="Communications" />
      <ListGroup>
        <div className="px-5">
          <ToggleRow
            label="Allow messages from non-connections"
            description="Controls who can send you direct messages"
            checked={prefs.allowMessages}
            onChange={() => toggle("allowMessages")}
          />
        </div>
      </ListGroup>
    </SettingsSection>
  );
}

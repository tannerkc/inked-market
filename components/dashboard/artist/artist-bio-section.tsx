"use client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/providers/theme-provider";

interface ArtistBioSectionProps {
  bioEditing: boolean;
  setBioEditing: (editing: boolean) => void;
  bioText: string;
  setBioText: (text: string) => void;
  onSave?: () => void;
}

export function ArtistBioSection({ bioEditing, setBioEditing, bioText, setBioText, onSave }: ArtistBioSectionProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <DashboardSection
      title="Bio"
      action={!bioEditing ? { label: "+ Add a bio", onClick: () => setBioEditing(true) } : undefined}
    >
      {bioEditing ? (
        <div className="space-y-3">
          <Textarea
            label="Your Bio"
            placeholder="Tell clients about your work, style, and experience..."
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            rows={4}
          />
          <div className="flex gap-2">
            <button onClick={() => setBioEditing(false)} className={`font-mono text-[9px] tracking-[0.15em] uppercase cursor-pointer ${isDark ? "text-ink-cream/30" : "text-ink-black/30"}`}>Cancel</button>
            <button onClick={() => { onSave?.(); setBioEditing(false); }} className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-rust cursor-pointer">Save</button>
          </div>
        </div>
      ) : (
        <EmptyState
          message="No bio yet"
          description="Tell clients about your work, style, and experience"
          action={{ label: "+ Add a bio", onClick: () => setBioEditing(true) }}
        />
      )}
    </DashboardSection>
  );
}

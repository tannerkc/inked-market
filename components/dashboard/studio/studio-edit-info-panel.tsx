"use client";

import { EditProfilePanel } from "@/components/dashboard/edit-profile-panel";
import { Input } from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useTheme } from "@/components/providers/theme-provider";
import { studioSpecialtyOptions } from "@/lib/data/signup-styles";
import { cn } from "@/lib/utils";

interface StudioForm {
  name: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  specialties: string[];
  instagram: string;
  website: string;
  tiktok: string;
}

interface StudioEditInfoPanelProps {
  open: boolean;
  onClose: () => void;
  studioForm: StudioForm;
  setStudioForm: (form: StudioForm) => void;
  onSave: () => void;
  autoSpecialties: boolean;
  onToggleAutoSpecialties: () => void;
}

export function StudioEditInfoPanel({ open, onClose, studioForm, setStudioForm, onSave, autoSpecialties, onToggleAutoSpecialties }: StudioEditInfoPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const variant = isDark ? "dark" : "light";

  return (
    <EditProfilePanel
      open={open}
      onClose={onClose}
      title="Edit Studio Info"
      avatarShape="rounded"
      avatarLabel="Upload logo"
      stylesLabel="Specialties"
      styleOptions={studioSpecialtyOptions}
      selectedStyles={studioForm.specialties}
      onStylesChange={autoSpecialties ? () => {} : (specialties) => setStudioForm({ ...studioForm, specialties })}
      styleAccentColor="rust"
      stylesReadOnly={autoSpecialties}
      stylesNote={autoSpecialties ? "Updates automatically as you add and remove artists" : undefined}
      stylesPrefix={
        <div className={cn("flex items-center justify-between mb-3 py-2 px-3 rounded-xl border", isDark ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]" : "border-ink-black/[0.06] bg-ink-black/[0.02]")}>
          <div>
            <p className={cn("text-[11px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>Auto from roster</p>
            <p className={cn("text-[9px]", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>Derive from artist styles</p>
          </div>
          <ToggleSwitch checked={autoSpecialties} onChange={onToggleAutoSpecialties} size="sm" />
        </div>
      }
      instagram={studioForm.instagram}
      onInstagramChange={(v) => setStudioForm({ ...studioForm, instagram: v })}
      website={studioForm.website}
      onWebsiteChange={(v) => setStudioForm({ ...studioForm, website: v })}
      tiktok={studioForm.tiktok}
      onTiktokChange={(v) => setStudioForm({ ...studioForm, tiktok: v })}
      onSave={onSave}
    >
      <Input label="Studio Name" variant={variant} value={studioForm.name} onChange={(e) => setStudioForm({ ...studioForm, name: e.target.value })} placeholder="Studio name" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" variant={variant} value={studioForm.city} onChange={(e) => setStudioForm({ ...studioForm, city: e.target.value })} placeholder="City" />
        <Input label="State" variant={variant} value={studioForm.state} onChange={(e) => setStudioForm({ ...studioForm, state: e.target.value })} placeholder="State" />
      </div>
      <Input label="Phone" variant={variant} type="tel" value={studioForm.phone} onChange={(e) => setStudioForm({ ...studioForm, phone: e.target.value })} placeholder="(555) 555-0142" />
      <Input label="Email" variant={variant} type="email" value={studioForm.email} onChange={(e) => setStudioForm({ ...studioForm, email: e.target.value })} placeholder="studio@email.com" />
    </EditProfilePanel>
  );
}

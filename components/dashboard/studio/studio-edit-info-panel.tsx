"use client";

import { EditProfilePanel } from "@/components/dashboard/edit-profile-panel";
import { StudioUrlField } from "@/components/dashboard/studio/studio-url-field";
import { Input } from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { studioSpecialtyOptions } from "@/lib/data/signup-styles";

interface StudioForm {
  name: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string;
  bio: string;
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
        <div className="flex items-center justify-between mb-3 py-2 px-3 rounded-xl border border-ink-black/[0.06] bg-ink-black/[0.02] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]">
          <div>
            <p className="text-[11px] font-medium text-ink-black/60 dark:text-ink-cream/60">Auto from roster</p>
            <p className="text-[9px] text-ink-black/25 dark:text-ink-cream/25">Derive from artist styles</p>
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
      <Input label="Studio Name" value={studioForm.name} onChange={(e) => setStudioForm({ ...studioForm, name: e.target.value })} placeholder="Studio name" />
      <StudioUrlField />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={studioForm.city} onChange={(e) => setStudioForm({ ...studioForm, city: e.target.value })} placeholder="City" />
        <Input label="State" value={studioForm.state} onChange={(e) => setStudioForm({ ...studioForm, state: e.target.value })} placeholder="State" />
      </div>
      <Input label="Phone" type="tel" value={studioForm.phone} onChange={(e) => setStudioForm({ ...studioForm, phone: e.target.value })} placeholder="(555) 555-0142" />
      <Input label="Email" type="email" value={studioForm.email} onChange={(e) => setStudioForm({ ...studioForm, email: e.target.value })} placeholder="studio@email.com" />
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium uppercase tracking-wide text-ink-black/50 dark:text-ink-cream/50">
          About / Bio
        </label>
        <textarea
          rows={4}
          placeholder="Tell your studio's story..."
          value={studioForm.bio}
          onChange={(e) => setStudioForm({ ...studioForm, bio: e.target.value })}
          className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors border border-ink-black/[0.08] bg-ink-black/[0.03] text-ink-black placeholder:text-ink-black/25 focus:border-ink-black/20 dark:border-ink-cream/[0.08] dark:bg-ink-cream/[0.03] dark:text-ink-cream dark:placeholder:text-ink-cream/25 dark:focus:border-ink-cream/20"
        />
      </div>
      <Input label="Street Address" value={studioForm.address} onChange={(e) => setStudioForm({ ...studioForm, address: e.target.value })} placeholder="123 Main St" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Zip Code" value={studioForm.zipCode} onChange={(e) => setStudioForm({ ...studioForm, zipCode: e.target.value })} placeholder="97214" />
        <div />
      </div>
    </EditProfilePanel>
  );
}

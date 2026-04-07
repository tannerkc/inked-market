"use client";

import { EditProfilePanel } from "@/components/dashboard/edit-profile-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/providers/theme-provider";

interface ProfileForm {
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  styles: string[];
  instagram: string;
  website: string;
  tiktok: string;
}

interface ArtistEditProfilePanelProps {
  open: boolean;
  onClose: () => void;
  profileForm: ProfileForm;
  setProfileForm: (form: ProfileForm) => void;
  onSave: () => void;
}

const ARTIST_STYLE_OPTIONS = ["Traditional", "Realism", "Watercolor", "Tribal", "Geometric", "Blackwork", "Japanese", "Minimalist", "Portrait", "Fine Line", "Neo-Traditional", "Dotwork", "Sketch", "Abstract"];

export function ArtistEditProfilePanel({ open, onClose, profileForm, setProfileForm, onSave }: ArtistEditProfilePanelProps) {
  const { mode } = useTheme();
  const variant = mode === "dark" ? "dark" : "light";

  return (
    <EditProfilePanel
      open={open}
      onClose={onClose}
      title="Edit Profile"
      avatarShape="circle"
      avatarLabel="Upload photo"
      styleOptions={ARTIST_STYLE_OPTIONS}
      selectedStyles={profileForm.styles}
      onStylesChange={(styles) => setProfileForm({ ...profileForm, styles })}
      styleAccentColor="red"
      instagram={profileForm.instagram}
      onInstagramChange={(v) => setProfileForm({ ...profileForm, instagram: v })}
      website={profileForm.website}
      onWebsiteChange={(v) => setProfileForm({ ...profileForm, website: v })}
      tiktok={profileForm.tiktok}
      onTiktokChange={(v) => setProfileForm({ ...profileForm, tiktok: v })}
      onSave={onSave}
    >
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" variant={variant} value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} placeholder="First name" />
        <Input label="Last Name" variant={variant} value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} placeholder="Last name" />
      </div>
      <Input label="Location" variant={variant} value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} placeholder="City, State" />
      <Textarea label="Bio" variant={variant} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell clients about your work, style, and experience..." rows={4} />
    </EditProfilePanel>
  );
}

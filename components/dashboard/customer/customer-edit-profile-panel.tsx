"use client";

import { EditProfilePanel } from "@/components/dashboard/edit-profile-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { tattooStyleOptions } from "@/lib/data/signup-styles";

interface CustomerProfileForm {
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  styles: string[];
}

interface CustomerEditProfilePanelProps {
  open: boolean;
  onClose: () => void;
  profileForm: CustomerProfileForm;
  setProfileForm: (form: CustomerProfileForm) => void;
  onSave: () => void;
}

const STYLE_PREFERENCES = tattooStyleOptions;

export function CustomerEditProfilePanel({
  open,
  onClose,
  profileForm,
  setProfileForm,
  onSave,
}: CustomerEditProfilePanelProps) {
  return (
    <EditProfilePanel
      open={open}
      onClose={onClose}
      title="Edit Profile"
      avatarShape="circle"
      avatarLabel="Upload photo"
      stylesLabel="Style Preferences"
      styleOptions={STYLE_PREFERENCES}
      selectedStyles={profileForm.styles}
      onStylesChange={(styles) => setProfileForm({ ...profileForm, styles })}
      styleAccentColor="red"
      showSocialLinks={false}
      onSave={onSave}
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          value={profileForm.firstName}
          onChange={(e) =>
            setProfileForm({ ...profileForm, firstName: e.target.value })
          }
          placeholder="First name"
        />
        <Input
          label="Last Name"
          value={profileForm.lastName}
          onChange={(e) =>
            setProfileForm({ ...profileForm, lastName: e.target.value })
          }
          placeholder="Last name"
        />
      </div>
      <Input
        label="Location"
        value={profileForm.location}
        onChange={(e) =>
          setProfileForm({ ...profileForm, location: e.target.value })
        }
        placeholder="City, State"
      />
      <Textarea
        label="About You"
        value={profileForm.bio}
        onChange={(e) =>
          setProfileForm({ ...profileForm, bio: e.target.value })
        }
        placeholder="What kind of tattoos are you looking for? Any style or placement preferences..."
        rows={3}
      />
    </EditProfilePanel>
  );
}

import type { StudioData } from "@/lib/repositories";
import type { ChecklistItem } from "@/lib/types";

/**
 * Setup checklist derived entirely from the live studio row — no stored
 * progress. Hours are seeded with sensible defaults at signup, so "set hours"
 * can't be derived honestly; "write your story" (bio) stands in as the
 * content step the owner must actually do.
 */
export function buildStudioChecklist(studio: StudioData | null): ChecklistItem[] {
  const hasDetails = Boolean(studio?.name && studio.city && studio.state);
  const hasSpecialties = (studio?.specialties.length ?? 0) > 0;
  const hasStory = Boolean(studio?.bio?.trim());
  const hasPhotos = Boolean(studio?.coverImage) || (studio?.images?.length ?? 0) > 0;
  const hasCustomized = Boolean(studio?.themeConfig);

  return [
    { id: "create-account", label: "Create account", completed: true },
    { id: "add-studio-details", label: "Add studio details", completed: hasDetails, required: true },
    { id: "set-specialties", label: "Set specialties", completed: hasSpecialties, required: true },
    { id: "write-story", label: "Write your story", completed: hasStory, required: true },
    { id: "add-photos", label: "Add studio photos", completed: hasPhotos },
    { id: "customize-page", label: "Customize your page", completed: hasCustomized },
  ];
}

export function checklistProgress(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0;
  return checklist.filter((item) => item.completed).length / checklist.length;
}

/** Required steps still incomplete. Empty = the basic profile can render
 *  honestly (details, specialties, story) and the studio may go live.
 *  Photos and the custom page stay optional — encouraged, never blocking. */
export function missingRequiredSteps(checklist: ChecklistItem[]): ChecklistItem[] {
  return checklist.filter((item) => item.required && !item.completed);
}

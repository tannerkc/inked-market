import type { ContentGroup } from "@/components/studio-site/studio-site-context";
import { StoryGroup } from "./story-group";
import { PhotosGroup } from "./photos-group";
import { SocialsGroup } from "./socials-group";
import { ContactHoursGroup } from "./contact-hours-group";
import { BookingGroup } from "./booking-group";
import { ArtistsGroup } from "./artists-group";

export interface ContentGroupDef {
  id: ContentGroup;
  title: string;
  Component: React.FC<{ highlighted?: boolean }>;
}

/** Ordered registry of Content-panel groups. */
export const CONTENT_GROUPS: ContentGroupDef[] = [
  { id: "story", title: "Story", Component: StoryGroup },
  { id: "photos", title: "Photos", Component: PhotosGroup },
  { id: "contact-hours", title: "Contact & Hours", Component: ContactHoursGroup },
  { id: "socials", title: "Social Links", Component: SocialsGroup },
  { id: "booking", title: "Booking Link", Component: BookingGroup },
  { id: "artists", title: "Artists", Component: ArtistsGroup },
];

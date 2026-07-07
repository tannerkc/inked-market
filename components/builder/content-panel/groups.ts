import type { ContentGroup } from "@/components/studio-site/studio-site-context";
import { StoryGroup } from "./story-group";
import { SocialsGroup } from "./socials-group";

export interface ContentGroupDef {
  id: ContentGroup;
  title: string;
  Component: React.FC<{ highlighted?: boolean }>;
}

/** Ordered registry of Content-panel groups. */
export const CONTENT_GROUPS: ContentGroupDef[] = [
  { id: "story", title: "Story", Component: StoryGroup },
  { id: "socials", title: "Social Links", Component: SocialsGroup },
];

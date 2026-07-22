import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("The Line Up", "Your weekly tattoo briefing. Spotlights, news, events, and the artists we can't stop watching.");

export default function LineupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("Saved", "Your saved artists, studios, and design inspiration");

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

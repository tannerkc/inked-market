import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved | Inked Market",
  description: "Your saved artists, studios, and design inspiration",
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

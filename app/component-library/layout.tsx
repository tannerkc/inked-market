import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Back Room | Inked Market",
  description: "You found it. The workshop where the tools live.",
  robots: "noindex, nofollow",
};

export default function ComponentLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

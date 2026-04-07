import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Help — Inked Market",
    default: "Help Center | Inked Market",
  },
  description:
    "Guides, tutorials, and answers for customers, artists, and studio owners on Inked Market.",
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

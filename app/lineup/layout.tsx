import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Line Up | Inked Market",
  description:
    "Your weekly tattoo briefing. Spotlights, news, events, and the artists we can't stop watching.",
};

export default function LineupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

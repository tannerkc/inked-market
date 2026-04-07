import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist Dashboard | Inked Market",
  description: "Manage your tattoo artist profile, portfolio, and bookings",
};

export default function ArtistDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

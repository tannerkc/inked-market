import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("Artist Dashboard", "Manage your tattoo artist profile, portfolio, and bookings");

export default function ArtistDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

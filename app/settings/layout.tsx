import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("Settings", "Manage your account settings and preferences");

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

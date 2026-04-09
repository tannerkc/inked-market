import { StudioProvider } from "@/lib/providers/studio-provider";

/**
 * Dashboard layout — mounts StudioProvider once for the entire dashboard tree.
 * Both /dashboard and /dashboard/builder share the same StudioData instance.
 *
 * Future: add auth guard, analytics init, or feature-flag providers here.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioProvider>{children}</StudioProvider>;
}

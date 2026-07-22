import { AuthGuard } from "@/components/providers/auth-guard";
import { SettingsShell } from "@/components/settings";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsShell />
    </AuthGuard>
  );
}

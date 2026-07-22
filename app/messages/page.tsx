import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { MessagesShell } from "@/components/messages";

export const metadata = createMetadata("Messages", "Direct messages with artists and studios");

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; to?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { c, to } = await searchParams;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={{ text: "Talk Shop", variant: "marker", color: "red" }}
        headline={{
          variant: "mixed",
          size: "sm",
          words: [
            { text: "Your", font: "pirata" },
            { text: "Messages", font: "cook", color: "text-ink-rust dark:text-ink-red" },
          ],
        }}
        subtitle={{
          text: "Every conversation with your artists and studios, in one place.",
          variant: "plain",
        }}
        className="mb-6"
      />
      <MessagesShell initialConversationId={c} initialTo={to} />
    </DashboardLayout>
  );
}

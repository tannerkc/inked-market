import { redirect } from "next/navigation";
import { startCheckout } from "@/app/billing/actions";

export const dynamic = "force-dynamic";

export default async function BillingStartPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; cycle?: string; intent?: string }>;
}) {
  const params = await searchParams;
  const result = await startCheckout({
    tier: params.tier ?? "shader",
    cycle: params.cycle === "annual" ? "annual" : "monthly",
    intent: params.intent === "publish" ? "publish" : "upgrade",
  });
  if (result.url) redirect(result.url);
  redirect(`/settings?billing_error=${encodeURIComponent(result.error ?? "unknown")}`);
}

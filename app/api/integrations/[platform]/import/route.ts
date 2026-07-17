import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOAuthProvider } from "@/lib/integrations/providers";
import { getFreshTokens, updateIntegrationProjection } from "@/lib/integrations/connections";
import { requireStudioOwner } from "@/lib/integrations/route-helpers";

/** Runs the provider's data pull (Square hours, Instagram photos) for the
 * signed-in owner's studio and records real import stats on the projection. */
export async function POST(_request: NextRequest, context: { params: Promise<{ platform: string }> }) {
  const { platform } = await context.params;

  const provider = getOAuthProvider(platform);
  if (!provider?.runImport) {
    return NextResponse.json({ error: "This platform has nothing to import." }, { status: 404 });
  }

  const owner = await requireStudioOwner();
  if (!owner.ok) {
    return NextResponse.json({ error: "Not authorized." }, { status: owner.reason === "unauthenticated" ? 401 : 403 });
  }

  const admin = createAdminClient();
  try {
    const tokens = await getFreshTokens(admin, owner.studioId, provider);
    if (!tokens) {
      return NextResponse.json({ error: "Connect this account first." }, { status: 409 });
    }
    const result = await provider.runImport({ admin, studioId: owner.studioId, tokens });
    await updateIntegrationProjection(admin, owner.studioId, provider.platform, {
      lastSyncAt: new Date().toISOString(),
      importedCount: result.count,
      importedLabel: result.label,
      errorMessage: undefined,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(`[integrations:${platform}] import failed:`, error);
    await updateIntegrationProjection(admin, owner.studioId, provider.platform, {
      status: "error",
      errorMessage: "Last sync failed — try again or reconnect.",
    });
    return NextResponse.json({ error: "Import failed. Try again or reconnect the account." }, { status: 502 });
  }
}

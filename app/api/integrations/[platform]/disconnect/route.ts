import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOAuthProvider } from "@/lib/integrations/providers";
import {
  deleteConnection,
  getConnectionTokens,
  updateIntegrationProjection,
} from "@/lib/integrations/connections";
import { requireStudioOwner } from "@/lib/integrations/route-helpers";

/** Revokes (best effort) and deletes an OAuth connection, and clears the
 * platform's record from studios.integrations. */
export async function POST(_request: NextRequest, context: { params: Promise<{ platform: string }> }) {
  const { platform } = await context.params;

  const provider = getOAuthProvider(platform);
  if (!provider) return NextResponse.json({ error: "Unknown platform." }, { status: 404 });

  const owner = await requireStudioOwner();
  if (!owner.ok) {
    return NextResponse.json({ error: "Not authorized." }, { status: owner.reason === "unauthenticated" ? 401 : 403 });
  }

  const admin = createAdminClient();
  const tokens = await getConnectionTokens(admin, owner.studioId, provider.platform);
  if (tokens && provider.revoke) {
    try {
      await provider.revoke(tokens);
    } catch (error) {
      console.error(`[integrations:${platform}] revoke failed (continuing):`, error);
    }
  }
  await deleteConnection(admin, owner.studioId, provider.platform);
  await updateIntegrationProjection(admin, owner.studioId, provider.platform, null);

  return NextResponse.json({ success: true });
}

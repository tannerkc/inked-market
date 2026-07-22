import { IMAGE_LIMITS } from "@/lib/utils/image-upload";
import { instagramHandle } from "@/lib/utils/external-links";
import type { ExternalAccount, ImportContext, ImportResult, OAuthProvider, TokenSet } from "../types";

/**
 * Meta providers.
 *
 * Instagram uses "Instagram API with Instagram Login" (Business Login) — no
 * Facebook Page required; works for professional (business/creator) accounts.
 * Until the Meta app passes App Review + (free) Business Verification, only
 * users with an app role / Instagram Tester role can connect.
 *
 * Facebook uses standard FB Login with pages_show_list to link the studio's
 * Page. Same dev-mode constraint applies.
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const IG_GRAPH = "https://graph.instagram.com";
const FB_GRAPH = "https://graph.facebook.com";
const BUCKET = "studio-images";

async function getJson(url: string, label: string): Promise<Record<string, unknown>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

// ─── Instagram ──────────────────────────────────────────────────────────────

const igAppId = () => process.env.INSTAGRAM_APP_ID ?? "";
const igAppSecret = () => process.env.INSTAGRAM_APP_SECRET ?? "";

interface IgMedia {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  /** Omitted by Meta for copyright-flagged media — always guard. */
  media_url?: string;
}

export const instagramProvider: OAuthProvider = {
  platform: "instagram",
  isConfigured: () => Boolean(igAppId() && igAppSecret()),
  usesPkce: false,

  authorizeUrl({ redirectUri, state }) {
    const params = new URLSearchParams({
      client_id: igAppId(),
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "instagram_business_basic",
      state,
    });
    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  },

  async exchangeCode({ code, redirectUri }) {
    // Short-lived exchange (1h). Meta wraps this response in data[].
    const res = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: igAppId(),
        client_secret: igAppSecret(),
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });
    if (!res.ok) throw new Error(`Instagram token exchange failed (${res.status}): ${await res.text()}`);
    const raw = (await res.json()) as
      | { data: { access_token: string }[] }
      | { access_token: string };
    const shortLived = "data" in raw ? raw.data[0]?.access_token : raw.access_token;
    if (!shortLived) throw new Error("Instagram returned no access token.");

    // Long-lived exchange (60 days).
    const longLived = await getJson(
      `${IG_GRAPH}/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(igAppSecret())}&access_token=${encodeURIComponent(shortLived)}`,
      "Instagram long-lived exchange",
    );
    const expiresIn = Number(longLived.expires_in ?? 60 * 60 * 24 * 60);
    return {
      accessToken: String(longLived.access_token),
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      scope: "instagram_business_basic",
    };
  },

  // Long-lived tokens refresh via ig_refresh_token (token must be >=24h old;
  // dies permanently at 60 days without refresh — re-auth required then).
  async refreshTokens(tokens: TokenSet) {
    const json = await getJson(
      `${IG_GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(tokens.accessToken)}`,
      "Instagram token refresh",
    );
    const expiresIn = Number(json.expires_in ?? 60 * 60 * 24 * 60);
    return {
      accessToken: String(json.access_token),
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      scope: tokens.scope,
    };
  },

  async fetchAccount(tokens): Promise<ExternalAccount> {
    const json = await getJson(
      `${IG_GRAPH}/${GRAPH_VERSION}/me?fields=user_id,username&access_token=${encodeURIComponent(tokens.accessToken)}`,
      "Instagram profile fetch",
    );
    const username = String(json.username ?? "");
    if (!username) throw new Error("Instagram returned no username.");
    return {
      id: String(json.user_id ?? json.id ?? username),
      name: `@${username}`,
      url: `https://www.instagram.com/${username}/`,
    };
  },

  connectProjection(account) {
    return account.url ? { linkUrl: account.url } : {};
  },

  /** Fill the studio's Instagram social field when it's still empty. */
  async afterConnect({ admin, studioId, account }) {
    const handle = instagramHandle(account.url);
    if (!handle) return;
    const { data } = await admin.from("studios").select("instagram").eq("id", studioId).single();
    if (data && !data.instagram) {
      await admin
        .from("studios")
        .update({ instagram: `@${handle}`, updated_at: new Date().toISOString() })
        .eq("id", studioId);
    }
  },

  /**
   * Portfolio import: copy recent photos into Supabase Storage and append to
   * the gallery. IG CDN URLs expire, so media is never hot-linked.
   */
  async runImport({ admin, studioId, tokens }: ImportContext): Promise<ImportResult> {
    const json = await getJson(
      `${IG_GRAPH}/${GRAPH_VERSION}/me/media?fields=id,media_type,media_url&limit=24&access_token=${encodeURIComponent(tokens.accessToken)}`,
      "Instagram media fetch",
    );
    const media = ((json.data as IgMedia[] | undefined) ?? []).filter(
      (m) => (m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM") && m.media_url,
    );

    const { data: studio, error } = await admin.from("studios").select("images").eq("id", studioId).single();
    if (error) throw new Error(`Failed to read gallery: ${error.message}`);
    const images: string[] = [...((studio?.images as string[] | undefined) ?? [])];

    let added = 0;
    for (const item of media) {
      if (images.length >= IMAGE_LIMITS.maxGalleryPhotos) break;
      const path = `${studioId}/instagram-${item.id}.jpg`;
      if (images.some((url) => url.includes(`/instagram-${item.id}.`))) continue; // already imported

      const download = await fetch(item.media_url!);
      if (!download.ok) continue;
      const bytes = Buffer.from(await download.arrayBuffer());
      const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
        contentType: download.headers.get("content-type") ?? "image/jpeg",
        upsert: true,
      });
      if (uploadError) continue;
      images.push(admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
      added += 1;
    }

    if (added > 0) {
      const { error: writeError } = await admin
        .from("studios")
        .update({ images, updated_at: new Date().toISOString() })
        .eq("id", studioId);
      if (writeError) throw new Error(`Failed to save imported photos: ${writeError.message}`);
    }
    return { count: added, label: "photos" };
  },
};

// ─── Facebook ───────────────────────────────────────────────────────────────

const fbAppId = () => process.env.META_APP_ID ?? "";
const fbAppSecret = () => process.env.META_APP_SECRET ?? "";

export const facebookProvider: OAuthProvider = {
  platform: "facebook",
  isConfigured: () => Boolean(fbAppId() && fbAppSecret()),
  usesPkce: false,

  authorizeUrl({ redirectUri, state }) {
    const params = new URLSearchParams({
      client_id: fbAppId(),
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "pages_show_list",
      state,
    });
    return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
  },

  async exchangeCode({ code, redirectUri }) {
    const short = await getJson(
      `${FB_GRAPH}/${GRAPH_VERSION}/oauth/access_token?client_id=${encodeURIComponent(fbAppId())}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(fbAppSecret())}&code=${encodeURIComponent(code)}`,
      "Facebook token exchange",
    );
    // Long-lived user token (~60 days), server-side exchange.
    const long = await getJson(
      `${FB_GRAPH}/${GRAPH_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(fbAppId())}&client_secret=${encodeURIComponent(fbAppSecret())}&fb_exchange_token=${encodeURIComponent(String(short.access_token))}`,
      "Facebook long-lived exchange",
    );
    const expiresIn = Number(long.expires_in ?? 60 * 60 * 24 * 60);
    return {
      accessToken: String(long.access_token),
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      scope: "pages_show_list",
    };
  },

  async fetchAccount(tokens): Promise<ExternalAccount> {
    const json = await getJson(
      `${FB_GRAPH}/${GRAPH_VERSION}/me/accounts?fields=name,link&access_token=${encodeURIComponent(tokens.accessToken)}`,
      "Facebook pages fetch",
    );
    const page = (json.data as { id: string; name: string; link?: string }[] | undefined)?.[0];
    if (!page) throw new Error("No Facebook Page on this account — create one first, then reconnect.");
    return { id: page.id, name: page.name, url: page.link };
  },

  connectProjection(account) {
    return account.url ? { linkUrl: account.url } : {};
  },

  /** Fill the studio's Facebook social field when it's still empty. */
  async afterConnect({ admin, studioId, account }) {
    if (!account.url) return;
    const { data } = await admin.from("studios").select("facebook").eq("id", studioId).single();
    if (data && !data.facebook) {
      await admin
        .from("studios")
        .update({ facebook: account.url, updated_at: new Date().toISOString() })
        .eq("id", studioId);
    }
  },

  async revoke(tokens) {
    await fetch(
      `${FB_GRAPH}/${GRAPH_VERSION}/me/permissions?access_token=${encodeURIComponent(tokens.accessToken)}`,
      { method: "DELETE" },
    );
  },
};

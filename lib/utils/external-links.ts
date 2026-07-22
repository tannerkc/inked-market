/**
 * Canonical builders for every external URL the app renders.
 * All handle/URL normalization lives here — components never assemble
 * third-party URLs inline. A null return means "don't render this link":
 * stored values are user input and must never reach an href unvalidated.
 *
 * Link formats follow each vendor's official conventions:
 * - Google Maps URLs: developers.google.com/maps/documentation/urls/get-started
 * - Google Maps Embed API: developers.google.com/maps/documentation/embed (key-gated, free/unlimited)
 * - Google review link: support.google.com/business/answer/9273900
 * - Instagram DM links: ig.me/m/{username} (Meta business-messaging docs)
 */

export type SocialPlatform = "instagram" | "tiktok" | "facebook" | "x" | "website";

// ─── Shared parsing ─────────────────────────────────────────────────────────

/** Parse user input as an http(s) URL, tolerating a missing protocol. */
export function parseHttpUrl(raw: string | undefined | null): URL | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

/** True when a URL's hostname is the given registrable host or a subdomain of it. */
export function urlHostMatches(url: URL, host: string): boolean {
  const hostname = url.hostname.toLowerCase();
  return hostname === host || hostname.endsWith(`.${host}`);
}

// ─── Social profiles ────────────────────────────────────────────────────────

interface SocialPlatformDef {
  hosts: string[];
  handlePattern: RegExp;
  fromHandle: (handle: string) => string;
}

const SOCIAL_PLATFORM_DEFS: Record<Exclude<SocialPlatform, "website">, SocialPlatformDef> = {
  instagram: {
    hosts: ["instagram.com"],
    handlePattern: /^[a-z0-9._]{1,30}$/i,
    fromHandle: (h) => `https://www.instagram.com/${h}/`,
  },
  tiktok: {
    hosts: ["tiktok.com"],
    handlePattern: /^[a-z0-9._]{1,24}$/i,
    fromHandle: (h) => `https://www.tiktok.com/@${h}`,
  },
  facebook: {
    hosts: ["facebook.com", "fb.com"],
    handlePattern: /^[a-z0-9.-]{1,75}$/i,
    fromHandle: (h) => `https://www.facebook.com/${h}`,
  },
  x: {
    hosts: ["x.com", "twitter.com"],
    handlePattern: /^\w{1,15}$/,
    fromHandle: (h) => `https://x.com/${h}`,
  },
};

/**
 * Normalize a stored social value (handle, @handle, bare or full profile URL)
 * into a canonical https profile URL. Returns null for anything that can't be
 * confidently resolved — a wrong-host URL in an "Instagram" field is dropped,
 * not rendered.
 */
export function socialUrl(platform: SocialPlatform, value: string | undefined | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (platform === "website") {
    const url = parseHttpUrl(raw);
    return url && url.hostname.includes(".") ? url.toString() : null;
  }

  const def = SOCIAL_PLATFORM_DEFS[platform];
  const asUrl = parseHttpUrl(raw);

  // A pasted profile URL: keep only when the host actually belongs to the platform.
  if (asUrl && def.hosts.some((h) => urlHostMatches(asUrl, h))) {
    return asUrl.pathname.length > 1 ? `https://www.${def.hosts[0]}${asUrl.pathname}${asUrl.search}` : null;
  }
  if (/^https?:\/\//i.test(raw)) return null;

  // Otherwise treat as a handle (dots in handles parse as hostnames above — fall through here).
  const handle = raw.replace(/^@/, "");
  return def.handlePattern.test(handle) ? def.fromHandle(handle) : null;
}

export interface ResolvedSocialLink {
  key: SocialPlatform;
  href: string;
  label: string;
}

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X",
  website: "Website",
};

/** Resolve a studio/artist's social fields into renderable links, skipping invalid values. */
export function resolveSocialLinks(source: {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  x?: string;
  website?: string;
}): ResolvedSocialLink[] {
  const links: ResolvedSocialLink[] = [];
  for (const key of ["instagram", "tiktok", "facebook", "x", "website"] as const) {
    const href = socialUrl(key, source[key]);
    if (href) links.push({ key, href, label: SOCIAL_LABELS[key] });
  }
  return links;
}

/** Display handle for a stored Instagram value (accepts handle, @handle, or profile URL). */
export function instagramHandle(value: string | undefined | null): string | null {
  const profile = socialUrl("instagram", value);
  if (!profile) return null;
  const handle = new URL(profile).pathname.replaceAll("/", "");
  return handle || null;
}

/** Official Instagram DM deep link (ig.me). Null when the handle can't be resolved. */
export function instagramDmUrl(value: string | undefined | null): string | null {
  const handle = instagramHandle(value);
  return handle ? `https://ig.me/m/${handle}` : null;
}

// ─── Contact ────────────────────────────────────────────────────────────────

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function mailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}

// ─── Google Maps (official Maps URLs API — keyless links) ───────────────────

export function mapsSearchUrl(query: string, placeId?: string): string {
  const params = new URLSearchParams({ api: "1", query });
  if (placeId) params.set("query_place_id", placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function mapsDirectionsUrl(destination: string, placeId?: string): string {
  const params = new URLSearchParams({ api: "1", destination });
  if (placeId) params.set("destination_place_id", placeId);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Google Maps Embed API iframe src (free, unlimited, but key-required).
 * Null without a key — callers keep their designed placeholder; the keyless
 * `output=embed` hack is undocumented and fragile, so we never use it.
 */
export function mapsEmbedUrl(
  query: string,
  placeId?: string,
  key: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY,
): string | null {
  if (!key || !query) return null;
  const params = new URLSearchParams({ key, q: placeId ? `place_id:${placeId}` : query });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

// ─── Review platform deep links ─────────────────────────────────────────────

export function googleWriteReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

/** Derive Yelp's write-review URL from a stored /biz/ profile URL. */
export function yelpWriteReviewUrl(profileUrl: string): string | null {
  const url = parseHttpUrl(profileUrl);
  if (!url || !urlHostMatches(url, "yelp.com")) return null;
  const alias = /^\/biz\/([^/?#]+)/.exec(url.pathname)?.[1];
  return alias ? `https://www.yelp.com/writeareview/biz/${alias}` : null;
}

/** Derive Trustpilot's evaluate URL from a stored /review/{domain} URL. */
export function trustpilotWriteReviewUrl(profileUrl: string): string | null {
  const url = parseHttpUrl(profileUrl);
  if (!url || !urlHostMatches(url, "trustpilot.com")) return null;
  const domain = /^\/review\/([^/?#]+)/.exec(url.pathname)?.[1];
  return domain ? `https://www.trustpilot.com/evaluate/${domain}` : null;
}

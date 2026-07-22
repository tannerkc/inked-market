/**
 * Assert-based self-checks for the builder truth model.
 * Run: npx tsx scripts/check-builder.ts
 * No test framework by design — tsx is already a devDependency.
 */
import assert from "node:assert/strict";
import { remapLegacyTemplate, LEGACY_TEMPLATE_MAP } from "../lib/utils/legacy-template";
import { templates, templateList } from "../lib/data/templates";
import type { StudioThemeConfig } from "../lib/types/builder";
import { defaultThemeConfig } from "../lib/data/theme-presets";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

// ─── Legacy template remap ───────────────────────────────────────────────
check("7 templates remain after consolidation", () => {
  assert.equal(templateList.length, 7);
  assert.ok(!("immersive-dark" in templates));
  assert.ok(!("clean-minimal" in templates));
});

check("legacy slugs remap to survivors", () => {
  assert.equal(LEGACY_TEMPLATE_MAP["immersive-dark"], "dark-cinematic");
  assert.equal(LEGACY_TEMPLATE_MAP["clean-minimal"], "studio-minimal");
});

check("remapLegacyTemplate rewrites retired slug, passes through current", () => {
  const legacy = { ...defaultThemeConfig, template: "immersive-dark" } as unknown as StudioThemeConfig;
  assert.equal(remapLegacyTemplate(legacy).template, "dark-cinematic");
  const current: StudioThemeConfig = { ...defaultThemeConfig, template: "fine-line" };
  assert.equal(remapLegacyTemplate(current).template, "fine-line");
  assert.equal(remapLegacyTemplate(current), current); // no clone when unchanged
});

// ─── StudioData mappers ──────────────────────────────────────────────────
import {
  mapDbStudioToStudioData,
  mapStudioDataToDbStudio,
  type DbStudio,
} from "../lib/supabase/types";
import { heroCollagePhotos, supportsMultiCover } from "../lib/utils/studio-content";

const DB_ROW: DbStudio = {
  id: "row-uuid-1", name: "Iron & Ink", slug: "iron-ink", slug_customized_at: null, source: "organic",
  google_place_id: null, claimed_by: "owner-1", claimed_at: null,
  address: "1 Main St", city: "Portland", state: "OR", zip_code: "97214",
  latitude: null, longitude: null, phone: "555", email: "a@b.c", website: null,
  bio: "story", description: null, instagram: null, tiktok: null, facebook: null,
  hours: null, specialties: [], services: [], auto_specialties: false,
  integrations: null, theme_config: null, published_theme_config: null,
  published_at: null, rating: 4.5, review_count: 3,
  profile_image: null, cover_image: "https://x/cover.webp",
  cover_image_original: null, cover_crop: null, cover_focal: null,
  cover_images: [],
  images: ["https://x/1.webp", "https://x/2.webp"],
  is_visible: true, created_at: "2026-01-01", updated_at: "2026-01-02",
};

check("mapDbStudioToStudioData carries id, images, coverImage", () => {
  const d = mapDbStudioToStudioData(DB_ROW);
  assert.equal(d.id, "row-uuid-1");
  assert.deepEqual(d.images, ["https://x/1.webp", "https://x/2.webp"]);
  assert.equal(d.coverImage, "https://x/cover.webp");
});

check("mapStudioDataToDbStudio writes images, never id", () => {
  const mapped = mapStudioDataToDbStudio({ id: "should-not-write", images: ["u1"] });
  assert.deepEqual(mapped.images, ["u1"]);
  assert.ok(!("id" in mapped));
});

check("publish fields round-trip; template-less jsonb never counts as published", () => {
  const published = { ...defaultThemeConfig } as unknown as Record<string, unknown>;
  const d = mapDbStudioToStudioData({
    ...DB_ROW, published_theme_config: published, published_at: "2026-07-13",
  });
  assert.ok(d.publishedThemeConfig);
  assert.equal(d.publishedAt, "2026-07-13");
  // {} placeholder (no template key) must not read as a live site
  const empty = mapDbStudioToStudioData({ ...DB_ROW, published_theme_config: {} });
  assert.equal(empty.publishedThemeConfig, undefined);
  const mapped = mapStudioDataToDbStudio({
    publishedThemeConfig: defaultThemeConfig, publishedAt: "2026-07-13",
  });
  assert.equal(mapped.published_theme_config, defaultThemeConfig);
  assert.equal(mapped.published_at, "2026-07-13");
  // explicit undefined clears (un-publish on downgrade/cancel)...
  const cleared = mapStudioDataToDbStudio({ publishedThemeConfig: undefined, publishedAt: undefined });
  assert.equal(cleared.published_theme_config, null);
  assert.equal(cleared.published_at, null);
  // ...but omitted keys stay absent (merge-patch never wipes)
  const untouched = mapStudioDataToDbStudio({ name: "x" });
  assert.ok(!("published_theme_config" in untouched));
  assert.ok(!("published_at" in untouched));
});

// ─── Studio slugs ─────────────────────────────────────────────────────────
import { buildStudioSlug, sanitizeSlugInput } from "../lib/utils/studio-slug";

check("pretty slugs: name-city-state, sanitizer normalizes typed input", () => {
  assert.equal(buildStudioSlug("Drunken Regurts", "Raleigh", "NC"), "drunken-regurts-raleigh-nc");
  assert.equal(buildStudioSlug("Iron & Ink"), "iron-ink");
  assert.equal(sanitizeSlugInput("My Cool--Studio"), "my-cool-studio");
  assert.equal(sanitizeSlugInput("-Foo Bar!"), "foo-bar-");
  // slug is writable through the mapper (custom URL editor)
  assert.equal(mapStudioDataToDbStudio({ slug: "my-shop" }).slug, "my-shop");
});

// ─── Content predicates + booking link ───────────────────────────────────
import { getBookingLink, hasBio, hasHours, hasAnySocial, hasContact, hasPhotos } from "../lib/utils/studio-content";
import { studioSiteDataFromStudioData, type StudioSiteData } from "../components/studio-site/studio-site-data";
import type { StudioIntegrations } from "../lib/types/integrations";

const EMPTY_SITE: StudioSiteData = studioSiteDataFromStudioData(null);

check("empty site data fails every predicate", () => {
  assert.equal(hasBio(EMPTY_SITE), false);
  assert.equal(hasHours(EMPTY_SITE), false);
  assert.equal(hasAnySocial(EMPTY_SITE), false);
  assert.equal(hasContact(EMPTY_SITE), false);
  assert.equal(hasPhotos(EMPTY_SITE), false);
});

check("getBookingLink picks first connected booking platform", () => {
  const integrations: StudioIntegrations = {
    google: { status: "connected", linkUrl: "https://g.co/maps/x" }, // reviews category — ignored
    booksy: { status: "connected", linkUrl: "https://booksy.com/en-us/x" },
  };
  const link = getBookingLink(integrations);
  assert.equal(link?.url, "https://booksy.com/en-us/x");
  assert.equal(link?.platformName, "Booksy");
  assert.equal(getBookingLink(undefined), null);
  assert.equal(getBookingLink({ booksy: { status: "error", linkUrl: "https://x" } }), null);
});

check("studioSiteDataFromStudioData maps coverImage, images, bookingLink", () => {
  const d = studioSiteDataFromStudioData({
    name: "T", specialties: [], services: [], hours: {}, autoSpecialties: false,
    coverImage: "https://x/c.webp", images: ["https://x/1.webp"],
    integrations: { booksy: { status: "connected", linkUrl: "https://booksy.com/en-us/x" } },
  });
  assert.equal(d.coverImage, "https://x/c.webp");
  assert.deepEqual(d.images, ["https://x/1.webp"]);
  assert.equal(d.bookingLink?.platformName, "Booksy");
  assert.equal(hasPhotos(d), true);
});

// ─── Demo gating (the core truth-model guarantee) ────────────────────────
import { buildBuilderSiteData, DEMO_SITE_ARTISTS } from "../components/studio-site/demo-site-data";

check("Sample OFF leaks zero demo content", () => {
  const d = buildBuilderSiteData(null, false);
  assert.deepEqual(d.artists, []);
  assert.deepEqual(d.reviews, []);
  assert.equal(d.ratingAverage, undefined);
  assert.equal(d.reviewCount ?? 0, 0);
});

check("Sample OFF passes real live extras through", () => {
  const d = buildBuilderSiteData(null, false, {
    artists: [{ id: "a1", name: "Real Artist", initials: "RA", styles: [], photoCount: 0, photos: [] }],
    reviews: [{ author: "Real", stars: 5, text: "Great" }],
    ratingAverage: "5.0",
    reviewCount: 1,
  });
  assert.equal(d.artists[0]?.name, "Real Artist");
  assert.equal(d.reviews.length, 1);
  assert.equal(d.ratingAverage, "5.0");
});

check("Sample ON injects the full demo", () => {
  const d = buildBuilderSiteData(null, true);
  assert.equal(d.artists.length, DEMO_SITE_ARTISTS.length);
  assert.equal(d.reviews.length, 8);
  assert.equal(d.ratingAverage, "4.9");
  assert.equal(d.name, "Iron & Ink");
});

check("isSample flags only the Sample branch", () => {
  assert.equal(buildBuilderSiteData(null, true).isSample, true);
  assert.equal(buildBuilderSiteData(null, false).isSample ?? false, false);
});

// ─── Upload path parsing ─────────────────────────────────────────────────
import { storagePathFromPublicUrl } from "../lib/utils/image-upload";

check("storagePathFromPublicUrl extracts bucket-relative path", () => {
  assert.equal(
    storagePathFromPublicUrl(
      "https://cktvpfenygxhfaodihbz.supabase.co/storage/v1/object/public/studio-images/abc-123/photo.webp",
    ),
    "abc-123/photo.webp",
  );
  assert.equal(storagePathFromPublicUrl("https://example.com/not-storage.png"), null);
});

// ─── Setup progress ──────────────────────────────────────────────────────
import { computeSetupItems } from "../lib/hooks/use-setup-progress";

check("empty studio: no required item can be done", () => {
  const items = computeSetupItems(EMPTY_SITE, defaultThemeConfig, 0);
  const byId = new Map(items.map((i) => [i.id, i]));
  assert.equal(byId.get("story")?.done, false);
  assert.equal(byId.get("photos")?.done, false);
  assert.equal(byId.get("contact-hours")?.done, false);
  assert.equal(byId.get("socials")?.done, false);
  assert.equal(byId.get("booking")?.done, false);
  assert.equal(byId.get("artists")?.optional, true);
});

check("filled studio: everything done", () => {
  const full: StudioSiteData = {
    ...EMPTY_SITE,
    bio: "story",
    phone: "555",
    email: "a@b.c",
    hours: { Monday: { open: "10:00 AM", close: "6:00 PM", closed: false } },
    instagram: "@x",
    images: ["u"],
    bookingLink: { url: "https://booksy.com/x", platformName: "Booksy" },
  };
  const cfgWithPolicy = {
    ...defaultThemeConfig,
    policies: [
      { id: "aftercare", type: "standard" as const, title: "Aftercare", enabled: true, body: "", featured: false, order: 0 },
    ],
  };
  const items = computeSetupItems(full, cfgWithPolicy, 2);
  assert.ok(items.every((i) => i.done));
});

// ─── Template signature defaults ─────────────────────────────────────────
check("signature hero defaults", () => {
  assert.equal(templates["bold-editorial"].defaults.heroLayout, "masthead");
  assert.equal(templates["studio-minimal"].defaults.heroLayout, "grid-overlay");
  assert.equal(templates["gutter-punk"].defaults.heroLayout, "zine");
});

check("signature gallery defaults", () => {
  assert.equal(templates["dark-cinematic"].defaults.galleryLayout, "film-strip");
  assert.equal(templates["traditional-flash"].defaults.galleryLayout, "flash-sheet");
});

// ─── Editor chrome preference precedence ─────────────────────────────────
import { resolveEditorChrome } from "../lib/utils/editor-chrome";

check("local editor preference beats the DB-captured mode/tier", () => {
  // The reported bug: DB config saved in split kept overriding the toggles.
  const dbCaptured = { builderMode: "split" as const, builderTier: "custom" as const };
  assert.deepEqual(
    resolveEditorChrome({ mode: "inline", tier: "flash" }, dbCaptured),
    { mode: "inline", tier: "flash" },
  );
  // No local preference yet (new device) → DB seeds it.
  assert.deepEqual(
    resolveEditorChrome({ mode: null, tier: null }, dbCaptured),
    { mode: "split", tier: "custom" },
  );
  // Nothing anywhere → defaults.
  assert.deepEqual(
    resolveEditorChrome({ mode: null, tier: null }, null),
    { mode: "inline", tier: "flash" },
  );
});

// ─── External links: normalization is the security boundary ─────────────
import {
  socialUrl,
  instagramHandle,
  instagramDmUrl,
  mapsSearchUrl,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  yelpWriteReviewUrl,
  trustpilotWriteReviewUrl,
  googleWriteReviewUrl,
} from "../lib/utils/external-links";

check("socialUrl normalizes handles, @handles, and pasted URLs", () => {
  assert.equal(socialUrl("instagram", "@ironink"), "https://www.instagram.com/ironink/");
  assert.equal(socialUrl("instagram", "iron.ink"), "https://www.instagram.com/iron.ink/");
  assert.equal(socialUrl("instagram", "https://instagram.com/ironink"), "https://www.instagram.com/ironink");
  assert.equal(socialUrl("tiktok", "@ironink"), "https://www.tiktok.com/@ironink");
  assert.equal(socialUrl("facebook", "facebook.com/ironink"), "https://www.facebook.com/ironink");
  assert.equal(socialUrl("website", "ironink.com"), "https://ironink.com/");
});

check("socialUrl drops anything it can't confidently resolve", () => {
  assert.equal(socialUrl("instagram", "https://evil.com/ironink"), null); // wrong host in an Instagram field
  assert.equal(socialUrl("instagram", "not a handle!"), null);
  assert.equal(socialUrl("website", "javascript:alert(1)"), null);
  assert.equal(socialUrl("instagram", ""), null);
  assert.equal(socialUrl("instagram", undefined), null);
});

check("instagram handle + official ig.me DM link", () => {
  assert.equal(instagramHandle("https://www.instagram.com/ironink/"), "ironink");
  assert.equal(instagramDmUrl("@ironink"), "https://ig.me/m/ironink");
  assert.equal(instagramDmUrl("nope !"), null);
});

check("Google Maps official URL builders", () => {
  assert.ok(mapsSearchUrl("1 Main St, Portland, OR").startsWith("https://www.google.com/maps/search/?api=1&query="));
  assert.ok(mapsDirectionsUrl("1 Main St", "PLACE123").includes("destination_place_id=PLACE123"));
  assert.equal(mapsEmbedUrl("1 Main St", undefined, undefined), null); // no key → designed placeholder stays
  assert.equal(
    mapsEmbedUrl("1 Main St", "PLACE123", "KEY"),
    "https://www.google.com/maps/embed/v1/place?key=KEY&q=place_id%3APLACE123",
  );
});

check("write-review deep links derive from stored profile URLs", () => {
  assert.equal(
    yelpWriteReviewUrl("https://www.yelp.com/biz/iron-ink-portland"),
    "https://www.yelp.com/writeareview/biz/iron-ink-portland",
  );
  assert.equal(yelpWriteReviewUrl("https://evil.com/biz/x"), null);
  assert.equal(
    trustpilotWriteReviewUrl("https://www.trustpilot.com/review/ironink.com"),
    "https://www.trustpilot.com/evaluate/ironink.com",
  );
  assert.ok(googleWriteReviewUrl("PLACE123").includes("writereview?placeid=PLACE123"));
});

// ─── Booking embeds: only official vendors, only their own https hosts ───
import { getBookingEmbed, getReviewProfileLinks } from "../lib/utils/studio-content";

check("getBookingEmbed embeds Calendly, never link-out vendors", () => {
  const calendly: StudioIntegrations = {
    calendly: { status: "connected", linkUrl: "https://calendly.com/ironink/consult" },
  };
  assert.equal(getBookingEmbed(calendly)?.src, "https://calendly.com/ironink/consult");
  const booksy: StudioIntegrations = {
    booksy: { status: "connected", linkUrl: "https://booksy.com/en-us/x" },
  };
  assert.equal(getBookingEmbed(booksy), null);
});

check("getBookingEmbed rejects tampered or non-https URLs at render time", () => {
  assert.equal(
    getBookingEmbed({ calendly: { status: "connected", linkUrl: "https://calendly.com.evil.com/x" } }),
    null,
  );
  assert.equal(
    getBookingEmbed({ calendly: { status: "connected", linkUrl: "http://calendly.com/x" } }),
    null,
  );
});

check("booking link and embed always agree on the active platform", () => {
  // Precedence is registry order. Calendly outranks Booksy → both resolve Calendly.
  const calendlyWins: StudioIntegrations = {
    booksy: { status: "connected", linkUrl: "https://booksy.com/en-us/x" },
    calendly: { status: "connected", linkUrl: "https://calendly.com/ironink" },
  };
  assert.equal(getBookingLink(calendlyWins)?.platformName, "Calendly");
  assert.equal(getBookingEmbed(calendlyWins)?.platformName, "Calendly");

  // Square outranks Calendly but is link-out only → the widget must NOT
  // embed the lower-ranked Calendly while the CTA links Square.
  const squareWins: StudioIntegrations = {
    square: { status: "connected", linkUrl: "https://square.site/book/L123/iron-ink" },
    calendly: { status: "connected", linkUrl: "https://calendly.com/ironink" },
  };
  assert.equal(getBookingLink(squareWins)?.platformName, "Square Appointments");
  assert.equal(getBookingEmbed(squareWins), null);
});

check("getReviewProfileLinks resolves connected review platforms", () => {
  const integrations: StudioIntegrations = {
    google: { status: "connected", linkUrl: "https://maps.google.com/?cid=12345" },
    yelp: { status: "connected", linkUrl: "https://www.yelp.com/biz/iron-ink-portland" },
    booksy: { status: "connected", linkUrl: "https://booksy.com/en-us/x" }, // booking — excluded
  };
  const links = getReviewProfileLinks(integrations, "PLACE123");
  assert.deepEqual(links.map((l) => l.platform), ["google", "yelp"]);
  assert.ok(links[0]?.writeReviewUrl?.includes("placeid=PLACE123"));
  assert.equal(links[1]?.writeReviewUrl, "https://www.yelp.com/writeareview/biz/iron-ink-portland");
});

// ─── Unified integrations shape end-to-end ────────────────────────────────
import { studioSiteDataFromStudio } from "../components/studio-site/studio-site-data";
import { getStudio } from "../lib/data/shops";

check("mock-shop Studio resolves booking + review links via the record map", () => {
  const shop = getStudio("1");
  assert.ok(shop, "mock shop 1 exists");
  const site = studioSiteDataFromStudio(shop!);
  assert.equal(site.bookingLink?.url, "https://porter.ink/inkparadise/book");
  assert.equal(site.bookingEmbed, null); // other-booking is link-out only
  assert.deepEqual(site.reviewLinks.map((l) => l.platform), ["google", "yelp"]);
});

check("Sample mode never fabricates external review links or embeds", () => {
  const sample = buildBuilderSiteData(null, true);
  assert.deepEqual(sample.reviewLinks, []);
  assert.equal(sample.bookingEmbed ?? null, null);
});

check("googlePlaceId maps in from DB and is never written back", () => {
  const withPlace = mapDbStudioToStudioData({ ...DB_ROW, google_place_id: "PLACE123" });
  assert.equal(withPlace.googlePlaceId, "PLACE123");
  const mapped = mapStudioDataToDbStudio({ googlePlaceId: "PLACE123", name: "X" });
  assert.ok(!("google_place_id" in mapped));
});

// ─── Token sealing (AES-256-GCM) ─────────────────────────────────────────
process.env.INTEGRATIONS_TOKEN_KEY = process.env.INTEGRATIONS_TOKEN_KEY || "check-builder-key";
import { sealToken, openToken } from "../lib/integrations/crypto";

check("sealed tokens round-trip and reject tampering", () => {
  const sealed = sealToken("secret-access-token");
  assert.notEqual(sealed, "secret-access-token");
  assert.equal(openToken(sealed), "secret-access-token");
  const [v, iv, data, tag] = sealed.split(".");
  assert.throws(() => openToken(`${v}.${iv}.${data!.slice(0, -2)}xx.${tag}`));
});

// ─── Cover framing math ──────────────────────────────────────────────────
import {
  baseCropSize,
  clampCenter,
  cropRect,
  cropRegionStyle,
  focalPosition,
  suggestedAspectId,
  viewportFromRect,
  MAX_COVER_ZOOM,
} from "../lib/utils/cover-crop";

check("baseCropSize fits the largest rect of the aspect inside the image", () => {
  // 3:1 window on a 2:1 image → full width, half height... rectW = min(2000, 1000*3) = 2000; h = 2000/3/1000
  const wide = baseCropSize(2000, 1000, 3);
  assert.equal(wide.w, 1);
  assert.ok(Math.abs(wide.h - 2 / 3) < 1e-9);
  // 3:1 window on a tall 1:2 image → full width too, tiny height
  const tall = baseCropSize(1000, 2000, 3);
  assert.equal(tall.w, 1);
  assert.ok(Math.abs(tall.h - 1 / 6) < 1e-9);
  // 4:3 window on a 3:1 panorama → full height, partial width
  const pano = baseCropSize(3000, 1000, 4 / 3);
  assert.ok(Math.abs(pano.w - (1000 * (4 / 3)) / 3000) < 1e-9);
  assert.equal(pano.h, 1);
});

check("cropRect stays inside the image and honors zoom bounds", () => {
  // Center dragged far off-canvas → rect still clamped inside
  const r = cropRect(2000, 1000, 16 / 9, "16:9", 2, 0, 0, );
  assert.ok(r.x >= 0 && r.y >= 0);
  assert.ok(r.x + r.w <= 1 + 1e-9 && r.y + r.h <= 1 + 1e-9);
  // Zoom clamps to [1, MAX]
  const over = cropRect(2000, 1000, 16 / 9, "16:9", 99, 0.5, 0.5);
  const max = cropRect(2000, 1000, 16 / 9, "16:9", MAX_COVER_ZOOM, 0.5, 0.5);
  assert.ok(Math.abs(over.w - max.w) < 1e-9);
  const under = cropRect(2000, 1000, 16 / 9, "16:9", 0.2, 0.5, 0.5);
  const base = cropRect(2000, 1000, 16 / 9, "16:9", 1, 0.5, 0.5);
  assert.ok(Math.abs(under.w - base.w) < 1e-9);
});

check("viewportFromRect round-trips a saved crop", () => {
  const rect = cropRect(2400, 1600, 21 / 9, "21:9", 1.7, 0.62, 0.41);
  const vp = viewportFromRect(2400, 1600, 21 / 9, rect);
  const again = cropRect(2400, 1600, 21 / 9, "21:9", vp.zoom, vp.cx, vp.cy);
  for (const k of ["x", "y", "w", "h"] as const) {
    assert.ok(Math.abs(rect[k] - again[k]) < 1e-9, `${k} drifted`);
  }
});

check("clampCenter pins edge-hugging centers", () => {
  const size = { w: 0.5, h: 0.4 };
  assert.deepEqual(clampCenter(0, 1, size), { cx: 0.25, cy: 0.8 });
  assert.deepEqual(clampCenter(0.5, 0.5, size), { cx: 0.5, cy: 0.5 });
});

check("cropRegionStyle maps rects to CSS and guards full-size axes", () => {
  const style = cropRegionStyle("https://x/img.webp", { x: 0.25, y: 0, w: 0.5, h: 1 });
  assert.equal(style.backgroundSize, "200% 100%");
  assert.equal(style.backgroundPosition, "50% 50%"); // x: 0.25/(1-0.5)=50%; h=1 → centered guard
  const full = cropRegionStyle("https://x/img.webp", null);
  assert.equal(full.backgroundSize, "cover");
});

check("focalPosition clamps and defaults to center", () => {
  assert.equal(focalPosition(null), "center");
  assert.equal(focalPosition({ x: 0.25, y: 1.7 }), "25% 100%");
});

check("framing fields clear on explicit undefined but stay absent when omitted", () => {
  const cleared = mapStudioDataToDbStudio({
    coverImage: undefined,
    coverImageOriginal: undefined,
    coverCrop: undefined,
    coverFocal: undefined,
  });
  assert.equal(cleared.cover_image, null);
  assert.equal(cleared.cover_image_original, null);
  assert.equal(cleared.cover_crop, null);
  assert.equal(cleared.cover_focal, null);
  const untouched = mapStudioDataToDbStudio({ name: "x" });
  assert.ok(!("cover_image" in untouched));
  assert.ok(!("cover_crop" in untouched));
});

check("suggestedAspectId maps hero layouts and falls back", () => {
  assert.equal(suggestedAspectId("masthead"), "3:1");
  assert.equal(suggestedAspectId("split"), "4:3");
  assert.equal(suggestedAspectId("fullbleed"), "21:9");
  assert.equal(suggestedAspectId(undefined), "16:9");
  assert.equal(suggestedAspectId("not-a-layout"), "16:9");
});

// ─── Multi-photo hero collage ordering ───────────────────────────────────
check("heroCollagePhotos: single mode leads with cover, dedupes, passes through", () => {
  const photos = { images: ["a", "b", "cover"], coverImage: "cover", coverImages: ["x"] };
  assert.deepEqual(heroCollagePhotos(photos, {}), ["cover", "a", "b"]);
  assert.deepEqual(
    heroCollagePhotos({ images: ["a"], coverImage: undefined, coverImages: [] }, {}),
    ["a"],
  );
});

check("heroCollagePhotos: multi mode leads with dedicated covers, then cover + gallery", () => {
  const photos = { images: ["a", "x"], coverImage: "cover", coverImages: ["x", "y"] };
  assert.deepEqual(heroCollagePhotos(photos, { heroCoverMode: "multi" }), ["x", "y", "cover", "a"]);
  // No dedicated covers yet → graceful single-mode ordering.
  assert.deepEqual(
    heroCollagePhotos({ images: ["a"], coverImage: "cover", coverImages: [] }, { heroCoverMode: "multi" }),
    ["cover", "a"],
  );
});

check("supportsMultiCover gates to collage heroes only", () => {
  assert.equal(supportsMultiCover("grid-overlay"), true);
  assert.equal(supportsMultiCover("zine"), true);
  assert.equal(supportsMultiCover("split"), false);
  assert.equal(supportsMultiCover(undefined), false);
});

console.log(`\n${passed} checks passed`);

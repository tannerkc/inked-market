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

const DB_ROW: DbStudio = {
  id: "row-uuid-1", name: "Iron & Ink", slug: "iron-ink", source: "organic",
  google_place_id: null, claimed_by: "owner-1", claimed_at: null,
  address: "1 Main St", city: "Portland", state: "OR", zip_code: "97214",
  latitude: null, longitude: null, phone: "555", email: "a@b.c", website: null,
  bio: "story", description: null, instagram: null, tiktok: null, facebook: null,
  hours: null, specialties: [], services: [], auto_specialties: false,
  integrations: null, theme_config: null, rating: 4.5, review_count: 3,
  profile_image: null, cover_image: "https://x/cover.webp",
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

console.log(`\n${passed} checks passed`);

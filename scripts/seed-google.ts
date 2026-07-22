/**
 * Google Places Seeding Script
 *
 * Seeds the studios table with tattoo shops from Google Places API.
 *
 * Usage:
 *   npm run seed:google -- --city "Austin, TX"
 *   npm run seed:google -- --city "Austin, TX" --radius 25000 --dry-run
 *   npm run seed:google -- --city "Austin, TX" --limit 20
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const GOOGLE_TEXT_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const GOOGLE_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_PHOTO_URL =
  "https://maps.googleapis.com/maps/api/place/photo";

const MAX_PHOTOS_PER_STUDIO = 4;
const PAGE_TOKEN_DELAY_MS = 2500; // Google requires ~2s between page token requests

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string; width: number; height: number }[];
  business_status?: string;
}

interface PlaceDetails {
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    periods?: {
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }[];
  };
  url?: string; // Google Maps URL
  photos?: { photo_reference: string; width: number; height: number }[];
  // Some places have email in the editorial_summary or other fields,
  // but the API doesn't reliably return email
}

// ─── CLI arg parsing ────────────────────────────────────────────────────────

function parseArgs(): {
  city: string;
  radius: number;
  dryRun: boolean;
  limit: number;
} {
  const args = process.argv.slice(2);
  let city = "";
  let radius = 25000;
  let dryRun = false;
  let limit = 60;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--city":
        city = args[++i] ?? "";
        break;
      case "--radius":
        radius = parseInt(args[++i] ?? "0", 10);
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--limit":
        limit = parseInt(args[++i] ?? "0", 10);
        break;
    }
  }

  if (!city) {
    console.error('Usage: npm run seed:google -- --city "Austin, TX" [--radius 25000] [--dry-run] [--limit 60]');
    process.exit(1);
  }

  return { city, radius, dryRun, limit };
}

// ─── Google Places API helpers ──────────────────────────────────────────────

async function textSearch(
  query: string,
  pageToken?: string
): Promise<{ results: PlaceResult[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    query,
    key: GOOGLE_API_KEY,
    type: "tattoo_shop",
  });
  if (pageToken) params.set("pagetoken", pageToken);

  const res = await fetch(`${GOOGLE_TEXT_SEARCH_URL}?${params}`);
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.error(`Text Search error: ${data.status}`, data.error_message);
    return { results: [] };
  }

  return {
    results: data.results ?? [],
    nextPageToken: data.next_page_token,
  };
}

async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  const fields = [
    "formatted_phone_number",
    "website",
    "opening_hours",
    "url",
    "photos",
  ].join(",");

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_API_KEY,
    fields,
  });

  const res = await fetch(`${GOOGLE_DETAILS_URL}?${params}`);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error(`Details error for ${placeId}: ${data.status}`);
    return null;
  }

  return data.result;
}

async function downloadPhoto(
  photoReference: string,
  maxWidth: number = 800
): Promise<Buffer | null> {
  const params = new URLSearchParams({
    photoreference: photoReference,
    maxwidth: String(maxWidth),
    key: GOOGLE_API_KEY,
  });

  try {
    const res = await fetch(`${GOOGLE_PHOTO_URL}?${params}`);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCityState(city: string): { city: string; state: string } {
  const parts = city.split(",").map((p) => p.trim());
  return {
    city: parts[0] || city,
    state: parts[1] || "",
  };
}

function parseAddress(
  formatted: string
): { address: string; city: string; state: string; zipCode: string } {
  // Typical format: "123 Main St, Austin, TX 78701, USA"
  const parts = formatted.split(",").map((p) => p.trim());
  const address = parts[0] || "";
  const city = parts[1] || "";
  const stateZip = (parts[2] || "").split(" ");
  const state = stateZip[0] || "";
  const zipCode = stateZip[1] || "";
  return { address, city, state, zipCode };
}

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parseHours(
  periods?: PlaceDetails["opening_hours"]
): Record<string, { open: string; close: string; closed: boolean }> | null {
  if (!periods?.periods) return null;

  const hours: Record<string, { open: string; close: string; closed: boolean }> = {};

  // Initialize all days as closed
  for (const day of DAY_NAMES) {
    hours[day] = { open: "", close: "", closed: true };
  }

  for (const period of periods.periods) {
    const dayName = DAY_NAMES[period.open.day];
    if (!dayName) continue;

    const openTime = period.open.time.replace(/(\d{2})(\d{2})/, "$1:$2");
    const closeTime = period.close
      ? period.close.time.replace(/(\d{2})(\d{2})/, "$1:$2")
      : "23:59";

    hours[dayName] = { open: openTime, close: closeTime, closed: false };
  }

  return hours;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { city, radius, dryRun, limit } = parseArgs();
  const { city: parsedCity, state: parsedState } = parseCityState(city);

  console.log(`\n--- Seeding tattoo shops for: ${city} ---`);
  console.log(`Radius: ${radius}m | Dry run: ${dryRun} | Limit: ${limit}`);

  // Validate env vars
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE env vars. Check .env.local");
    process.exit(1);
  }
  if (!GOOGLE_API_KEY) {
    console.error("Missing GOOGLE_PLACES_API_KEY. Check .env.local");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Step 1: Text Search — collect all places
  console.log(`\nSearching: "tattoo shop in ${city}"...`);
  const allPlaces: PlaceResult[] = [];
  let pageToken: string | undefined;
  let searchPage = 1;

  do {
    const { results, nextPageToken } = await textSearch(
      `tattoo shop in ${city}`,
      pageToken
    );
    allPlaces.push(...results);
    console.log(`  Page ${searchPage}: ${results.length} results`);

    pageToken = nextPageToken;
    searchPage++;

    // Google requires a delay before using the next page token
    if (pageToken && allPlaces.length < limit) {
      await sleep(PAGE_TOKEN_DELAY_MS);
    }
  } while (pageToken && allPlaces.length < limit);

  const places = allPlaces.slice(0, limit);
  console.log(`\nTotal places found: ${allPlaces.length} (processing ${places.length})`);

  // Step 2: Check for existing entries
  const placeIds = places.map((p) => p.place_id);
  const { data: existing } = await supabase
    .from("studios")
    .select("google_place_id, name, city")
    .in("google_place_id", placeIds);

  const existingPlaceIds = new Set(
    (existing ?? []).map((e: { google_place_id: string }) => e.google_place_id)
  );

  // Also check for organic studios with matching normalized names in this city
  const { data: organicStudios } = await supabase
    .from("studios")
    .select("name, city")
    .eq("source", "organic")
    .ilike("city", parsedCity);

  const organicNames = new Set(
    (organicStudios ?? []).map((s: { name: string }) => normalize(s.name))
  );

  // Step 3: Process each place
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  let apiCalls = searchPage; // Count text search calls

  for (const place of places) {
    const label = `${place.name} (${place.place_id.slice(0, 12)}...)`;

    // Skip if already seeded
    if (existingPlaceIds.has(place.place_id)) {
      console.log(`  SKIP (duplicate): ${label}`);
      skipped++;
      continue;
    }

    // Skip if organic studio with same name exists
    if (organicNames.has(normalize(place.name))) {
      console.log(`  SKIP (organic match): ${label}`);
      skipped++;
      continue;
    }

    // Skip closed businesses
    if (place.business_status === "CLOSED_PERMANENTLY") {
      console.log(`  SKIP (closed): ${label}`);
      skipped++;
      continue;
    }

    if (dryRun) {
      const addr = parseAddress(place.formatted_address);
      console.log(`  DRY RUN: ${place.name} | ${addr.city}, ${addr.state} | Rating: ${place.rating ?? "N/A"}`);
      inserted++;
      continue;
    }

    // Fetch details
    const details = await getPlaceDetails(place.place_id);
    apiCalls++;

    if (!details) {
      console.log(`  ERROR (details): ${label}`);
      errors++;
      continue;
    }

    // Download and upload photos
    const photoRefs = [
      ...(place.photos ?? []),
      ...(details.photos ?? []),
    ]
      .slice(0, MAX_PHOTOS_PER_STUDIO)
      .map((p) => p.photo_reference);

    const uploadedUrls: string[] = [];
    for (let i = 0; i < photoRefs.length; i++) {
      const ref = photoRefs[i];
      if (!ref) continue;
      const photo = await downloadPhoto(ref);
      apiCalls++;

      if (!photo) continue;

      const path = `seeded/${place.place_id}/${i}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("studio-images")
        .upload(path, photo, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("studio-images")
          .getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    // Parse address
    const addr = parseAddress(place.formatted_address);
    const studioCity = addr.city || parsedCity;
    const studioState = addr.state || parsedState;

    // Generate slug (handle collisions)
    let slug = slugify(`${place.name}-${studioCity}`);
    const { data: slugCheck } = await supabase
      .from("studios")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (slugCheck) {
      slug = `${slug}-${place.place_id.slice(0, 6)}`;
    }

    // Insert
    const row = {
      name: place.name,
      slug,
      source: "google" as const,
      google_place_id: place.place_id,
      address: addr.address,
      city: studioCity,
      state: studioState,
      zip_code: addr.zipCode || null,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      phone: details.formatted_phone_number || null,
      email: null, // Google Places doesn't reliably return email
      website: details.website || null,
      hours: parseHours(details.opening_hours),
      specialties: [],
      rating: place.rating ?? null,
      review_count: place.user_ratings_total ?? 0,
      profile_image: uploadedUrls[0] || null,
      cover_image: uploadedUrls[1] || null,
      images: uploadedUrls,
      is_visible: true,
    };

    const { error: insertError } = await supabase
      .from("studios")
      .insert(row);

    if (insertError) {
      console.error(`  ERROR (insert): ${label}`, insertError.message);
      errors++;
    } else {
      console.log(`  OK: ${place.name} | ${studioCity}, ${studioState} | ${uploadedUrls.length} photos`);
      inserted++;
    }
  }

  // Step 4: Auto-create city seed config entry
  if (!dryRun && inserted > 0) {
    const cityKey = `city:${parsedCity.toLowerCase().replace(/\s+/g, "_")}_${parsedState.toLowerCase()}`;
    await supabase
      .from("seed_config")
      .upsert({ key: cityKey, enabled: true }, { onConflict: "key" });
    console.log(`\nSeed config: ${cityKey} = enabled`);
  }

  // Summary
  console.log("\n--- Summary ---");
  console.log(`  New: ${inserted}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  API calls: ~${apiCalls}`);
  console.log(`  Estimated cost: ~$${(apiCalls * 0.02).toFixed(2)}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

// Seeds clearly-marked test artists affiliated with Drunken Regurts so the
// studio booking form's artist picker can be exercised end to end. Each artist
// gets an avatar + 4 portfolio images (picsum placeholders) so pills and the
// hover gallery render with real content.
//
//   seed one:  npx tsx scripts/seed-test-artist.ts
//   seed six:  npx tsx scripts/seed-test-artist.ts --count 6   (> 5 shows the search dropdown)
//   clean up:  npx tsx scripts/seed-test-artist.ts --clean
//
// Rerunnable: upserts by slug. No booking_settings rows are created on purpose —
// artists exercise the "through studio page" default (pickable, front-desk
// routed with preferred_artist_id).

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const SLUG_BASE = "seed-test-artist";
const STUDIO_SLUG = "drunken-regurts-raleigh-nc";
const STYLE_POOL = [
  ["traditional", "blackwork"],
  ["realism", "portrait"],
  ["fine-line", "minimalist"],
  ["japanese", "neo-traditional"],
  ["watercolor", "abstract"],
  ["geometric", "dotwork"],
  ["tribal", "blackwork"],
  ["sketch", "fine-line"],
];

function env(key: string): string {
  const match = readFileSync(".env.local", "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match?.[1]) throw new Error(`${key} missing from .env.local`);
  return match[1].trim();
}

const admin = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

function slugFor(i: number): string {
  return i === 1 ? SLUG_BASE : `${SLUG_BASE}-${i}`;
}

async function clean() {
  const { data: artists } = await admin
    .from("artists")
    .select("id, name")
    .like("slug", `${SLUG_BASE}%`);
  if (!artists?.length) {
    console.log("nothing to clean — no artists with slug prefix", SLUG_BASE);
    return;
  }
  const ids = artists.map((a) => a.id);
  await admin.from("affiliations").delete().in("artist_id", ids);
  await admin.from("booking_settings").delete().in("artist_id", ids);
  // portfolio_images cascade with the artist rows.
  const { error } = await admin.from("artists").delete().in("id", ids);
  if (error) throw error;
  console.log(`removed ${ids.length} seed artist(s), their affiliations, settings, and portfolios`);
}

async function seed(count: number) {
  const { data: studio, error: studioError } = await admin
    .from("studios")
    .select("id, name")
    .eq("slug", STUDIO_SLUG)
    .single();
  if (studioError || !studio) throw new Error(`studio ${STUDIO_SLUG} not found`);

  for (let i = 1; i <= count; i++) {
    const slug = slugFor(i);
    const { data: artist, error: artistError } = await admin
      .from("artists")
      .upsert(
        {
          name: i === 1 ? "Test Artist [SEED]" : `Test Artist ${i} [SEED]`,
          slug,
          bio: "Seed data for testing the studio booking artist picker. Safe to delete: npx tsx scripts/seed-test-artist.ts --clean",
          profile_image: `https://picsum.photos/seed/inked-${slug}/200`,
          city: "Raleigh",
          state: "NC",
          styles: STYLE_POOL[(i - 1) % STYLE_POOL.length],
          specialties: ["Test data"],
          is_visible: true,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (artistError || !artist) throw artistError ?? new Error(`artist upsert failed: ${slug}`);

    const { data: existing } = await admin
      .from("affiliations")
      .select("id")
      .eq("artist_id", artist.id)
      .eq("studio_id", studio.id)
      .maybeSingle();
    if (existing) {
      const { error } = await admin
        .from("affiliations")
        .update({ status: "active" })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await admin
        .from("affiliations")
        .insert({ artist_id: artist.id, studio_id: studio.id, status: "active" });
      if (error) throw error;
    }

    // Fresh 4-image portfolio for the hover gallery (idempotent: replace all).
    await admin.from("portfolio_images").delete().eq("artist_id", artist.id);
    const { error: imgError } = await admin.from("portfolio_images").insert(
      Array.from({ length: 4 }, (_, n) => ({
        artist_id: artist.id,
        url: `https://picsum.photos/seed/inked-${slug}-p${n}/400`,
        title: `Seed piece ${n + 1}`,
        sort_order: n,
      }))
    );
    if (imgError) throw imgError;

    console.log(`seeded: ${slug} (${artist.id}) active at ${studio.name}`);
  }
}

async function main() {
  if (process.argv.includes("--clean")) return clean();
  const countArg = process.argv[process.argv.indexOf("--count") + 1];
  const count = process.argv.includes("--count") ? Number(countArg) : 1;
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    throw new Error("--count must be an integer between 1 and 20");
  }
  await seed(count);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

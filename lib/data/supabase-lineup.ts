import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  LineupIssue,
  LineupSpotlight,
  LineupArticle,
  LineupEvent,
  LineupProfile,
} from "@/lib/types/lineup";
import {
  type DbSpotlight,
  type DbLineupArticle,
  type DbLineupEvent,
  type DbLineupIssue,
  type DbIssueEntry,
  type DbArtist,
  type DbStudio,
  ARTIST_CARD_COLUMNS,
  STUDIO_CARD_COLUMNS,
  mapDbSpotlightToSpotlight,
  mapDbArticleToArticle,
  mapDbEventToEvent,
  mapDbArtistToDiscoverProfile,
  mapDbStudioToDiscoverProfile,
} from "@/lib/supabase/types";

// ─── Spotlights ───────────────────────────────────────────────────────────────

/** Fetch all spotlights across issues, newest first. */
export async function getAllSpotlightsFromDb(
  supabase: SupabaseClient
): Promise<LineupSpotlight[]> {
  try {
    const { data, error } = await supabase
      .from("spotlights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as DbSpotlight[]).map(mapDbSpotlightToSpotlight);
  } catch {
    return [];
  }
}

/** Fetch a single spotlight by slug. */
export async function getSpotlightBySlugFromDb(
  supabase: SupabaseClient,
  slug: string
): Promise<LineupSpotlight | null> {
  try {
    const { data, error } = await supabase
      .from("spotlights")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return mapDbSpotlightToSpotlight(data as DbSpotlight);
  } catch {
    return null;
  }
}

// ─── Events ─────────────────────────────────────────────────────────────────

/** Fetch all lineup events, soonest first. */
export async function getAllEventsFromDb(
  supabase: SupabaseClient
): Promise<LineupEvent[]> {
  try {
    const { data, error } = await supabase
      .from("lineup_events")
      .select("*")
      .order("event_date", { ascending: true, nullsFirst: false });

    if (error || !data) return [];
    return (data as DbLineupEvent[]).map(mapDbEventToEvent);
  } catch {
    return [];
  }
}

// ─── Current issue (assembled) ────────────────────────────────────────────────

/** A DiscoverProfile narrowed + retyped as a LineupProfile (quick card). */
function toLineupProfile(
  profile: { id: string; slug?: string; name: string; image: string; location: string; specialties: string[]; badges: LineupProfile["badges"] },
  type: LineupProfile["type"]
): LineupProfile {
  return {
    id: profile.id,
    slug: profile.slug,
    type,
    name: profile.name,
    image: profile.image,
    location: profile.location,
    specialties: profile.specialties,
    badges: profile.badges,
  };
}

/**
 * Fetch the latest issue (highest `number`) and assemble its full LineupIssue
 * shape by resolving the spotlight/article foreign keys and the ordered
 * issue_entries into typed collections. Returns null when the issue or its
 * required spotlights/article are missing, so callers fall back to mock data.
 */
export async function getCurrentIssueFromDb(
  supabase: SupabaseClient
): Promise<LineupIssue | null> {
  try {
    const { data: issueRow, error: issueErr } = await supabase
      .from("lineup_issues")
      .select("*")
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (issueErr || !issueRow) return null;
    const issue = issueRow as DbLineupIssue;

    // Required FKs — bail to mock if any are unset.
    if (
      !issue.cover_story_id ||
      !issue.studio_of_week_id ||
      !issue.culture_article_id
    ) {
      return null;
    }

    // Resolve cover story + studio of the week from spotlights.
    const { data: spotlightRows } = await supabase
      .from("spotlights")
      .select("*")
      .in("id", [issue.cover_story_id, issue.studio_of_week_id]);

    const spotlights = (spotlightRows ?? []) as DbSpotlight[];
    const coverRow = spotlights.find((s) => s.id === issue.cover_story_id);
    const studioRow = spotlights.find((s) => s.id === issue.studio_of_week_id);

    // Resolve the culture article.
    const { data: cultureRow } = await supabase
      .from("lineup_articles")
      .select("*")
      .eq("id", issue.culture_article_id)
      .maybeSingle();

    if (!coverRow || !studioRow || !cultureRow) return null;

    // Ordered entries for this issue.
    const { data: entryRows } = await supabase
      .from("issue_entries")
      .select("*")
      .eq("issue_id", issue.id)
      .order("position", { ascending: true });

    const entries = (entryRows ?? []) as DbIssueEntry[];

    // Bucket entry ids by section (entries already ordered by position).
    const newsIds: string[] = [];
    const eventIds: string[] = [];
    const radar: { id: string; type: "artist" | "studio" }[] = [];
    const picks: { id: string; type: "artist" | "studio" }[] = [];

    for (const e of entries) {
      if (e.section === "news") newsIds.push(e.entry_id);
      else if (e.section === "events") eventIds.push(e.entry_id);
      else if (e.section === "radar" || e.section === "picks") {
        if (e.entry_type === "artist" || e.entry_type === "studio") {
          const bucket = e.section === "radar" ? radar : picks;
          bucket.push({ id: e.entry_id, type: e.entry_type });
        }
      }
    }

    // Resolve news articles, preserving entry order.
    const news = await resolveArticles(supabase, newsIds);
    // Resolve events, preserving entry order.
    const events = await resolveEvents(supabase, eventIds);
    // Resolve radar + picks profiles, preserving entry order.
    const [onOurRadar, editorsPicks] = await Promise.all([
      resolveProfiles(supabase, radar),
      resolveProfiles(supabase, picks),
    ]);

    return {
      id: issue.id,
      number: issue.number,
      date: issue.issue_date ?? "",
      coverStory: mapDbSpotlightToSpotlight(coverRow),
      news,
      onOurRadar,
      events,
      studioOfTheWeek: mapDbSpotlightToSpotlight(studioRow),
      editorsPicks,
      cultureArticle: mapDbArticleToArticle(cultureRow as DbLineupArticle),
    };
  } catch {
    return null;
  }
}

// ─── Entry resolvers (order-preserving) ───────────────────────────────────────

async function resolveArticles(
  supabase: SupabaseClient,
  ids: string[]
): Promise<LineupArticle[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("lineup_articles")
    .select("*")
    .in("id", ids);
  const byId = new Map(
    ((data ?? []) as DbLineupArticle[]).map((r) => [r.id, r])
  );
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is DbLineupArticle => r !== undefined)
    .map(mapDbArticleToArticle);
}

async function resolveEvents(
  supabase: SupabaseClient,
  ids: string[]
): Promise<LineupEvent[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("lineup_events")
    .select("*")
    .in("id", ids);
  const byId = new Map(((data ?? []) as DbLineupEvent[]).map((r) => [r.id, r]));
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is DbLineupEvent => r !== undefined)
    .map(mapDbEventToEvent);
}

async function resolveProfiles(
  supabase: SupabaseClient,
  refs: { id: string; type: "artist" | "studio" }[]
): Promise<LineupProfile[]> {
  if (refs.length === 0) return [];

  const artistIds = refs.filter((r) => r.type === "artist").map((r) => r.id);
  const studioIds = refs.filter((r) => r.type === "studio").map((r) => r.id);

  const [artistsRes, studiosRes] = await Promise.all([
    artistIds.length
      ? supabase.from("artists").select(ARTIST_CARD_COLUMNS).in("id", artistIds)
      : Promise.resolve({ data: [] as DbArtist[] }),
    studioIds.length
      ? supabase.from("studios").select(STUDIO_CARD_COLUMNS).in("id", studioIds)
      : Promise.resolve({ data: [] as DbStudio[] }),
  ]);

  const artistById = new Map(
    ((artistsRes.data ?? []) as DbArtist[]).map((r) => [r.id, r])
  );
  const studioById = new Map(
    ((studiosRes.data ?? []) as DbStudio[]).map((r) => [r.id, r])
  );

  return refs
    .map((ref) => {
      if (ref.type === "artist") {
        const row = artistById.get(ref.id);
        return row
          ? toLineupProfile(mapDbArtistToDiscoverProfile(row), "artist")
          : undefined;
      }
      const row = studioById.get(ref.id);
      return row
        ? toLineupProfile(mapDbStudioToDiscoverProfile(row), "studio")
        : undefined;
    })
    .filter((p): p is LineupProfile => p !== undefined);
}

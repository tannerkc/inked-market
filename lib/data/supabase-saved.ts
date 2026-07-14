import type { SupabaseClient } from "@supabase/supabase-js";
import type { CardBadge } from "@/components/ui/profile-card";
import type {
  SavedEntity,
  SavedStudio,
  SavedArtist,
  SavedPortfolioPiece,
} from "@/lib/data/saved";
import {
  type DbStudio,
  type DbArtist,
  STUDIO_CARD_COLUMNS,
  ARTIST_CARD_COLUMNS,
  mapDbStudioToDiscoverProfile,
  mapDbArtistToDiscoverProfile,
} from "@/lib/supabase/types";
import type { DiscoverProfile } from "@/lib/data/discover";

export type SavedEntityType = "studio" | "artist" | "design";

export interface SavedCollections {
  studios: SavedStudio[];
  artists: SavedArtist[];
  portfolio: SavedPortfolioPiece[];
}

const EMPTY: SavedCollections = { studios: [], artists: [], portfolio: [] };

function profileToSavedEntity(p: DiscoverProfile, savedAt: string): SavedEntity {
  return {
    id: p.id,
    name: p.name,
    image: p.image,
    location: p.location,
    rating: p.rating,
    reviewCount: p.reviewCount,
    specialties: p.specialties,
    verified: p.verified,
    badges: p.badges as unknown as CardBadge[],
    savedAt,
  };
}

async function resolveStudios(
  supabase: SupabaseClient,
  ids: string[],
  savedAt: Map<string, string>,
): Promise<SavedStudio[]> {
  if (!ids.length) return [];
  const { data } = await supabase
    .from("studios")
    .select(STUDIO_CARD_COLUMNS)
    .in("id", ids);
  if (!data) return [];
  return (data as DbStudio[]).map((row) => {
    const p = mapDbStudioToDiscoverProfile(row);
    return {
      ...profileToSavedEntity(p, savedAt.get(`studio:${row.id}`) ?? ""),
      artistCount: p.artistCount ?? 0,
    };
  });
}

async function resolveArtists(
  supabase: SupabaseClient,
  ids: string[],
  savedAt: Map<string, string>,
): Promise<SavedArtist[]> {
  if (!ids.length) return [];
  const { data } = await supabase
    .from("artists")
    .select(ARTIST_CARD_COLUMNS)
    .in("id", ids);
  if (!data) return [];
  return (data as DbArtist[]).map((row) =>
    profileToSavedEntity(
      mapDbArtistToDiscoverProfile(row),
      savedAt.get(`artist:${row.id}`) ?? "",
    ),
  );
}

async function resolvePortfolio(
  supabase: SupabaseClient,
  ids: string[],
  savedAt: Map<string, string>,
): Promise<SavedPortfolioPiece[]> {
  if (!ids.length) return [];
  const { data } = await supabase
    .from("portfolio_images")
    .select("id, url, title, tags, artist_id, artists(name)")
    .in("id", ids);
  if (!data) return [];
  return (data as unknown as Array<{
    id: string;
    url: string;
    title: string | null;
    tags: string[] | null;
    artist_id: string;
    artists: { name: string } | null;
  }>).map((row) => ({
    id: row.id,
    url: row.url,
    title: row.title ?? "",
    artistName: row.artists?.name ?? "",
    artistId: row.artist_id,
    tags: row.tags ?? [],
    aspectRatio: "2:3" as const,
    savedAt: savedAt.get(`design:${row.id}`) ?? "",
  }));
}

/** Fetch the current user's saved items, resolved to card data. RLS-scoped. */
export async function getSaved(
  supabase: SupabaseClient,
): Promise<SavedCollections> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const { data: items } = await supabase
      .from("saved_items")
      .select("entity_type, entity_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!items) return EMPTY;

    const savedAt = new Map<string, string>();
    for (const it of items) {
      savedAt.set(`${it.entity_type}:${it.entity_id}`, it.created_at);
    }
    const idsOf = (t: SavedEntityType) =>
      items.filter((i) => i.entity_type === t).map((i) => i.entity_id);

    const [studios, artists, portfolio] = await Promise.all([
      resolveStudios(supabase, idsOf("studio"), savedAt),
      resolveArtists(supabase, idsOf("artist"), savedAt),
      resolvePortfolio(supabase, idsOf("design"), savedAt),
    ]);
    return { studios, artists, portfolio };
  } catch {
    return EMPTY;
  }
}

/** Save an item for the current user. Must set user_id (RLS with check). */
export async function saveItem(
  supabase: SupabaseClient,
  entityType: SavedEntityType,
  entityId: string,
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from("saved_items")
      .insert({ user_id: user.id, entity_type: entityType, entity_id: entityId });
    return !error;
  } catch {
    return false;
  }
}

/** Remove a saved item. RLS scopes the delete to the current user. */
export async function unsaveItem(
  supabase: SupabaseClient,
  entityType: SavedEntityType,
  entityId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);
    return !error;
  } catch {
    return false;
  }
}

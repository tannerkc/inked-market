import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudioRepository } from "./studio-repository";
import type { StudioData } from "./types";
import {
  type DbStudio,
  mapDbStudioToStudioData,
  mapStudioDataToDbStudio,
} from "@/lib/supabase/types";
import { slugify } from "@/lib/utils";

/**
 * Supabase-backed studio repository.
 * Keyed by the owner's auth id (studios.claimed_by) — NOT the studio row id,
 * which is a random uuid. Drop-in replacement for LocalStorageStudioRepository.
 */
export class SupabaseStudioRepository implements StudioRepository {
  constructor(
    private supabase: SupabaseClient,
    private ownerId: string
  ) {}

  async get(): Promise<StudioData | null> {
    const { data, error } = await this.supabase
      .from("studios")
      .select("*")
      .eq("claimed_by", this.ownerId)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbStudioToStudioData(data as DbStudio);
  }

  async set(partial: Partial<StudioData>): Promise<void> {
    const dbPartial = mapStudioDataToDbStudio(partial);

    // Find this owner's existing studio row (linked via claimed_by, not id).
    const { data: existing } = await this.supabase
      .from("studios")
      .select("id")
      .eq("claimed_by", this.ownerId)
      .maybeSingle();

    if (existing) {
      const { error } = await this.supabase
        .from("studios")
        .update(dbPartial)
        .eq("id", existing.id);
      if (error) throw new Error(`Failed to update studio: ${error.message}`);
      return;
    }

    // First save — create the organic studio row, filling NOT NULL columns.
    const name = (dbPartial.name as string | undefined) || "Untitled Studio";
    const { error } = await this.supabase.from("studios").insert({
      ...dbPartial,
      name,
      city: dbPartial.city ?? "",
      state: dbPartial.state ?? "",
      // ponytail: name-slug + owner-id prefix is unique enough (one row per owner)
      slug: `${slugify(name)}-${this.ownerId.slice(0, 8)}`,
      source: "organic",
      claimed_by: this.ownerId,
      claimed_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Failed to create studio: ${error.message}`);
  }

  async clear(): Promise<void> {
    // No-op for Supabase — we don't delete studios via clear()
  }
}

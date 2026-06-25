export type { Repository, StudioData, BusinessHours, DayHours } from "./types";
export type { StudioRepository } from "./studio-repository";
export { LocalStorageStudioRepository } from "./local-storage-studio-repository";
export { SupabaseStudioRepository } from "./supabase-studio-repository";

import type { SupabaseClient } from "@supabase/supabase-js";
import { LocalStorageStudioRepository } from "./local-storage-studio-repository";
import { SupabaseStudioRepository } from "./supabase-studio-repository";
import type { StudioRepository } from "./studio-repository";

/**
 * Factory — returns Supabase repo when client+studioId provided,
 * otherwise falls back to localStorage for dev/testing.
 */
export function createStudioRepository(
  client?: SupabaseClient,
  studioId?: string
): StudioRepository {
  if (client && studioId) {
    return new SupabaseStudioRepository(client, studioId);
  }
  return new LocalStorageStudioRepository();
}

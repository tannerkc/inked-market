import type { StudioData } from "./types";
import type { StudioRepository } from "./studio-repository";

// Versioned key — bump to "inked-studio-v2" when a breaking schema change
// requires a migration strategy (old data won't be read as the new shape).
const KEY = "inked-studio-v1";

export class LocalStorageStudioRepository implements StudioRepository {
  async get(): Promise<StudioData | null> {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as StudioData;
    } catch {
      return null;
    }
  }

  async set(partial: Partial<StudioData>): Promise<void> {
    try {
      const current = await this.get();
      const merged = { ...(current ?? {}), ...partial } as StudioData;
      localStorage.setItem(KEY, JSON.stringify(merged));
    } catch {
      // localStorage unavailable (SSR, private browsing quota, etc.) — silently ignore
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // silently ignore
    }
  }
}

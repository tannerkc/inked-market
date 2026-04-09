export type { Repository, StudioData, BusinessHours, DayHours } from "./types";
export type { StudioRepository } from "./studio-repository";
export { LocalStorageStudioRepository } from "./local-storage-studio-repository";

import { LocalStorageStudioRepository } from "./local-storage-studio-repository";
import type { StudioRepository } from "./studio-repository";

/**
 * Factory — the ONLY line that changes at backend launch.
 *
 * Current:  return new LocalStorageStudioRepository()
 * Future:   return new ApiStudioRepository(authToken)
 */
export function createStudioRepository(): StudioRepository {
  return new LocalStorageStudioRepository();
}

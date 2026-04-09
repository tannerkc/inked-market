import type { Repository, StudioData } from "./types";

/**
 * StudioRepository — named interface so future methods (getPublished, sync, etc.)
 * can be added without changing the base Repository contract.
 */
export interface StudioRepository extends Repository<StudioData> {}

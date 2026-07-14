import type { SupabaseClient } from "@supabase/supabase-js";
import type { Review } from "@/lib/types";
import {
  type DbReview,
  REVIEW_COLUMNS,
  mapDbReviewToReview,
} from "@/lib/supabase/types";

/**
 * Fetch reviews for a studio or artist (polymorphic target).
 * Aggregates (rating, review_count) are maintained on the target by a DB trigger.
 */
export async function getReviewsForTarget(
  supabase: SupabaseClient,
  targetType: "studio" | "artist",
  targetId: string,
): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(REVIEW_COLUMNS)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as DbReview[]).map(mapDbReviewToReview);
  } catch {
    return [];
  }
}

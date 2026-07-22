import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import {
  getStudioByIdFromDb,
  getStudioBySlugFromDb,
} from "@/lib/data/supabase-studios";
import { ClaimForm } from "./claim-form";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Claim links may carry the uuid or the pretty slug — resolve both. */
function loadStudio(supabase: SupabaseClient, idOrSlug: string) {
  return getStudioByIdFromDb(supabase, idOrSlug).then(
    (studio) => studio ?? getStudioBySlugFromDb(supabase, idOrSlug)
  );
}

interface PageProps {
  params: Promise<{ studioId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { studioId } = await params;
  const supabase = await createClient();
  const studio = await loadStudio(supabase, studioId);

  return {
    title: studio
      ? `Claim ${studio.name} | Inked Market`
      : "Claim Studio | Inked Market",
  };
}

export default async function ClaimPage({ params, searchParams }: PageProps) {
  const { studioId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const studio = await loadStudio(supabase, studioId);

  if (!studio) notFound();

  // Already claimed
  if (studio.claimedBy) {
    return (
      <div className="min-h-screen bg-ink-black flex items-center justify-center relative">
        <FilmGrainOverlay />
        <div className="text-center px-6 relative z-10">
          <h1 className="font-mono text-[13px] tracking-[0.12em] uppercase text-ink-cream/70 mb-3">
            Already Claimed
          </h1>
          <p className="font-mono text-[10px] tracking-[0.05em] text-ink-cream/35 max-w-sm">
            {studio.name} has already been claimed by its owner. If you believe
            this is an error, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-black flex items-center justify-center relative">
      <FilmGrainOverlay />
      <div className="w-full max-w-md px-6 relative z-10">
        {/* Studio confirmation */}
        <div className="text-center mb-8">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-sage/60 mb-2">
            Claim Your Listing
          </p>
          <h1 className="text-xl font-bold text-ink-cream mb-1">
            {studio.name}
          </h1>
          <p className="font-mono text-[10px] tracking-[0.05em] text-ink-cream/35">
            {studio.location.city}, {studio.location.state}
          </p>
        </div>

        {error === "already_claimed" && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-ink-red/10 border border-ink-red/20">
            <p className="font-mono text-[10px] text-ink-red/70">
              This listing was claimed while you were verifying. Please contact
              support if this is your shop.
            </p>
          </div>
        )}

        {/* Claim form */}
        <ClaimForm
          studioId={studio.id}
          hasEmail={!!studio.email}
        />

        <p className="font-mono text-[8px] tracking-[0.05em] text-ink-cream/20 text-center mt-6">
          A verification link will be sent to the business email on file.
          Click it to verify ownership and customize your listing.
        </p>
      </div>
    </div>
  );
}

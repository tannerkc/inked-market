"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getStudioRosterFromDb,
  inviteArtistToStudio,
  removeAffiliation,
  searchArtistsForInvite,
  setAffiliationStatus,
} from "@/lib/data/supabase-artists";
import type { StudioData } from "@/lib/repositories";
import type { Affiliation } from "@/lib/types";

type SearchableArtist = { id: string; name: string; avatarUrl?: string; styles: string[] };

const SEARCH_DEBOUNCE_MS = 250;

export function useArtistRoster(studio: StudioData | null) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<"invite" | "roster">("invite");
  const [artistSearch, setArtistSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [roster, setRoster] = useState<Affiliation[]>([]);
  const [searchResults, setSearchResults] = useState<SearchableArtist[]>([]);

  const studioId = studio?.id;

  useEffect(() => {
    if (!studioId) return;
    let cancelled = false;
    getStudioRosterFromDb(createClient(), studioId).then((entries) => {
      if (!cancelled) setRoster(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [studioId]);

  // Live search against the artists table, debounced while the panel is open.
  useEffect(() => {
    if (!inviteOpen) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchArtistsForInvite(createClient(), artistSearch).then((results) => {
        if (!cancelled) setSearchResults(results);
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inviteOpen, artistSearch]);

  const filteredArtists = searchResults;

  const handleInviteArtist = async (artist: SearchableArtist) => {
    if (!studioId || roster.some((r) => r.artistId === artist.id)) return;
    const affiliationId = await inviteArtistToStudio(createClient(), artist.id, studioId);
    if (!affiliationId) return;
    setRoster((prev) => [
      ...prev,
      {
        id: affiliationId,
        artistId: artist.id,
        name: artist.name,
        avatarUrl: artist.avatarUrl,
        styles: artist.styles,
        status: "pending-invite",
        role: "artist",
      },
    ]);
  };

  // ponytail: no transactional email service yet — compose the invite in the
  // owner's mail app. Swap for a server action + email provider when one lands.
  const handleSendEmailInvite = () => {
    const email = inviteEmail.trim();
    if (!email) return;
    const studioName = studio?.name || "our studio";
    const subject = encodeURIComponent(`Join ${studioName} on Inked Market`);
    const body = encodeURIComponent(
      `Hey,\n\nWe'd love to have you on the roster at ${studioName}. ` +
        `Create your artist profile on Inked Market and link up with us here:\n\n` +
        `${window.location.origin}/signup/artist\n\nSee you there!`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setInviteEmail("");
  };

  const handleAcceptRequest = async (id: string) => {
    if (await setAffiliationStatus(createClient(), id, "active")) {
      setRoster((prev) => prev.map((r) => (r.id === id ? { ...r, status: "active" } : r)));
    }
  };

  const handleDeclineOrRemove = async (id: string) => {
    if (await removeAffiliation(createClient(), id)) {
      setRoster((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return {
    inviteOpen,
    setInviteOpen,
    inviteTab,
    setInviteTab,
    artistSearch,
    setArtistSearch,
    inviteEmail,
    setInviteEmail,
    roster,
    filteredArtists,
    handleInviteArtist,
    handleSendEmailInvite,
    handleAcceptRequest,
    handleDeclineOrRemove,
  };
}

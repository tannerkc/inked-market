"use client";

import { useState } from "react";
import { getStudioSearchResults } from "@/lib/data/dashboard";
import type { Affiliation } from "@/lib/types";

type SearchableStudio = { id: string; name: string; avatarUrl?: string; location: string };

function matchesQuery(studio: SearchableStudio, query: string): boolean {
  const q = query.toLowerCase();
  return studio.name.toLowerCase().includes(q) || studio.location.toLowerCase().includes(q);
}

export function useStudioAffiliation() {
  const [findStudioOpen, setFindStudioOpen] = useState(false);
  const [studioSearch, setStudioSearch] = useState("");
  const [studioAffiliation, setStudioAffiliation] = useState<Affiliation | null>(null);

  const allStudios = getStudioSearchResults();
  const filteredStudios = studioSearch
    ? allStudios.filter((s) => matchesQuery(s, studioSearch))
    : allStudios;

  const handleRequestToJoin = (studio: SearchableStudio) => {
    setStudioAffiliation({
      id: studio.id,
      name: studio.name,
      avatarUrl: studio.avatarUrl,
      status: "pending-request",
      role: "studio",
    });
    setFindStudioOpen(false);
  };

  return {
    findStudioOpen,
    setFindStudioOpen,
    studioSearch,
    setStudioSearch,
    studioAffiliation,
    setStudioAffiliation,
    filteredStudios,
    handleRequestToJoin,
  };
}

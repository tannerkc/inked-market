"use client";

import { useState } from "react";
import type { AuthUser } from "@/components/providers/auth-provider";

export function useArtistBio(updateUser: (data: Partial<AuthUser>) => void) {
  const [bioEditing, setBioEditing] = useState(false);
  const [bioText, setBioText] = useState("");

  const handleSaveBio = () => {
    updateUser({ bio: bioText });
  };

  return { bioEditing, setBioEditing, bioText, setBioText, handleSaveBio };
}

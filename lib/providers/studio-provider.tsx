"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { createStudioRepository } from "@/lib/repositories";
import { seedStudioFromAuthUser } from "@/lib/utils/seed-studio";
import type { StudioData } from "@/lib/repositories";

// ─── Context value ────────────────────────────────────────────────────────────

interface StudioContextValue {
  studio: StudioData | null;
  loading: boolean;
  update: (partial: Partial<StudioData>) => Promise<void>;
  /** Local-state merge with NO DB write — for fields the server just wrote
   *  (publish columns are client-write-blocked by trg_studios_publish_guard). */
  applyLocal: (partial: Partial<StudioData>) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Create repository — Supabase if user has a studio, otherwise localStorage fallback
  const repo = useMemo(() => {
    if (user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient();
      // For studio users, find their studio ID from the claim or organic creation
      // The user.id maps to claimed_by in the studios table
      return createStudioRepository(supabase, user.id);
    }
    return createStudioRepository();
  }, [user]);

  const [studio, setStudio] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;

    repo.get().then(async (data) => {
      if (data) {
        setStudio(data);
        setLoading(false);
        seeded.current = true;
      } else if (user) {
        seeded.current = true;
        const initial = seedStudioFromAuthUser(user);
        await repo.set(initial);
        // Re-read so the fresh row's id/slug are in state immediately —
        // photo uploads and Share Listing need them before any reload.
        setStudio((await repo.get()) ?? initial);
        setLoading(false);
      } else {
        // No stored studio and no user (logged-out / empty local) — stop loading.
        setLoading(false);
      }
    });
  }, [repo, user]);

  const update = useCallback(
    async (partial: Partial<StudioData>) => {
      setStudio((prev) => ({ ...(prev ?? ({} as StudioData)), ...partial }));
      await repo.set(partial);
    },
    [repo],
  );

  const applyLocal = useCallback((partial: Partial<StudioData>) => {
    setStudio((prev) => ({ ...(prev ?? ({} as StudioData)), ...partial }));
  }, []);

  return (
    <StudioContext.Provider value={{ studio, loading, update, applyLocal }}>
      {children}
    </StudioContext.Provider>
  );
}

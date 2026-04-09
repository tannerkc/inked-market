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
import { createStudioRepository } from "@/lib/repositories";
import { seedStudioFromAuthUser } from "@/lib/utils/seed-studio";
import type { StudioData } from "@/lib/repositories";

// ─── Context value ────────────────────────────────────────────────────────────

interface StudioContextValue {
  studio: StudioData | null;
  /** True during the initial async repository read. */
  loading: boolean;
  /**
   * Merge-patch update — optimistic (local state updated immediately)
   * then persisted async. No loading flicker on user edits.
   *
   * Future: swap repository to ApiStudioRepository and this stays identical.
   */
  update: (partial: Partial<StudioData>) => Promise<void>;
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
  const repo = useMemo(() => createStudioRepository(), []);

  const [studio, setStudio] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevents double-seeding if this effect re-runs after user hydrates.
  const seeded = useRef(false);

  // Hydrate from repository; seed from AuthUser on first load if repo is empty.
  //
  // Why `user` is a dependency:
  //   React runs child effects before parent effects on mount. AuthProvider
  //   (a parent) sets `user` from localStorage in its own effect, so `user`
  //   is null when this effect first runs. Adding `user` lets us re-run once
  //   it hydrates and seed the repo then.
  //
  // Future: replace the seeding branch with fetch('/api/v1/studio').
  useEffect(() => {
    if (seeded.current) return;

    repo.get().then(async (data) => {
      if (data) {
        // Repo already has data — use it regardless of auth state.
        setStudio(data);
        setLoading(false);
        seeded.current = true;
      } else if (user) {
        // Repo is empty and user is loaded — seed once from AuthUser.
        seeded.current = true;
        const initial = seedStudioFromAuthUser(user);
        await repo.set(initial);
        setStudio(initial);
        setLoading(false);
      }
      // If data=null and user=null: loading stays true; effect re-runs when user hydrates.
    });
  }, [repo, user]);

  const update = useCallback(
    async (partial: Partial<StudioData>) => {
      // Optimistic update — UI reflects change immediately
      setStudio((prev) => ({ ...(prev ?? ({} as StudioData)), ...partial }));
      // Persist async — merge-patch in repository
      await repo.set(partial);
    },
    [repo],
  );

  return (
    <StudioContext.Provider value={{ studio, loading, update }}>
      {children}
    </StudioContext.Provider>
  );
}

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = "artist" | "studio" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan?: string;
  // Artist-specific
  styles?: string[];
  location?: string;
  bio?: string;
  instagram?: string;
  website?: string;
  tiktok?: string;
  // Studio-specific
  studioName?: string;
  city?: string;
  state?: string;
  phone?: string;
  specialties?: string[];
  autoSpecialties?: boolean;
  services?: import("@/lib/types").StudioService[];
  // Settings
  notifications?: import("@/lib/types").NotificationPreferences;
  privacy?: import("@/lib/types").PrivacyPreferences;
  billing?: import("@/lib/types").BillingInfo;
  connectedAccounts?: import("@/lib/types").ConnectedAccounts;
}

interface SignupProgress {
  role?: UserRole;
  email?: string;
  password?: string;
  name?: string;
  // Artist fields
  styles?: string[];
  // Studio fields
  studioName?: string;
  city?: string;
  state?: string;
  phone?: string;
  specialties?: string[];
  // Plan
  plan?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLocalhost: boolean;
  signupProgress: SignupProgress;
  updateSignupProgress: (data: Partial<SignupProgress>) => void;
  completeSignup: () => AuthUser | null;
  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AUTH_KEY = "inked-market-auth";
const SIGNUP_KEY = "inked-market-signup";
const ACCOUNTS_KEY = "inked-market-accounts";

// ─── Localhost check ─────────────────────────────────────────────────────────

function checkIsLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start with null/empty to match server render (prevents hydration mismatch).
  // Real values are loaded from localStorage in useEffect after first client render.
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signupProgress, setSignupProgress] = useState<SignupProgress>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate auth state from localStorage after mount (client-only)
  useEffect(() => {
    const localhost = checkIsLocalhost();
    let initialUser: AuthUser | null = null;
    let initialProgress: SignupProgress = {};

    if (localhost) {
      try {
        const storedAuth = localStorage.getItem(AUTH_KEY);
        if (storedAuth) initialUser = JSON.parse(storedAuth);
        const storedSignup = localStorage.getItem(SIGNUP_KEY);
        if (storedSignup) initialProgress = JSON.parse(storedSignup);
      } catch {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(SIGNUP_KEY);
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate from localStorage on mount
    setIsLocalhost(localhost);
    setUser(initialUser);
    setSignupProgress(initialProgress);
    setHydrated(true);
  }, []);

  // Update signup progress and persist
  const updateSignupProgress = useCallback((data: Partial<SignupProgress>) => {
    if (!isLocalhost) return;
    setSignupProgress((prev) => {
      const next = { ...prev, ...data };
      localStorage.setItem(SIGNUP_KEY, JSON.stringify(next));
      return next;
    });
  }, [isLocalhost]);

  // Complete signup — reads from localStorage directly to avoid stale React state
  const completeSignup = useCallback((): AuthUser | null => {
    if (!isLocalhost) return null;

    // Read from localStorage, NOT from React state (which may be stale)
    let progress: SignupProgress;
    try {
      progress = JSON.parse(localStorage.getItem(SIGNUP_KEY) || "{}");
    } catch {
      return null;
    }

    const { role, email, name, password, ...rest } = progress;
    if (!role || !email || !name) return null;

    const newUser: AuthUser = {
      id: `${role}-${Date.now()}`,
      email,
      name,
      role,
      ...rest,
    };

    // Store account with password for login
    try {
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
      accounts.push({ ...newUser, password });
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([{ ...newUser, password }]));
    }

    // Set as current user (no password in session)
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    localStorage.removeItem(SIGNUP_KEY);
    setUser(newUser);
    setSignupProgress({});

    return newUser;
  }, [isLocalhost]);

  // Login: find account by email + password
  const login = useCallback((email: string, password: string): AuthUser | null => {
    if (!isLocalhost) return null;

    try {
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
      const account = accounts.find(
        (a: { email: string; password: string }) =>
          a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );
      if (!account) return null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...userData } = account;
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, [isLocalhost]);

  // Update authenticated user and persist to localStorage + accounts list
  const updateUser = useCallback((data: Partial<AuthUser>) => {
    if (!isLocalhost) return;

    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));

      // Also update the account in the accounts list so login returns fresh data
      try {
        const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
        const idx = accounts.findIndex((a: { id: string }) => a.id === updated.id);
        if (idx !== -1) {
          const password = accounts[idx].password;
          accounts[idx] = { ...updated, password };
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        }
      } catch {
        // silently fail — account list update is best-effort
      }

      return updated;
    });
  }, [isLocalhost]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  // Don't render auth-dependent UI until localStorage has been read.
  // Children render with isAuthenticated=false on server and during hydration,
  // then re-render with real auth state after useEffect fires.
  return (
    <AuthContext.Provider
      value={{
        user: hydrated ? user : null,
        isAuthenticated: hydrated && !!user,
        isLocalhost,
        signupProgress,
        updateSignupProgress,
        completeSignup,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

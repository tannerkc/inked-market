"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildStudioSlug, ensureUniqueSlug } from "@/lib/utils/studio-slug";
import type { EmailConfirmationMeta } from "@/lib/utils/email-confirmation";
import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

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
  connectedAccounts?: import("@/lib/types").ConnectedAccounts;
  // App-managed email confirmation (from app_metadata — admin-writable only)
  emailConfirmation?: EmailConfirmationMeta;
  paused?: boolean;
}

export interface SignupProgress {
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

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "email_exists"
  | "weak_password"
  | "invalid_email"
  | "rate_limited"
  | "missing_fields"
  | "unknown";

export interface AuthFailure {
  ok: false;
  code: AuthErrorCode;
  message: string;
}

export type LoginResult = { ok: true; user: AuthUser } | AuthFailure;

export type SignupResult =
  | { ok: true; user: AuthUser; needsEmailConfirmation: boolean }
  | AuthFailure;

/** Client-side lens for pros browsing as a customer — never touches identity role. */
export type ViewMode = "professional" | "customer";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  effectiveRole: UserRole | null;
  signupProgress: SignupProgress;
  updateSignupProgress: (data: Partial<SignupProgress>) => void;
  completeSignup: (extra?: Partial<SignupProgress>) => Promise<SignupResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  resendConfirmation: (email: string) => Promise<{ ok: boolean; message: string }>;
  sendConfirmationEmail: () => Promise<{ ok: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SIGNUP_KEY = "inked-market-signup";
const VIEW_MODE_KEY = "inked-market-view-mode";

/** Shared copy for duplicate-email failures (account step + completeSignup). */
export const EMAIL_EXISTS_MESSAGE = "An account with this email already exists. Sign in instead.";

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapSupabaseUser(sbUser: User): AuthUser {
  const meta = sbUser.user_metadata ?? {};
  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name: meta.name ?? meta.full_name ?? sbUser.email?.split("@")[0] ?? "",
    role: meta.role ?? "customer",
    plan: meta.plan,
    styles: meta.styles,
    location: meta.location,
    bio: meta.bio,
    instagram: meta.instagram,
    website: meta.website,
    tiktok: meta.tiktok,
    studioName: meta.studioName,
    city: meta.city,
    state: meta.state,
    phone: meta.phone,
    specialties: meta.specialties,
    autoSpecialties: meta.autoSpecialties,
    services: meta.services,
    notifications: meta.notifications,
    privacy: meta.privacy,
    connectedAccounts: meta.connectedAccounts,
    emailConfirmation: sbUser.app_metadata?.email_confirmation,
    paused: sbUser.app_metadata?.paused === true,
  };
}

function fail(code: AuthErrorCode, message: string): AuthFailure {
  return { ok: false, code, message };
}

/** Translate Supabase auth error codes into user-facing messages. */
function mapAuthError(error: AuthError): AuthFailure {
  switch (error.code) {
    case "invalid_credentials":
      return fail("invalid_credentials", "Invalid email or password.");
    case "email_not_confirmed":
      return fail(
        "email_not_confirmed",
        "This email hasn't been confirmed yet. Check your inbox for the confirmation link."
      );
    case "user_already_exists":
    case "email_exists":
      return fail("email_exists", EMAIL_EXISTS_MESSAGE);
    case "weak_password":
      return fail(
        "weak_password",
        "That password is too weak. Use at least 8 characters with letters and numbers."
      );
    case "email_address_invalid":
      return fail("invalid_email", "That email address doesn't look valid.");
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return fail("rate_limited", "Too many attempts. Wait a minute and try again.");
    default:
      return fail("unknown", error.message || "Something went wrong. Please try again.");
  }
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
  const [supabase] = useState<SupabaseClient>(() => createClient());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signupProgress, setSignupProgress] = useState<SignupProgress>({});
  const [hydrated, setHydrated] = useState(false);
  const [viewMode, setViewModeState] = useState<ViewMode>("professional");
  // Source of truth for in-flight signup data. State updaters flush
  // asynchronously, so completeSignup reads this ref — never localStorage —
  // to avoid racing React's render cycle.
  const progressRef = useRef<SignupProgress>({});

  // Hydrate auth state from Supabase session
  useEffect(() => {
    // Read initial session
    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      if (sbUser) setUser(mapSupabaseUser(sbUser));
      setHydrated(true);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
    });

    // Hydrate signup progress from localStorage (ephemeral, multi-step data).
    // The password is intentionally never persisted, so a mid-flow refresh
    // requires re-entering it on the account step.
    try {
      const stored = localStorage.getItem(SIGNUP_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SignupProgress;
        progressRef.current = { ...progressRef.current, ...parsed };
        setSignupProgress(progressRef.current);
      }
    } catch {
      // ignore
    }

    // Hydrate view mode (pros browsing as a customer) — survives refresh.
    try {
      if (localStorage.getItem(VIEW_MODE_KEY) === "customer") setViewModeState("customer");
    } catch {
      // ignore
    }

    return () => subscription.unsubscribe();
  }, [supabase]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  // Update signup progress. Kept in a ref (synchronous truth) + state (for
  // re-renders) + localStorage minus the password (survives refresh without
  // persisting a plaintext credential).
  const updateSignupProgress = useCallback((data: Partial<SignupProgress>) => {
    const next = { ...progressRef.current, ...data };
    progressRef.current = next;
    try {
      const safe = { ...next };
      delete safe.password;
      localStorage.setItem(SIGNUP_KEY, JSON.stringify(safe));
    } catch {
      // storage blocked/full — in-memory state still drives the flow
    }
    setSignupProgress(next);
  }, []);

  const clearSignupProgress = useCallback(() => {
    progressRef.current = {};
    try {
      localStorage.removeItem(SIGNUP_KEY);
    } catch {
      // ignore
    }
    setSignupProgress({});
  }, []);

  // Complete signup — creates the Supabase auth user (+ studio row when a
  // session is available). `extra` is merged synchronously so callers can
  // pass their final step's fields without waiting for a state flush.
  const completeSignup = useCallback(
    async (extra?: Partial<SignupProgress>): Promise<SignupResult> => {
      const progress = { ...progressRef.current, ...extra };
      progressRef.current = progress;

      const { role, email, name, password, ...rest } = progress;
      if (!role || !email || !name) {
        return fail("missing_fields", "Some signup details are missing. Please start over.");
      }
      if (!password) {
        // Password lives only in memory; a mid-flow refresh drops it.
        return fail(
          "missing_fields",
          "For security, your password wasn't kept after the page reloaded. Go back one step and re-enter it."
        );
      }

      const cleanEmail = email.trim().toLowerCase();
      const metadata: Record<string, unknown> = { name: name.trim(), role, ...rest };
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return mapAuthError(error);
      if (!signUpData.user) {
        return fail("unknown", "Account creation failed. Please try again.");
      }

      // When email confirmation is required, Supabase obfuscates duplicate
      // emails by returning a phantom user with no identities.
      if (!signUpData.session && signUpData.user.identities?.length === 0) {
        return fail("email_exists", EMAIL_EXISTS_MESSAGE);
      }

      const newUser = mapSupabaseUser(signUpData.user);

      // Studio row insert requires an authenticated session (RLS). Without
      // one (email confirmation pending), the dashboard seeds the studio
      // from user metadata on first visit instead.
      if (signUpData.session && role === "studio" && rest.studioName) {
        const city = rest.city || "";
        const state = rest.state || "";
        // Pretty URL: name-city-state; numbers only appended on conflict.
        const slug = await ensureUniqueSlug(
          supabase,
          buildStudioSlug(rest.studioName, city, state),
        );

        const { error: insertError } = await supabase.from("studios").insert({
          name: rest.studioName,
          slug,
          source: "organic",
          claimed_by: signUpData.user.id,
          claimed_at: new Date().toISOString(),
          city,
          state,
          phone: rest.phone || null,
          specialties: rest.specialties || [],
          // Organic studios start as drafts — public 404 until the owner
          // completes the required steps and goes live from the dashboard.
          is_visible: false,
        });

        if (insertError) {
          // Non-fatal: dashboard seeding is the fallback path
          console.error("Studio insert error:", insertError.message);
        }
      }

      clearSignupProgress();

      if (!signUpData.session) {
        // Account created but email confirmation is required — no session yet
        return { ok: true, user: newUser, needsEmailConfirmation: true };
      }

      setUser(newUser);

      // Start the 5-day confirmation clock and send the confirmation email.
      // Awaited so the redirect that follows can't cancel the request;
      // failures are non-fatal (the dashboard banner offers resend).
      try {
        await fetch("/api/auth/confirmation/send", { method: "POST" });
      } catch {
        // ignore — banner resend covers it
      }

      return { ok: true, user: newUser, needsEmailConfirmation: false };
    },
    [supabase, clearSignupProgress]
  );

  // Login with email + password
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) return mapAuthError(error);
      if (!data.user) return fail("unknown", "Sign in failed. Please try again.");

      const authUser = mapSupabaseUser(data.user);
      setUser(authUser);
      return { ok: true, user: authUser };
    },
    [supabase]
  );

  // Re-send the signup confirmation email
  const resendConfirmation = useCallback(
    async (email: string): Promise<{ ok: boolean; message: string }> => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) return { ok: false, message: mapAuthError(error).message };
      return { ok: true, message: "Confirmation email sent. Check your inbox." };
    },
    [supabase]
  );

  // Send (or re-send) the app-managed confirmation email for the current
  // session. Also refreshes local user state so the deadline stamp is visible.
  const sendConfirmationEmail = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/confirmation/send", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      // Pull the fresh app_metadata stamp into client state
      const { data } = await supabase.auth.getUser();
      if (data.user) setUser(mapSupabaseUser(data.user));

      if (body.status === "confirmed") {
        return { ok: true, message: "Your email is already confirmed." };
      }
      if (!res.ok || body.status !== "sent") {
        return { ok: false, message: body.message ?? "Couldn't send the email. Try again shortly." };
      }
      return { ok: true, message: "Confirmation email sent. Check your inbox." };
    } catch {
      return { ok: false, message: "Network error. Try again." };
    }
  }, [supabase]);

  // Update user metadata
  const updateUser = useCallback(
    (data: Partial<AuthUser>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...data };

        // Persist to Supabase user metadata (fire and forget)
        supabase.auth.updateUser({ data: { ...data } });

        return updated;
      });
    },
    [supabase]
  );

  // Logout — clear view mode synchronously (navigation redirects right after
  // calling this) so the next account on this browser starts professional.
  const logout = useCallback(async () => {
    setViewModeState("professional");
    try {
      localStorage.removeItem(VIEW_MODE_KEY);
    } catch {
      // ignore
    }
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const exposedUser = hydrated ? user : null;
  // Derived, never stored — stale localStorage can't upgrade a real customer.
  const effectiveRole: UserRole | null = exposedUser
    ? exposedUser.role !== "customer" && viewMode === "customer"
      ? "customer"
      : exposedUser.role
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: exposedUser,
        isAuthenticated: hydrated && !!user,
        hydrated,
        viewMode,
        setViewMode,
        effectiveRole,
        signupProgress,
        updateSignupProgress,
        completeSignup,
        login,
        resendConfirmation,
        sendConfirmationEmail,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

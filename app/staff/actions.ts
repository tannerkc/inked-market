"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff/guard";
import { logStaffAction } from "@/lib/staff/audit";
import { recomputeEntitlements } from "@/lib/billing/entitlements";
import { createPromo, listPromos, setPromoActive, type PromoRow } from "@/lib/billing/stripe";

// ── Users ────────────────────────────────────────────────────────────────────

export interface StaffUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tier: string | null;
  tierSource: string | null;
  billingStatus: string;
  createdAt: string;
}

export async function searchUsers(query: string): Promise<{ ok: boolean; users: StaffUserRow[]; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, users: [], error: "Forbidden" };
  const q = query.trim().toLowerCase();
  const admin = createAdminClient();

  // Email lives in auth.users; name/role/tier in profiles. Two lookups, merged.
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const allUsers = (authList?.users ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let ids: string[];
  if (!q) {
    // Empty query = browse mode: newest accounts first so real accounts are
    // visible the moment the page opens instead of hiding behind a search box.
    ids = allUsers.slice(0, 50).map((u) => u.id);
  } else {
    const { data: byName } = await admin.from("profiles").select("id").ilike("name", `%${q}%`).limit(20);
    const emailMatches = allUsers.filter((u) => u.email?.toLowerCase().includes(q));
    ids = [...new Set([...emailMatches.map((u) => u.id), ...(byName ?? []).map((p) => p.id)])];
  }
  if (!ids.length) return { ok: true, users: [] };

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, name, role, tier, tier_source, billing_status")
    .in("id", ids);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const authById = new Map(allUsers.map((u) => [u.id, u]));
  return {
    ok: true,
    // Map over ids (not profiles) so an auth account missing its profiles row
    // still shows up instead of silently disappearing from results.
    users: ids.map((id) => {
      const p = profileById.get(id);
      const au = authById.get(id);
      return {
        id, email: au?.email ?? "", name: p?.name ?? null, role: p?.role ?? "customer",
        tier: p?.tier ?? null, tierSource: p?.tier_source ?? null, billingStatus: p?.billing_status ?? "none",
        createdAt: au?.created_at ?? "",
      };
    }),
  };
}
// ponytail: listUsers page-1000 scan is fine pre-launch; swap for an email
// mirror on profiles (or auth admin getUserByEmail) past ~1k users.

export interface GrantRow {
  id: string;
  tier: string;
  note: string;
  email: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface StaffUserDetail extends StaffUserRow {
  stripeCustomerId: string | null;
  subStatus: string | null;
  grants: GrantRow[];
}

export async function getUserDetail(userId: string): Promise<{ ok: boolean; error?: string; user?: StaffUserDetail }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const admin = createAdminClient();
  const [{ data: p }, { data: bc }, { data: grants }, { data: au }] = await Promise.all([
    admin.from("profiles").select("id, name, role, tier, tier_source, billing_status").eq("id", userId).maybeSingle(),
    admin.from("billing_customers").select("stripe_customer_id, sub_status").eq("user_id", userId).maybeSingle(),
    admin.from("plan_grants").select("id, tier, note, email, expires_at, revoked_at, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }),
    admin.auth.admin.getUserById(userId),
  ]);
  if (!p && !au?.user) return { ok: false, error: "User not found" };
  return {
    ok: true,
    user: {
      id: userId, email: au?.user?.email ?? "", name: p?.name ?? null, role: p?.role ?? "customer",
      tier: p?.tier ?? null, tierSource: p?.tier_source ?? null, billingStatus: p?.billing_status ?? "none",
      createdAt: au?.user?.created_at ?? "",
      stripeCustomerId: bc?.stripe_customer_id ?? null, subStatus: bc?.sub_status ?? null,
      grants: (grants ?? []).map((g) => ({
        id: g.id, tier: g.tier, note: g.note, email: g.email,
        expiresAt: g.expires_at, revokedAt: g.revoked_at, createdAt: g.created_at,
      })),
    },
  };
}

const GrantInput = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  tier: z.enum(["liner", "shader", "magnum"]),
  expiresAt: z.string().datetime().optional(),
  note: z.string().min(3, "Add a note saying why."),
}).refine((v) => v.userId || v.email, { message: "Need a user or an email." });

export async function grantTier(raw: unknown): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const parsed = GrantInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;
  const admin = createAdminClient();

  // Email grants attach immediately when the account already exists.
  let userId = input.userId ?? null;
  if (!userId && input.email) {
    const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = authList?.users.find((u) => u.email?.toLowerCase() === input.email!.toLowerCase())?.id ?? null;
  }

  const { error } = await admin.from("plan_grants").insert({
    user_id: userId,
    email: userId ? null : input.email?.toLowerCase(),
    tier: input.tier,
    note: input.note,
    granted_by: staff.userId,
    expires_at: input.expiresAt ?? null,
  });
  if (error) return { ok: false, error: error.message };

  if (userId) await recomputeEntitlements(admin, userId);
  await logStaffAction(admin, {
    actor: staff.userId, action: "grant_tier", targetUser: userId,
    detail: { tier: input.tier, email: input.email ?? null, expiresAt: input.expiresAt ?? null, note: input.note },
  });
  return { ok: true };
}

export async function revokeGrant(grantId: string): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const admin = createAdminClient();
  const { data: grant } = await admin.from("plan_grants")
    .select("id, user_id, tier, revoked_at").eq("id", grantId).maybeSingle();
  if (!grant) return { ok: false, error: "Grant not found" };
  if (grant.revoked_at) return { ok: false, error: "Already revoked" };
  const { error } = await admin.from("plan_grants")
    .update({ revoked_at: new Date().toISOString() }).eq("id", grantId);
  if (error) return { ok: false, error: error.message };
  if (grant.user_id) await recomputeEntitlements(admin, grant.user_id);
  await logStaffAction(admin, {
    actor: staff.userId, action: "revoke_grant", targetUser: grant.user_id,
    detail: { grantId, tier: grant.tier },
  });
  return { ok: true };
}

// ── Promotion codes ──────────────────────────────────────────────────────────

const PromoInputSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{3,20}$/, "Code: 3-20 chars, A-Z 0-9 _ -"),
  percentOff: z.number().int().min(1).max(100),
  duration: z.union([z.literal("once"), z.literal("forever"), z.object({ months: z.number().int().min(1).max(36) })]),
  maxRedemptions: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
  firstTimeOnly: z.boolean().optional(),
});

export async function getPromoCodes(): Promise<{ ok: boolean; promos: PromoRow[]; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, promos: [], error: "Forbidden" };
  try {
    return { ok: true, promos: await listPromos() };
  } catch (err) {
    console.error("listPromos failed:", err);
    return { ok: false, promos: [], error: "Stripe list failed" };
  }
}

export async function createPromoCode(raw: unknown): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  const parsed = PromoInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const created = await createPromo(parsed.data);
    await logStaffAction(createAdminClient(), {
      actor: staff.userId, action: "create_promo",
      detail: { ...parsed.data, promoId: created.id },
    });
    return { ok: true };
  } catch (err) {
    console.error("createPromo failed:", err);
    return { ok: false, error: "Stripe rejected the promo (duplicate code?)" };
  }
}

export async function deactivatePromoCode(promotionCodeId: string): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, error: "Forbidden" };
  try {
    await setPromoActive(promotionCodeId, false);
    await logStaffAction(createAdminClient(), {
      actor: staff.userId, action: "deactivate_promo", detail: { promotionCodeId },
    });
    return { ok: true };
  } catch (err) {
    console.error("deactivatePromo failed:", err);
    return { ok: false, error: "Stripe deactivate failed" };
  }
}

// ── Team ─────────────────────────────────────────────────────────────────────

export interface StaffMemberRow {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export async function getStaffList(): Promise<{ ok: boolean; members: StaffMemberRow[]; error?: string }> {
  const staff = await requireStaff();
  if (!staff) return { ok: false, members: [], error: "Forbidden" };
  const admin = createAdminClient();
  const { data: rows } = await admin.from("staff").select("user_id, role, created_at").order("created_at");
  const ids = (rows ?? []).map((r) => r.user_id);
  if (!ids.length) return { ok: true, members: [] };
  const { data: profiles } = await admin.from("profiles").select("id, name").in("id", ids);
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.name]));
  const emailById = new Map((authList?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  return {
    ok: true,
    members: (rows ?? []).map((r) => ({
      userId: r.user_id, role: r.role, createdAt: r.created_at,
      name: nameById.get(r.user_id) ?? null, email: emailById.get(r.user_id) ?? "",
    })),
  };
}

export async function addStaffMember(email: string, role: "staff" | "founder"): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff("founder");
  if (!staff) return { ok: false, error: "Founders only" };
  const admin = createAdminClient();
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const target = authList?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!target) return { ok: false, error: "No account with that email — they must sign up first." };
  const { error } = await admin.from("staff")
    .upsert({ user_id: target.id, role, added_by: staff.userId }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };
  await logStaffAction(admin, { actor: staff.userId, action: "add_staff", targetUser: target.id, detail: { role } });
  return { ok: true };
}

export async function removeStaffMember(userId: string): Promise<{ ok: boolean; error?: string }> {
  const staff = await requireStaff("founder");
  if (!staff) return { ok: false, error: "Founders only" };
  const admin = createAdminClient();
  // Last-founder guard: never remove or demote the final founder.
  const { data: target } = await admin.from("staff").select("role").eq("user_id", userId).maybeSingle();
  if (!target) return { ok: false, error: "Not a staff member" };
  if (target.role === "founder") {
    const { count } = await admin.from("staff").select("user_id", { count: "exact", head: true }).eq("role", "founder");
    if ((count ?? 0) <= 1) return { ok: false, error: "Cannot remove the last founder." };
  }
  const { error } = await admin.from("staff").delete().eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  await logStaffAction(admin, { actor: staff.userId, action: "remove_staff", targetUser: userId, detail: {} });
  return { ok: true };
}

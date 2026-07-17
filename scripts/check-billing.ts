/** Billing invariants. Run: npx tsx scripts/check-billing.ts */
import { resolveEntitlement, ENTITLED_SUB_STATUSES } from "../lib/billing/entitlements-core";
import { priceIdFor, lookupPrice, PAID_TIERS } from "../lib/billing/catalog";

let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) console.log(`  ok  ${name}`);
  else { failed++; console.error(`FAIL  ${name}`); }
}

const NOW = new Date("2026-07-17T12:00:00Z");
const past = "2026-01-01T00:00:00Z";
const future = "2027-01-01T00:00:00Z";
const g = (tier: "liner" | "shader" | "magnum", expiresAt: string | null = null, revokedAt: string | null = null) =>
  ({ tier, expiresAt, revokedAt });

console.log("resolveEntitlement truth table");
check("no sub, no grants -> null", resolveEntitlement({ tier: null, status: null }, [], NOW).tier === null);
check("active sub wins", resolveEntitlement({ tier: "shader", status: "active" }, [], NOW).tier === "shader");
check("trialing counts", resolveEntitlement({ tier: "magnum", status: "trialing" }, [], NOW).tier === "magnum");
check("past_due keeps access", resolveEntitlement({ tier: "shader", status: "past_due" }, [], NOW).tier === "shader");
check("canceled sub does not count", resolveEntitlement({ tier: "shader", status: "canceled" }, [], NOW).tier === null);
check("grant alone", resolveEntitlement({ tier: null, status: null }, [g("magnum")], NOW).source === "grant");
check("higher grant beats sub", resolveEntitlement({ tier: "shader", status: "active" }, [g("magnum")], NOW).tier === "magnum");
check("higher grant source=grant", resolveEntitlement({ tier: "shader", status: "active" }, [g("magnum")], NOW).source === "grant");
check("tie goes to subscription", resolveEntitlement({ tier: "shader", status: "active" }, [g("shader")], NOW).source === "subscription");
check("lower grant loses", resolveEntitlement({ tier: "magnum", status: "active" }, [g("liner")], NOW).tier === "magnum");
check("expired grant ignored", resolveEntitlement({ tier: null, status: null }, [g("magnum", past)], NOW).tier === null);
check("future-expiry grant counts", resolveEntitlement({ tier: null, status: null }, [g("shader", future)], NOW).tier === "shader");
check("revoked grant ignored", resolveEntitlement({ tier: null, status: null }, [g("magnum", null, past)], NOW).tier === null);
check("best of many grants", resolveEntitlement({ tier: null, status: null }, [g("liner"), g("magnum"), g("shader")], NOW).tier === "magnum");
check("entitled statuses frozen", ENTITLED_SUB_STATUSES.join(",") === "trialing,active,past_due");

console.log("\ncatalog round-trip");
process.env.STRIPE_PRICE_ARTIST_SHADER_MONTHLY = "price_a_sm";
process.env.STRIPE_PRICE_ARTIST_SHADER_ANNUAL = "price_a_sa";
process.env.STRIPE_PRICE_STUDIO_LINER_MONTHLY = "price_s_lm";
process.env.STRIPE_PRICE_STUDIO_LINER_ANNUAL = "price_s_la";
process.env.STRIPE_PRICE_STUDIO_SHADER_MONTHLY = "price_s_sm";
process.env.STRIPE_PRICE_STUDIO_SHADER_ANNUAL = "price_s_sa";
process.env.STRIPE_PRICE_STUDIO_MAGNUM_MONTHLY = "price_s_mm";
process.env.STRIPE_PRICE_STUDIO_MAGNUM_ANNUAL = "price_s_ma";

check("artist shader monthly", priceIdFor("artist", "shader", "monthly") === "price_a_sm");
check("studio magnum annual", priceIdFor("studio", "magnum", "annual") === "price_s_ma");
check("reverse lookup", JSON.stringify(lookupPrice("price_s_sa")) === JSON.stringify({ role: "studio", tier: "shader", cycle: "annual" }));
check("unknown price -> null", lookupPrice("price_nope") === null);
check("artist liner is not purchasable", (() => { try { priceIdFor("artist", "liner", "monthly"); return false; } catch { return true; } })());
check("paid tiers frozen", JSON.stringify(PAID_TIERS) === JSON.stringify({ artist: ["shader"], studio: ["liner", "shader", "magnum"] }));

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log("\nAll billing checks passed");

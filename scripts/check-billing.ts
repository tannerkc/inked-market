/** Billing invariants. Run: npx tsx scripts/check-billing.ts */
import { resolveEntitlement, ENTITLED_SUB_STATUSES } from "../lib/billing/entitlements-core";

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

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log("\nAll billing checks passed");

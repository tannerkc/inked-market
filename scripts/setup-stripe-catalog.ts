/** One-off per Stripe mode (test/live): creates 4 products + 8 prices from
 *  lib/data/signup-tiers.ts and prints the env lines to paste.
 *  Run: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/setup-stripe-catalog.ts */
import { artistTiers, studioTiers } from "../lib/data/signup-tiers";

const API = "https://api.stripe.com";
const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error("Set STRIPE_SECRET_KEY"); process.exit(1); }

async function form(path: string, params: Record<string, string>) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`);
  return (await res.json()) as { id: string };
}

async function main() {
  const lines: string[] = [];
  const catalog = [
    ...artistTiers.filter((t) => t.price > 0).map((t) => ({ role: "artist", t })),
    ...studioTiers.map((t) => ({ role: "studio", t })),
  ];
  for (const { role, t } of catalog) {
    const product = await form("/v1/products", { name: `${role === "artist" ? "Artist" : "Studio"} ${t.name}` });
    const monthly = await form("/v1/prices", {
      product: product.id, currency: "usd",
      unit_amount: String(Math.round(t.price * 100)),
      "recurring[interval]": "month",
    });
    lines.push(`STRIPE_PRICE_${role.toUpperCase()}_${t.slug.toUpperCase()}_MONTHLY=${monthly.id}`);
    if (t.annualPrice) {
      const annual = await form("/v1/prices", {
        product: product.id, currency: "usd",
        unit_amount: String(Math.round(t.annualPrice * 12 * 100)),
        "recurring[interval]": "year",
      });
      lines.push(`STRIPE_PRICE_${role.toUpperCase()}_${t.slug.toUpperCase()}_ANNUAL=${annual.id}`);
    }
  }
  console.log(lines.join("\n"));
}
void main();

/**
 * Assert-based self-checks for the builder truth model.
 * Run: npx tsx scripts/check-builder.ts
 * No test framework by design — tsx is already a devDependency.
 */
import assert from "node:assert/strict";
import { remapLegacyTemplate, LEGACY_TEMPLATE_MAP } from "../lib/utils/legacy-template";
import { templates, templateList } from "../lib/data/templates";
import type { StudioThemeConfig } from "../lib/types/builder";
import { defaultThemeConfig } from "../lib/data/theme-presets";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

// ─── Legacy template remap ───────────────────────────────────────────────
check("7 templates remain after consolidation", () => {
  assert.equal(templateList.length, 7);
  assert.ok(!("immersive-dark" in templates));
  assert.ok(!("clean-minimal" in templates));
});

check("legacy slugs remap to survivors", () => {
  assert.equal(LEGACY_TEMPLATE_MAP["immersive-dark"], "dark-cinematic");
  assert.equal(LEGACY_TEMPLATE_MAP["clean-minimal"], "studio-minimal");
});

check("remapLegacyTemplate rewrites retired slug, passes through current", () => {
  const legacy = { ...defaultThemeConfig, template: "immersive-dark" } as unknown as StudioThemeConfig;
  assert.equal(remapLegacyTemplate(legacy).template, "dark-cinematic");
  const current: StudioThemeConfig = { ...defaultThemeConfig, template: "fine-line" };
  assert.equal(remapLegacyTemplate(current).template, "fine-line");
  assert.equal(remapLegacyTemplate(current), current); // no clone when unchanged
});

console.log(`\n${passed} checks passed`);

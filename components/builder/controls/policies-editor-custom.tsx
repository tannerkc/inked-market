"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { ToggleRow } from "@/components/builder/controls/toggle-row";
import { SegmentedPicker } from "@/components/builder/controls/segmented-picker";
import { PoliciesEditor } from "@/components/builder/controls/policies-editor";
import {
  standardPolicies,
  standardPolicyOrder,
} from "@/lib/data/policy-templates";
import type { PolicyConfig, StandardPolicyId } from "@/lib/types/policies";

function usePolicyHelpers() {
  const { config, applyChange } = useBuilder();
  const policies = config.policies ?? [];

  const updatePolicy = (id: string, updates: Partial<PolicyConfig>) => {
    const next = policies.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    applyChange({ policies: next });
  };

  const addCustomPolicy = () => {
    const customCount = policies.filter((p) => p.type === "custom").length;
    const newPolicy: PolicyConfig = {
      id: `custom-${Date.now()}`,
      type: "custom",
      title: "",
      enabled: true,
      body: "",
      featured: false,
      featuredSummary: "",
      order: policies.length + customCount,
    };
    applyChange({ policies: [...policies, newPolicy] });
  };

  const removeCustomPolicy = (id: string) => {
    applyChange({ policies: policies.filter((p) => p.id !== id) });
  };

  return { policies, updatePolicy, addCustomPolicy, removeCustomPolicy };
}

function StandardPolicyTextEditor({
  policyId,
}: {
  policyId: StandardPolicyId;
}) {
  const [editing, setEditing] = useState(false);
  const { policies, updatePolicy } = usePolicyHelpers();
  const policy = policies.find((p) => p.id === policyId);
  const def = standardPolicies[policyId];

  if (!policy?.enabled) return null;

  return (
    <div className="rounded-md border border-chrome-border bg-chrome-surface/50 p-3">
      <button
        type="button"
        onClick={() => setEditing(!editing)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[11px] font-semibold text-chrome-text-light">
          {def.title}
        </span>
        <span className={cn(
          "text-[10px] transition-colors",
          editing ? "text-ink-red" : "text-chrome-text-dim hover:text-chrome-text-secondary"
        )}>
          {editing ? "Done" : "Edit"}
        </span>
      </button>
      {editing && (
        <div className="mt-3">
          <textarea
            value={policy.body}
            onChange={(e) => updatePolicy(policyId, { body: e.target.value })}
            rows={10}
            className="w-full rounded border border-chrome-border bg-chrome-surface p-2.5 text-[11px] leading-relaxed text-chrome-text-secondary outline-none transition-colors placeholder:text-chrome-text-dim/50 focus:border-ink-red resize-y"
            placeholder={`Enter ${def.title} text...`}
          />
          <button
            type="button"
            onClick={() => {
              updatePolicy(policyId, { body: def.defaultBody });
            }}
            className="mt-2 text-[10px] text-chrome-text-dim hover:text-chrome-text-secondary transition-colors"
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}

function CustomPolicyForm({
  policy,
}: {
  policy: PolicyConfig;
}) {
  const [expanded, setExpanded] = useState(!policy.title);
  const { updatePolicy, removeCustomPolicy } = usePolicyHelpers();

  return (
    <div className="rounded-md border border-chrome-border bg-chrome-surface/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-chrome-text-light"
        >
          <svg
            className={cn("h-2.5 w-2.5 transition-transform", expanded && "rotate-90")}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M4.5 3 7.5 6 4.5 9" />
          </svg>
          {policy.title || "New Policy"}
        </button>
        <button
          type="button"
          onClick={() => removeCustomPolicy(policy.id)}
          className="text-[10px] text-chrome-text-dim hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
              Policy Title
            </div>
            <input
              type="text"
              value={policy.title}
              onChange={(e) => updatePolicy(policy.id, { title: e.target.value })}
              placeholder="e.g., Touch-Up Policy"
              className="w-full rounded border border-chrome-border bg-chrome-surface px-2.5 py-1.5 text-[11px] text-chrome-text-secondary outline-none transition-colors placeholder:text-chrome-text-dim/50 focus:border-ink-red"
            />
          </div>

          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
              Policy Text
            </div>
            <textarea
              value={policy.body}
              onChange={(e) => updatePolicy(policy.id, { body: e.target.value })}
              rows={6}
              placeholder="Enter your policy text..."
              className="w-full rounded border border-chrome-border bg-chrome-surface p-2.5 text-[11px] leading-relaxed text-chrome-text-secondary outline-none transition-colors placeholder:text-chrome-text-dim/50 focus:border-ink-red resize-y"
            />
          </div>

          <div className="rounded border border-chrome-border bg-ink-black-raised p-2.5 space-y-2">
            <ToggleRow
              label="Feature on Studio Page"
              checked={policy.featured}
              onChange={(v) => updatePolicy(policy.id, { featured: v })}
            />
            {policy.featured && (
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
                  Card Summary
                </div>
                <input
                  type="text"
                  value={policy.featuredSummary ?? ""}
                  onChange={(e) =>
                    updatePolicy(policy.id, { featuredSummary: e.target.value })
                  }
                  maxLength={50}
                  placeholder="Short summary for the card (~50 chars)"
                  className="w-full rounded border border-chrome-border bg-chrome-surface px-2.5 py-1.5 text-[11px] text-chrome-text-secondary outline-none transition-colors placeholder:text-chrome-text-dim/50 focus:border-ink-red"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PoliciesEditorCustom() {
  const { config, applyChange } = useBuilder();
  const { policies, addCustomPolicy } = usePolicyHelpers();
  const customPolicies = policies.filter((p) => p.type === "custom");

  return (
    <div className="space-y-4">
      {/* Display mode + card style pickers */}
      <SegmentedPicker
        label="Policies Display"
        options={[
          { label: "Own Section", value: "section" },
          { label: "In Footer", value: "footer" },
        ]}
        value={config.policiesDisplayMode ?? "section"}
        onChange={(v) => applyChange({ policiesDisplayMode: v })}
      />

      <SegmentedPicker
        label="Card Style"
        options={[
          { label: "Grid", value: "grid" },
          { label: "Glass", value: "glass" },
          { label: "Rows", value: "rows" },
        ]}
        value={config.policiesCardStyle ?? "glass"}
        onChange={(v) => applyChange({ policiesCardStyle: v })}
      />

      <SegmentedPicker
        label="Page Layout"
        options={[
          { label: "Tabs", value: "tabs" },
          { label: "Sidebar", value: "sidebar" },
        ]}
        value={config.policiesPageLayout ?? "tabs"}
        onChange={(v) => applyChange({ policiesPageLayout: v })}
      />

      {/* Flash editor (toggles + structured fields) */}
      <PoliciesEditor />

      {/* Full text editing for standard policies */}
      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Edit Policy Text
        </div>
        <div className="space-y-2">
          {standardPolicyOrder.map((id) => (
            <StandardPolicyTextEditor key={id} policyId={id} />
          ))}
        </div>
      </div>

      {/* Custom policies */}
      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Custom Policies
        </div>
        <div className="space-y-2">
          {customPolicies.map((p) => (
            <CustomPolicyForm key={p.id} policy={p} />
          ))}
          <button
            type="button"
            onClick={addCustomPolicy}
            className="w-full rounded-lg border border-dashed border-chrome-border py-2.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim transition-colors hover:border-ink-red hover:text-ink-red"
          >
            + Add Custom Policy
          </button>
        </div>
      </div>
    </div>
  );
}

PoliciesEditorCustom.displayName = "PoliciesEditorCustom";

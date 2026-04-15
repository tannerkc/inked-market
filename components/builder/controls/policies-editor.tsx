"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { ToggleRow } from "@/components/builder/controls/toggle-row";
import { SegmentedPicker } from "@/components/builder/controls/segmented-picker";
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

  const updateStructuredField = (id: string, key: string, value: string) => {
    const policy = policies.find((p) => p.id === id);
    if (!policy) return;
    const next = policies.map((p) =>
      p.id === id
        ? { ...p, structuredFields: { ...p.structuredFields, [key]: value } }
        : p
    );
    applyChange({ policies: next });
  };

  return { policies, updatePolicy, updateStructuredField };
}

function PolicyFieldInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  inputMode?: "text" | "numeric";
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        {label}
      </div>
      <div className="flex items-center rounded border border-chrome-border bg-chrome-surface transition-colors focus-within:border-ink-red">
        {prefix && (
          <span className="pl-2.5 text-[11px] text-chrome-text-dim select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => {
            if (inputMode === "numeric") {
              const cleaned = e.target.value.replace(/[^0-9]/g, "");
              onChange(cleaned);
            } else {
              onChange(e.target.value);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent py-1.5 pr-2.5 text-[11px] text-chrome-text-secondary outline-none placeholder:text-chrome-text-dim/50",
            prefix ? "pl-1" : "pl-2.5"
          )}
        />
      </div>
    </div>
  );
}

function StandardPolicyItem({
  policyId,
  expanded,
  onToggleExpand,
}: {
  policyId: StandardPolicyId;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const { policies, updatePolicy, updateStructuredField } = usePolicyHelpers();
  const policy = policies.find((p) => p.id === policyId);
  const def = standardPolicies[policyId];

  if (!policy) return null;

  return (
    <div>
      <ToggleRow
        label={def.title}
        checked={policy.enabled}
        onChange={(v) => updatePolicy(policyId, { enabled: v })}
      />
      {policy.enabled && def.structuredFields.length > 0 && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-1 mb-1 text-[10px] text-ink-red hover:text-ink-red/80 transition-colors"
        >
          {expanded ? "Hide fields" : "Configure"}
        </button>
      )}
      {policy.enabled && expanded && def.structuredFields.length > 0 && (
        <div className="mt-2 mb-2 space-y-3 rounded-md border border-chrome-border bg-chrome-surface/50 p-3">
          {def.structuredFields.map((field) => {
            const fields = policy.structuredFields ?? {};
            if (field.showWhen && !field.showWhen(fields)) return null;

            if (field.inputType === "toggle") {
              return (
                <ToggleRow
                  key={field.key}
                  label={field.label}
                  checked={fields[field.key] === "yes"}
                  onChange={(v) =>
                    updateStructuredField(policyId, field.key, v ? "yes" : "no")
                  }
                />
              );
            }

            if (field.inputType === "segmented" && field.options) {
              return (
                <SegmentedPicker
                  key={field.key}
                  label={field.label}
                  options={field.options}
                  value={fields[field.key]}
                  onChange={(v) => updateStructuredField(policyId, field.key, v)}
                />
              );
            }

            const isCurrency = field.key === "depositAmount";
            return (
              <PolicyFieldInput
                key={field.key}
                label={field.label}
                value={fields[field.key] ?? ""}
                onChange={(v) => updateStructuredField(policyId, field.key, v)}
                placeholder={isCurrency ? "100" : undefined}
                prefix={isCurrency ? "$" : undefined}
                inputMode={isCurrency ? "numeric" : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PoliciesEditor() {
  const { config, applyChange } = useBuilder();
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <div className="rounded-lg border border-chrome-border bg-ink-black-raised p-3">
        <ToggleRow
          label="Show Policies Section"
          checked={config.showPoliciesSection ?? true}
          onChange={(v) => applyChange({ showPoliciesSection: v })}
        />
      </div>

      {/* Standard policies */}
      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Standard Policies
        </div>
        <div className="rounded-lg border border-chrome-border bg-ink-black-raised p-3 space-y-1">
          {standardPolicyOrder.map((id) => (
            <StandardPolicyItem
              key={id}
              policyId={id}
              expanded={expandedPolicy === id}
              onToggleExpand={() =>
                setExpandedPolicy(expandedPolicy === id ? null : id)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

PoliciesEditor.displayName = "PoliciesEditor";

"use client";

import type { PolicyConfig, StandardPolicyId } from "@/lib/types/policies";
import { standardPolicies } from "@/lib/data/policy-templates";

interface PolicyContentProps {
  policy: PolicyConfig;
}

function StructuredFieldCallout({ policy }: { policy: PolicyConfig }) {
  const def = standardPolicies[policy.id as StandardPolicyId];
  if (!def || def.structuredFields.length === 0) return null;

  const fields = policy.structuredFields ?? {};
  const filledFields = def.structuredFields.filter((f) => {
    if (f.showWhen && !f.showWhen(fields)) return false;
    return fields[f.key] && fields[f.key].length > 0;
  });

  if (filledFields.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}
    >
      {filledFields.map((field) => {
        const value = fields[field.key];
        let displayValue = value;
        if (field.inputType === "toggle") {
          displayValue = value === "yes" ? "Yes" : "No";
        } else if (field.key === "depositAmount" && value) {
          displayValue = `$${value}`;
        }

        return (
          <div
            key={field.key}
            style={{
              background:
                "color-mix(in srgb, var(--accent) 6%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--accent) 12%, transparent)",
              borderRadius: "var(--border-radius)",
              padding: "12px 16px",
              flex: "1 1 140px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "var(--accent)",
                fontWeight: 500,
                marginBottom: "2px",
              }}
            >
              {field.label}
            </div>
            <div
              style={{
                fontSize: "18px",
                color: "var(--text-primary)",
                fontWeight: 600,
              }}
            >
              {displayValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PolicyContent({ policy }: PolicyContentProps) {
  return (
    <div>
      {policy.type === "standard" && (
        <StructuredFieldCallout policy={policy} />
      )}
      <div
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          lineHeight: 1.7,
        }}
      >
        {policy.body.split("\n\n").map((paragraph, i) => (
          <p key={i} style={{ margin: "0 0 12px" }}>
            {paragraph.split("\n").map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

PolicyContent.displayName = "PolicyContent";

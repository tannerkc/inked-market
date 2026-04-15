"use client";

import { useState, useEffect } from "react";
import type { PolicyConfig } from "@/lib/types/policies";
import { PolicyContent } from "@/components/policies/policy-content";

interface PoliciesTabsLayoutProps {
  policies: PolicyConfig[];
}

function getHashId(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace("#", "");
}

export function PoliciesTabsLayout({ policies }: PoliciesTabsLayoutProps) {
  const [activeId, setActiveId] = useState<string>(
    policies[0]?.id ?? ""
  );

  useEffect(() => {
    const hash = getHashId();
    if (hash && policies.some((p) => p.id === hash)) {
      setActiveId(hash);
    }
  }, [policies]);

  const handleTabClick = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const activePolicy = policies.find((p) => p.id === activeId);

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border)",
          marginBottom: "24px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {policies.map((policy) => (
          <button
            key={policy.id}
            type="button"
            onClick={() => handleTabClick(policy.id)}
            style={{
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: activeId === policy.id ? 500 : 400,
              color:
                activeId === policy.id
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottomWidth: "2px",
              borderBottomStyle: "solid",
              borderBottomColor:
                activeId === policy.id ? "var(--accent)" : "transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "color 0.2s",
            }}
          >
            {policy.title}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {activePolicy && <PolicyContent policy={activePolicy} />}
    </div>
  );
}

PoliciesTabsLayout.displayName = "PoliciesTabsLayout";

"use client";

import { useState, useEffect } from "react";
import type { PolicyConfig } from "@/lib/types/policies";
import { PolicyContent } from "@/components/policies/policy-content";

interface PoliciesSidebarLayoutProps {
  policies: PolicyConfig[];
}

function getHashId(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace("#", "");
}

export function PoliciesSidebarLayout({
  policies,
}: PoliciesSidebarLayoutProps) {
  const [activeId, setActiveId] = useState<string>(
    policies[0]?.id ?? ""
  );

  useEffect(() => {
    const hash = getHashId();
    if (hash && policies.some((p) => p.id === hash)) {
      setActiveId(hash);
    }
  }, [policies]);

  const handleNavClick = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const activePolicy = policies.find((p) => p.id === activeId);

  return (
    <>
      {/* Desktop: sidebar + content */}
      <div className="hidden lg:flex" style={{ gap: "32px" }}>
        {/* Sidebar nav */}
        <div style={{ width: "180px", flexShrink: 0 }}>
          <div
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-muted)",
              marginBottom: "12px",
              fontWeight: 500,
            }}
          >
            Navigate
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {policies.map((policy) => {
              const isActive = activeId === policy.id;
              return (
                <button
                  key={policy.id}
                  type="button"
                  onClick={() => handleNavClick(policy.id)}
                  style={{
                    padding: "8px 10px",
                    fontSize: "12px",
                    fontWeight: isActive ? 500 : 400,
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                    background: isActive
                      ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                      : "transparent",
                    borderRadius: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderLeftWidth: "2px",
                    borderLeftStyle: "solid",
                    borderLeftColor: isActive ? "var(--accent)" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {policy.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activePolicy && (
            <>
              <h2
                style={{
                  fontSize: "18px",
                  fontFamily: "var(--heading-font)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                  letterSpacing: "-0.01em",
                }}
              >
                {activePolicy.title}
              </h2>
              <PolicyContent policy={activePolicy} />
            </>
          )}
        </div>
      </div>

      {/* Mobile: falls back to tabs */}
      <div className="lg:hidden">
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
              onClick={() => handleNavClick(policy.id)}
              style={{
                padding: "8px 12px",
                fontSize: "11px",
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
              }}
            >
              {policy.title}
            </button>
          ))}
        </div>
        {activePolicy && <PolicyContent policy={activePolicy} />}
      </div>
    </>
  );
}

PoliciesSidebarLayout.displayName = "PoliciesSidebarLayout";

"use client";

import { useStudioSite } from "@/components/studio-site/studio-site-context";
import {
  standardPolicies,
  standardPolicyOrder,
} from "@/lib/data/policy-templates";
import type { PolicyConfig, PoliciesCardStyle, StandardPolicyId } from "@/lib/types/policies";

interface CardData {
  label: string;
  value: string;
  detail: string;
}

function getCardsFromPolicies(policies: PolicyConfig[]): CardData[] {
  const cards: CardData[] = [];

  // Standard policies with structured fields first (in canonical order)
  for (const id of standardPolicyOrder) {
    const policy = policies.find((p) => p.id === id);
    if (!policy?.enabled || !policy.featured) continue;

    const def = standardPolicies[id as StandardPolicyId];
    if (!def || def.structuredFields.length === 0) continue;

    const fields = policy.structuredFields ?? {};
    const hasAnyField = Object.values(fields).some((v) => v && v.length > 0);
    if (!hasAnyField) continue;

    const value = def.cardValueTemplate?.(fields) ?? "";
    const detail = def.cardDetailTemplate?.(fields) ?? "";
    if (!value) continue;

    cards.push({ label: def.cardLabel, value, detail });
  }

  // Featured custom policies
  for (const policy of policies) {
    if (policy.type !== "custom" || !policy.enabled || !policy.featured) continue;
    if (!policy.featuredSummary) continue;
    cards.push({
      label: policy.title,
      value: policy.featuredSummary,
      detail: "",
    });
  }

  return cards;
}

function GridCards({ cards }: { cards: CardData[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cards.length === 1 ? "1fr" : "1fr 1fr",
        gap: 0,
      }}
    >
      {cards.map((card, i) => {
        const isRight = i % 2 === 1;
        const isBottom = i >= cards.length - (cards.length % 2 === 0 ? 2 : 1);
        return (
          <div
            key={card.label}
            style={{
              padding: "var(--element-gap) calc(var(--element-gap) * 0.8)",
              borderBottom: isBottom ? "none" : "1px solid var(--border)",
              borderLeft: isRight ? "1px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "var(--accent)",
                fontWeight: 500,
                marginBottom: "3px",
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "var(--text-primary)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {card.value}
            </div>
            {card.detail && (
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "1px",
                }}
              >
                {card.detail}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GlassCards({ cards }: { cards: CardData[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cards.length === 1 ? "1fr" : "1fr 1fr",
        gap: "10px",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: "color-mix(in srgb, var(--accent) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 12%, transparent)",
            borderRadius: "var(--border-radius-lg)",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--accent)",
              fontWeight: 500,
              marginBottom: "6px",
            }}
          >
            {card.label}
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "var(--text-primary)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {card.value}
          </div>
          {card.detail && (
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              {card.detail}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RowCards({ cards }: { cards: CardData[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {cards.map((card, i) => (
        <div
          key={card.label}
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom:
              i < cards.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-primary)",
                fontWeight: 500,
              }}
            >
              {card.label}
            </span>
            {card.detail && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {card.detail}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: "14px",
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const cardRenderers: Record<PoliciesCardStyle, React.FC<{ cards: CardData[] }>> = {
  grid: GridCards,
  glass: GlassCards,
  rows: RowCards,
};

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px 16px",
        color: "var(--text-muted)",
        fontSize: "12px",
      }}
    >
      Set up your policies to show key info here
    </div>
  );
}

export function PoliciesSection() {
  const { config, onNavigatePage } = useStudioSite();

  if (!config.showPoliciesSection) return null;
  if (config.policiesDisplayMode === "footer") return null;

  const policies = config.policies ?? [];
  const cards = getCardsFromPolicies(policies);
  const cardStyle = config.policiesCardStyle ?? "glass";
  const CardRenderer = cardRenderers[cardStyle];

  return (
    <div
      style={{
        width: "100%",
        padding: "var(--section-padding) 24px",
      }}
    >
      <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
        <div
          style={{
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "var(--text-muted)",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          Policies & Info
        </div>

        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <CardRenderer cards={cards} />
        )}

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button
            type="button"
            onClick={() => onNavigatePage("policies")}
            style={{
              color: "var(--accent)",
              fontSize: "12px",
              cursor: "pointer",
              background: "none",
              border: "none",
              font: "inherit",
            }}
          >
            View all policies &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

PoliciesSection.displayName = "PoliciesSection";

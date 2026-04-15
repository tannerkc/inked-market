// Policy types for studio website legal/policy pages

export type PoliciesDisplayMode = "section" | "footer";
export type PoliciesCardStyle = "grid" | "glass" | "rows";
export type PoliciesPageLayout = "tabs" | "sidebar";

export type StandardPolicyId =
  | "booking-deposit"
  | "cancellation-refund"
  | "aftercare"
  | "age-id"
  | "consent-waiver"
  | "health-safety"
  | "privacy"
  | "terms";

export interface PolicyConfig {
  id: string;
  type: "standard" | "custom";
  title: string;
  enabled: boolean;
  body: string;
  structuredFields?: Record<string, string>;
  featured: boolean;
  featuredSummary?: string;
  order: number;
}

export interface StructuredFieldDefinition {
  key: string;
  label: string;
  inputType: "text" | "segmented" | "toggle";
  options?: { label: string; value: string }[];
  showWhen?: (fields: Record<string, string>) => boolean;
}

export interface StandardPolicyDefinition {
  id: StandardPolicyId;
  title: string;
  structuredFields: StructuredFieldDefinition[];
  defaultBody: string;
  cardLabel: string;
  cardValueTemplate?: (fields: Record<string, string>) => string;
  cardDetailTemplate?: (fields: Record<string, string>) => string;
}

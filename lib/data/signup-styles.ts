import type { TattooStyle } from "@/lib/types";

export const tattooStyleLabels: Record<TattooStyle, string> = {
  "fine-line": "Fine Line",
  minimalist: "Minimalist",
  traditional: "Traditional",
  "neo-traditional": "Neo-Trad",
  japanese: "Japanese",
  blackwork: "Blackwork",
  realism: "Realism",
  watercolor: "Watercolor",
  geometric: "Geometric",
  portrait: "Portrait",
  dotwork: "Dotwork",
  tribal: "Tribal",
  sketch: "Sketch",
  abstract: "Abstract",
  other: "Other",
};

export const tattooStyleOptions = Object.values(tattooStyleLabels);

export const studioSpecialtyOptions = [
  "Traditional",
  "Realism",
  "Fine Line",
  "Japanese",
  "Blackwork",
  "Color Work",
  "Custom Design",
  "Cover-Ups",
  "Walk-Ins",
  "Piercing",
];

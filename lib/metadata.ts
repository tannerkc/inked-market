import type { Metadata } from "next";

export function createMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} | Inked Market`,
    description,
  };
}

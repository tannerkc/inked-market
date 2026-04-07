"use client";

import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { HelpCategoryCard } from "@/components/help";
import type { HelpCategory } from "@/lib/data/help-types";

interface HelpCategoryGridProps {
  categories: HelpCategory[];
}

export function HelpCategoryGrid({ categories }: HelpCategoryGridProps) {
  const { mode } = useTheme();
  const searchParams = useSearchParams();
  const audience = searchParams.get("audience") || "all";

  const filtered =
    audience === "all"
      ? categories
      : categories.filter((c) =>
          c.audiences.includes(audience as HelpCategory["audiences"][number])
        );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((category) => (
        <HelpCategoryCard key={category.slug} category={category} variant={mode} />
      ))}
    </div>
  );
}

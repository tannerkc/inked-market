import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { helpCategories, getCategoryBySlug } from "@/lib/data/help-categories";
import { getArticlesByCategory } from "@/lib/data/help-articles";
import { CategoryContent } from "./category-content";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return helpCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.title };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const articles = getArticlesByCategory(slug);

  const allFaqItems = articles
    .filter((a) => a.format === "faq" && a.faqItems)
    .flatMap((a) => a.faqItems!);

  const guideArticles = articles.filter(
    (a) => a.format === "guide" || a.format === "docs"
  );

  return (
    <CategoryContent
      category={category}
      guideArticles={guideArticles}
      allFaqItems={allFaqItems}
      slug={slug}
    />
  );
}

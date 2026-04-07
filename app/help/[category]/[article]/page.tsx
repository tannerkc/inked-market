import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { helpArticles, getArticle } from "@/lib/data/help-articles";
import { ArticleContent } from "./article-content";

interface ArticlePageProps {
  params: Promise<{ category: string; article: string }>;
}

export function generateStaticParams() {
  return helpArticles
    .filter((a) => a.sections && a.sections.length > 0)
    .map((a) => ({
      category: a.categorySlug,
      article: a.slug,
    }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { category, article: articleSlug } = await params;
  const article = getArticle(category, articleSlug);
  if (!article) return {};
  return { title: article.title };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, article: articleSlug } = await params;
  const article = getArticle(category, articleSlug);
  if (!article || !article.sections) notFound();

  return <ArticleContent article={article} categorySlug={category} />;
}

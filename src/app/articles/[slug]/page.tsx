import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getArticleWithHtml,
  getPublishedArticleSlugs,
  getArticleBySlug,
} from "@/lib/articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPublishedArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || !article.published) {
    return {
      title: "Article Not Found | The Market Regime Report",
    };
  }

  return {
    title: `${article.title} | The Market Regime Report`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleWithHtml(slug);

  if (!article || !article.published) {
    notFound();
  }

  return (
    <div>
      {/* Article Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <Link
            href="/articles"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            &larr; Back to Articles
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
          <time className="block mt-4 text-gray-500">
            {article.formattedDate}
          </time>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {article.image && (
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-8">
        <div
          className="prose prose-gray prose-lg max-w-none
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-gray-900 prose-a:underline hover:prose-a:text-gray-600
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:text-gray-600 prose-ol:text-gray-600
            prose-li:leading-relaxed
            prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-600 prose-blockquote:italic
            prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100"
          dangerouslySetInnerHTML={{ __html: article.htmlContent }}
        />
      </article>

      {/* Footer Navigation */}
      <footer className="border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/articles"
            className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
          >
            &larr; Back to Articles
          </Link>
        </div>
      </footer>
    </div>
  );
}

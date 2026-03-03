import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getAllPublishedArticles, getAllTags, formatDate } from "@/lib/articles";
import TagFilter from "@/components/TagFilter";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Insights on systematic investing, market regimes, and rules-based portfolio management.",
  openGraph: {
    title: "Articles | The Market Regime Report",
    description:
      "Insights on systematic investing, market regimes, and rules-based portfolio management.",
  },
};

interface ArticlesPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { tag } = await searchParams;
  const allArticles = getAllPublishedArticles();
  const allTags = getAllTags();

  const articles = tag
    ? allArticles.filter((article) => article.tags.includes(tag))
    : allArticles;

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Articles
          </h1>
          <p className="mt-2 text-gray-600">
            Insights on systematic investing, market regimes, and rules-based
            portfolio management.
          </p>
        </div>
      </section>

      {/* Tag Filter */}
      <section className="max-w-3xl mx-auto px-6 pt-8">
        <TagFilter tags={allTags} />
      </section>

      {/* Articles List */}
      <section className="max-w-3xl mx-auto px-6 py-8">
        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No articles published yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="group border-b border-gray-100 pb-8 last:border-0"
              >
                <Link href={`/articles/${article.slug}`} className="flex gap-5">
                  {article.image && (
                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <time>{formatDate(article.date)}</time>
                      <span className="text-gray-300">·</span>
                      <span>{article.readingTime} min read</span>
                    </div>
                    <h2 className="mt-1 text-lg md:text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                      {article.title}
                    </h2>
                    <p className="mt-1 text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2">
                      {article.description}
                    </p>
                    <span className="inline-block mt-2 text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

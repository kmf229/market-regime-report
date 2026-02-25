import Link from "next/link";
import { Metadata } from "next";
import { getAllPublishedArticles, formatDate } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles | The Market Regime Report",
  description:
    "Insights on systematic investing, market regimes, and rules-based portfolio management.",
  openGraph: {
    title: "Articles | The Market Regime Report",
    description:
      "Insights on systematic investing, market regimes, and rules-based portfolio management.",
    type: "website",
  },
};

export default function ArticlesPage() {
  const articles = getAllPublishedArticles();

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

      {/* Articles List */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No articles published yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-10">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="group border-b border-gray-100 pb-10 last:border-0"
              >
                <Link href={`/articles/${article.slug}`} className="block">
                  <time className="text-sm text-gray-500">
                    {formatDate(article.date)}
                  </time>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    {article.description}
                  </p>
                  <span className="inline-block mt-4 text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                    Read &rarr;
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

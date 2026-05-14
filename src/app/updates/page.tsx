import Link from "next/link";
import { Metadata } from "next";
import { getArticlesByCategory, formatDate } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Real-time commentary on regime changes, drawdowns, and how the strategy is performing.",
  openGraph: {
    title: "Updates | The Market Regime Report",
    description:
      "Real-time commentary on regime changes, drawdowns, and how the strategy is performing.",
  },
};

export default function UpdatesPage() {
  const articles = getArticlesByCategory("updates");

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Updates
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time commentary on regime changes, drawdowns, and how the strategy is performing.
          </p>
        </div>
      </section>

      {/* Blog/Changelog Feed */}
      <section className="max-w-3xl mx-auto px-6 py-8">
        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No updates published yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                <Link href={`/articles/${article.slug}`} className="block group">
                  <div className="flex items-baseline gap-4">
                    <time className="text-sm text-gray-400 font-mono flex-shrink-0 w-24">
                      {formatDate(article.date)}
                    </time>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                        {article.title}
                      </h2>
                      {(article.summary || article.description) && (
                        <p className="mt-1 text-gray-600 text-sm leading-relaxed">
                          {article.summary || article.description}
                        </p>
                      )}
                    </div>
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

import { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Statistical analysis and data science projects exploring markets, regimes, and systematic investing.",
  openGraph: {
    title: "Research | The Market Regime Report",
    description:
      "Statistical analysis and data science projects exploring markets, regimes, and systematic investing.",
  },
};

export default function ResearchPage() {
  const articles = getArticlesByCategory("research");

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Research
          </h1>
          <p className="mt-2 text-gray-600">
            Statistical analysis and data science projects exploring markets, regimes, and systematic investing.
          </p>
        </div>
      </section>

      {/* Coming Soon Message */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Research Posts Coming Soon
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Deep dives into statistical analysis, backtesting methodologies, and data science projects will be published here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="group border-b border-gray-100 pb-8 last:border-0"
              >
                {/* Article listing will go here when research posts are added */}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

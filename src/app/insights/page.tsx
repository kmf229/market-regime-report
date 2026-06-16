import { getAllPublishedArticles } from "@/lib/articles";
import InsightsFilter from "@/components/InsightsFilter";

export default function InsightsPage() {
  const allArticles = getAllPublishedArticles();

  // Determine available categories from articles
  const categories = Array.from(
    new Set(
      allArticles.map((a) => a.section || a.category).filter(Boolean)
    )
  ) as string[];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative border-b border-gray-200">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/70"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Insights
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl">
            Market commentary, strategy development, and systematic investing research.
          </p>
        </div>
      </section>

      {/* Filter and Articles (Client Component) */}
      <InsightsFilter articles={allArticles} categories={categories} />
    </div>
  );
}

export const metadata = {
  title: "Insights",
  description:
    "Market commentary, strategy development, and systematic investing research from Market Regime Capital.",
};
